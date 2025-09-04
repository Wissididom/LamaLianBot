import { DateTime } from "luxon";
import { fetchMember } from "../utils.ts";
import { Client, Collection, GuildMember, RoleResolvable } from "discord.js";
import Database from "../database/sqlite.ts";

function isLeapYear(year: number): boolean {
  return year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
}

function isLeapBirthdayFallback(currentDate: DateTime): boolean {
  return isLeapYear(currentDate.year) && currentDate.month === 3 &&
    currentDate.daay === 1;
}

function getMembersArray(
  map: Collection<string, GuildMember>,
): GuildMember[] {
  return Array.from(map.values());
}

async function giveRole(member: GuildMember, role: RoleResolvable) {
  try {
    await member.roles.add(role);
  } catch (err) {
    console.warn(`Failed to add role to ${member.id}:`, err);
  }
}

async function removeRole(member: GuildMember, role: RoleResolvable) {
  try {
    await member.roles.remove(role);
  } catch (err) {
    console.warn(`Failed to remove role from ${member.id}:`, err);
  }
}

const exportObj = {
  name: "birthday-role",
  description: "background worker that gives and removes birthday roles",
  cron: "0 0 0 * * *", // Midnight
  run: async (client: Client, db: Database) => {
    const guildId = Deno.env.get("GUILD");
    const roleId = Deno.env.get("BIRTHDAY_ROLE_ID");
    const timezone = Deno.env.get("BIRTHDAY_TIMEZONE");
    if (!guildId || !roleId || !timezone) return;
    const currentDate = DateTime.now().setZone(timezone);
    const guild = await client.guilds.fetch(guildId);
    const role = await guild.roles.fetch(roleId);
    if (!role) {
      console.warn("Birthday role not found.");
      return;
    }
    const membersWithRole = getMembersArray(role.members);
    const birthdays = await db.getBirthdays();
    for (const birthday of birthdays) {
      const isLeapDay = birthday.day === 29 && birthday.month === 2;
      const isBirthdayToday = birthday.day === currentDate.day &&
        birthday.month === currentDate.month;
      const shouldAssign = isBirthdayToday ||
        (isLeapDay && isLeapBirthdayFallback(currentDate));
      if (!shouldAssign) continue;
      const member: GuildMember | null = await fetchMember(
        guild.members,
        birthday.userId,
      );
      if (!member) {
        console.warn("birthday member couldn't be fetched or doesn't exist");
        continue;
      }
      await giveRole(member, roleId);
      const index = membersWithRole.findIndex((m) => m.id === member.id);
      if (index >= 0) membersWithRole.splice(index, 1);
    }
    for (const member of membersWithRole) {
      await removeRole(member, roleId);
    }
  },
};

export default exportObj;
