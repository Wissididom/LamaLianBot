import { DateTime, Interval } from "luxon";
import { fetchMember } from "../utils.ts";
import { Client } from "discord.js";
import Database from "../database/sqlite.ts";

async function sendMessage(
  client: Client,
  channelId: string,
  userId: string,
  message: string,
) {
  if (channelId) {
    const channel = await client.channels.fetch(channelId);
    if (channel && channel.isSendable()) {
      await channel.send({ content: message, allowedMentions: { parse: [] } });
    } else {
      console.log("Couldn't send birthday message");
    }
  } else if (userId) {
    const user = await client.users.fetch(userId);
    await user.send({ content: message, allowedMentions: { parse: [] } });
  } else {
    console.log("Error: Channel and User is null or undefined!");
  }
}

const exportObj = {
  name: "birthday-message",
  description: "background worker that sends birthday wishing messages",
  cron: `0 0 ${Deno.env.get("BIRTHDAY_WISHING_HOUR")} * * *`,
  run: async (client: Client, db: Database) => {
    if (!Deno.env.has("GUILD")) return;
    const currentDate = DateTime.now().setZone(
      Deno.env.get("BIRTHDAY_TIMEZONE"),
    );
    const birthdays = await db.getBirthdays();
    const guild = await client.guilds.fetch(Deno.env.get("GUILD")!);
    for (const birthday of birthdays) {
      const member = await fetchMember(
        guild.members,
        birthday.userId,
      );
      if (!member) {
        console.log(`${birthday.userId} couldn't be found on server`);
        continue;
      }
      const birthDateTime = DateTime.fromObject(
        {
          day: birthday.day,
          month: birthday.month,
          year: birthday.year ?? currentDate.year,
          hour: 0,
          minute: 0,
          second: 0,
        },
        {
          zone: Deno.env.get("BIRTHDAY_TIMEZONE"),
        },
      );
      let setAge = false;
      if (birthday.year) setAge = true;
      const age = Math.floor(
        Interval.fromDateTimes(birthDateTime, currentDate).length("years"),
      );
      if (birthday.day == 29 && birthday.month == 2) {
        // Is Leap Year?
        if (
          currentDate.year % 100 === 0
            ? currentDate.year % 400 === 0
            : currentDate.year % 4 === 0
        ) {
          if (currentDate.month == 3 && currentDate.day == 1) {
            // Post on March 1st if it is a leap year
            if (setAge) {
              const birthdayWishingChannel = Deno.env.get(
                "BIRTHDAY_WISHING_CHANNEL",
              );
              const birthdayWishingMessage = Deno.env.get(
                "BIRTHDAY_WISHING_MESSAGE_WITH_AGE",
              );
              if (!birthdayWishingChannel || !birthdayWishingMessage) {
                console.log(
                  "Either birthdayWishingChannel or birthdayWishingMessage missing! (leap year with age)",
                );
                return;
              }
              await sendMessage(
                client,
                birthdayWishingChannel,
                birthday.userId,
                birthdayWishingMessage.replace(
                  "<mention>",
                  `<@${birthday.userId}>`,
                )
                  .replace("<age>", age.toString())
                  .replace("\\n", "\n"),
              );
            } else {
              const birthdayWishingChannel = Deno.env.get(
                "BIRTHDAY_WISHING_CHANNEL",
              );
              const birthdayWishingMessage = Deno.env.get(
                "BIRTHDAY_WISHING_MESSAGE",
              );
              if (!birthdayWishingChannel || !birthdayWishingMessage) {
                console.log(
                  "Either birthdayWishingChannel or birthdayWishingMessage missing! (leap year without age)",
                );
                return;
              }
              await sendMessage(
                client,
                birthdayWishingChannel,
                birthday.userId,
                birthdayWishingMessage.replace(
                  "<mention>",
                  `<@${birthday.userId}>`,
                ).replace("\\n", "\n"),
              );
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
        if (setAge) {
          const birthdayWishingChannel = Deno.env.get(
            "BIRTHDAY_WISHING_CHANNEL",
          );
          const birthdayWishingMessage = Deno.env.get(
            "BIRTHDAY_WISHING_MESSAGE_WITH_AGE",
          );
          if (!birthdayWishingChannel || !birthdayWishingMessage) {
            console.log(
              "Either birthdayWishingChannel or birthdayWishingMessage missing! (normal year with age)",
            );
            return;
          }
          await sendMessage(
            client,
            birthdayWishingChannel,
            birthday.userId,
            birthdayWishingMessage.replace(
              "<mention>",
              `<@${birthday.userId}>`,
            )
              .replace("<age>", age.toString())
              .replace("\\n", "\n"),
          );
        } else {
          const birthdayWishingChannel = Deno.env.get(
            "BIRTHDAY_WISHING_CHANNEL",
          );
          const birthdayWishingMessage = Deno.env.get(
            "BIRTHDAY_WISHING_MESSAGE",
          );
          if (!birthdayWishingChannel || !birthdayWishingMessage) {
            console.log(
              "Either birthdayWishingChannel or birthdayWishingMessage missing! (normal year without age)",
            );
            return;
          }
          await sendMessage(
            client,
            birthdayWishingChannel,
            birthday.userId,
            birthdayWishingMessage.replace(
              "<mention>",
              `<@${birthday.userId}>`,
            ).replace("\\n", "\n"),
          );
        }
      }
    }
  },
};

export default exportObj;
