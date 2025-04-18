import { DateTime } from "luxon";
import { fetchMember } from "../utils.js";
import process from "node:process";

async function giveRole(member, role) {
  if (member && role) {
    return await member.roles.add(role);
  } else {
    return null;
  }
}

function mapValuesToArray(map) {
  return [...map].map(([, value]) => value);
}

const exportObj = {
  name: "birthday-role",
  description: "background worker that gives and removes birthday roles",
  cron: "0 0 0 * * *", // At midnight
  run: async (client, db) => {
    const currentDate = DateTime.now().setZone(process.env.BIRTHDAY_TIMEZONE);
    const membersWithRolesToRemove = mapValuesToArray(
      (
        await (
          await client.guilds.fetch(process.env.GUILD)
        ).roles.fetch(process.env.BIRTHDAY_ROLE_ID)
      ).members,
    );
    const birthdays = await db.getBirthdays();
    for (const birthday of birthdays) {
      if (birthday.day == 29 && birthday.month == 2) {
        // Is Leap Year?
        if (
          currentDate.year % 100 === 0
            ? currentDate.year % 400 === 0
            : currentDate.year % 4 === 0
        ) {
          if (currentDate.month == 3 && currentDate.day == 1) {
            // Post on March 1st if it is a leap year
            const member = await fetchMember(
              (await client.guilds.fetch(process.env.GUILD)).members,
              birthday.userId,
            );
            giveRole(member, process.env.BIRTHDAY_ROLE_ID, db);
            const index = membersWithRolesToRemove.findIndex(
              (item) => item.id == member.id,
            );
            if (index >= 0) {
              membersWithRolesToRemove.splice(index, 1);
            }
            continue; // Skip further execution
          }
        }
      }
      if (
        birthday.day == currentDate.day &&
        birthday.month == currentDate.month
      ) {
        // it's their birthday...
        const member = await fetchMember(
          (await client.guilds.fetch(process.env.GUILD)).members,
          birthday.userId,
        );
        giveRole(member, process.env.BIRTHDAY_ROLE_ID, db);
        const index = membersWithRolesToRemove.findIndex(
          (item) => item.id == member.id,
        );
        if (index >= 0) {
          membersWithRolesToRemove.splice(index, 1);
        }
      }
    }
    for (const member of membersWithRolesToRemove) {
      console.log(`Remove role from ${member.id} (${member.user?.username})`);
      await member.roles.remove(process.env.BIRTHDAY_ROLE_ID);
    }
  },
};

export default exportObj;
