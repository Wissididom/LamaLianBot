import { DateTime, Interval } from "luxon";
import { fetchMember, isLeapYearFallbackToday } from "../utils.ts";
import { Client, GuildMember } from "discord.js";
import Database from "../database/sqlite.ts";

function getBirthdayMessage(userId: string, age?: number): string | null {
  const hasAge = typeof age === "number";
  const template = Deno.env.get(
    hasAge ? "BIRTHDAY_WISHING_MESSAGE_WITH_AGE" : "BIRTHDAY_WISHING_MESSAGE",
  );
  if (!template) return null;
  let msg = template.replace("<mention>", `<@${userId}>`);
  if (hasAge) msg = msg.replace("<age>", age.toString());
  return msg.replace("\\n", "\n");
}

async function trySendBirthdayMessage(
  client: Client,
  userId: string,
  age?: number,
) {
  const channelId = Deno.env.get("BIRTHDAY_WISHING_CHANNEL");
  if (!channelId) {
    console.warn("Missing BIRTHDAY_WISHING_CHANNEL");
    return;
  }
  const message = getBirthdayMessage(userId, age);
  if (!message) {
    console.warn("Missing birthday message template");
    return;
  }
  await sendMessage(client, channelId, userId, message);
}

async function sendMessage(
  client: Client,
  channelId: string | null,
  userId: string | null,
  message: string,
) {
  try {
    if (channelId) {
      const channel = await client.channels.fetch(channelId);
      if (channel && channel.isTextBased() && "send" in channel) {
        await channel.send({
          content: message,
          allowedMentions: { parse: [] },
        });
        return;
      } else {
        console.log("Channel is not text based");
        return;
      }
    }
    if (userId) {
      const user = await client.users.fetch(userId);
      if (user && "send" in user) {
        await user.send({
          content: message,
          allowedMentions: { parse: [] },
        });
        return;
      } else {
        console.log("Couldn't send DM");
        return;
      }
    }
  } catch (err) {
    console.log("Failed to send message:", err);
  }
}

const exportObj = {
  name: "birthday-message",
  description: "background worker that sends birthday wishing messages",
  cron: `0 0 ${Deno.env.get("BIRTHDAY_WISHING_HOUR")} * * *`,
  run: async (client: Client, db: Database) => {
    const guildId = Deno.env.get("GUILD");
    const timezone = Deno.env.get("BIRTHDAY_TIMEZONE");
    if (!guildId || !timezone) return;
    const currentDate = DateTime.now().setZone(timezone);
    const guild = await client.guilds.fetch(guildId);
    const birthdays = await db.getBirthdays();
    for (const birthday of birthdays) {
      const member: GuildMember | null = await fetchMember(
        guild.members,
        birthday.userId,
      );
      if (!member) {
        console.log(`User ${birthday.userId} couldn't be found on server`);
        continue;
      }
      const birthDate = DateTime.fromObject(
        {
          day: birthday.day,
          month: birthday.month,
          year: birthday.year ?? currentDate.year,
        },
        { zone: timezone },
      );
      const isLeapDay = birthday.day === 29 && birthday.month === 2;
      const isBirthdayToday = birthday.day === currentDate.day &&
        birthday.month === currentDate.month;
      const shouldWish = isBirthdayToday ||
        (isLeapDay && isLeapYearFallbackToday(currentDate));
      if (!shouldWish) continue;
      const age = birthday.year != null
        ? Math.floor(
          Interval.fromDateTimes(birthDate, currentDate).length("years"),
        )
        : undefined;
      await trySendBirthdayMessage(client, birthday.userId, age);
    }
  },
};

export default exportObj;
