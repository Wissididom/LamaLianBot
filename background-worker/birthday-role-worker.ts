import { DateTime } from "luxon";
import { fetchMember } from "../utils.ts";
import { Client, Collection, GuildMember, RoleResolvable } from "discord.js";
import Database from "../database/sqlite.ts";

async function giveRole(member: GuildMember, role: RoleResolvable) {
  if (member && role) {
    return await member.roles.add(role);
  } else {
    return null;
  }
}

function mapValuesToArray(map: Collection<string, GuildMember>) {
  return [...map].map(([, value]) => value);
}

const exportObj = {
  name: "birthday-role",
  description: "background worker that gives and removes birthday roles",
  cron: "0 0 0 * * *", // At midnight
  run: async (client: Client, db: Database) => {
    const currentDate = DateTime.now().setZone(
      Deno.env.get("BIRTHDAY_TIMEZONE"),
    );
    if (!Deno.env.has("GUILD") || !Deno.env.get("BIRTHDAY_ROLE_ID")) return;
    const guild = await client.guilds.fetch(Deno.env.get("GUILD")!);
    const role = await guild.roles.fetch(Deno.env.get("BIRTHDAY_ROLE_ID")!);
    if (!role) return;
    const membersWithRolesToRemove = mapValuesToArray(
      role.members,
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
              guild.members,
              birthday.userId,
            );
            if (member) {
              giveRole(member, Deno.env.get("BIRTHDAY_ROLE_ID")!);
              const index = membersWithRolesToRemove.findIndex(
                (item) => item.id == member.id,
              );
              if (index >= 0) {
                membersWithRolesToRemove.splice(index, 1);
              }
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
          (await client.guilds.fetch(Deno.env.get("GUILD")!)).members,
          birthday.userId,
        );
        if (member) {
          giveRole(member, Deno.env.get("BIRTHDAY_ROLE_ID")!);
          const index = membersWithRolesToRemove.findIndex(
            (item) => item.id == member.id,
          );
          if (index >= 0) {
            membersWithRolesToRemove.splice(index, 1);
          }
        }
      }
    }
    for (const member of membersWithRolesToRemove) {
      console.log(`Remove role from ${member.id} (${member.user?.username})`);
      await member.roles.remove(Deno.env.get("BIRTHDAY_ROLE_ID")!);
    }
  },
};

export default exportObj;
