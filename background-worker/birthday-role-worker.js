import { DateTime } from "luxon";
import { fetchMember } from "../utils.js";

async function giveRole(member, role) {
  if (member && role) {
    let result = await member.roles.add(role);
    return result;
  } else {
    return null;
  }
}

let exportObj = {
  name: "birthday-role",
  description: "background worker that gives and removes birthday roles",
  cron: "0 * * * * *", // At midnight
  run: async (client, db) => {
    const currentDate = DateTime.now().setZone(process.env.BIRTHDAY_TIMEZONE);
    let membersWithRolesToRemove = (
      await (
        await client.guilds.fetch(process.env.GUILD)
      ).roles.fetch(process.env.BIRTHDAY_ROLE_ID)
    ).members;
    let birthdays = await db.getBirthdays();
    for (let birthday of birthdays) {
      if (birthday.day == 29 && birthday.month == 2) {
        // Is Leap Year?
        if (
          currentDate.year % 100 === 0
            ? currentDate.year % 400 === 0
            : currentDate.year % 4 === 0
        ) {
          if (currentDate.month == 3 && currentDate.day == 1) {
            // Post on March 1st if it is a leap year
            let member = await fetchMember(
              (await client.guilds.fetch(process.env.GUILD)).members,
              birthday.userId,
            );
            giveRole(member, process.env.BIRTHDAY_ROLE_ID, db);
            let index = membersWithRolesToRemove.findIndex(
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
        let member = await fetchMember(
          (await client.guilds.fetch(process.env.GUILD)).members,
          birthday.userId,
        );
        giveRole(member, process.env.BIRTHDAY_ROLE_ID, db);
        let index = membersWithRolesToRemove.findIndex(
          (item) => item.id == member.id,
        );
        if (index >= 0) {
          membersWithRolesToRemove.splice(index, 1);
        }
      }
    }
    for (let [id, member] of membersWithRolesToRemove) {
      console.log(`Remove role from ${id} (${member.username})`);
      await member.roles.remove(process.env.BIRTHDAY_ROLE_ID);
    }
  },
};

export default exportObj;
