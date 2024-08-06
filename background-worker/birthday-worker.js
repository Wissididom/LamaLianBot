import { DateTime, Interval } from "luxon";
import { fetchMember } from "../utils.js";
import { Role } from "discord.js";

async function sendMessage(client, channelId, userId, message) {
  if (channelId) {
    let channel = await client.channels.fetch(channelId);
    await channel.send({ content: message, allowed_mentions: { parse: [] } });
  } else if (userId) {
    let user = await client.users.fetch(userId);
    await user.send({ content: message, allowed_mentions: { parse: [] } });
  } else {
    console.log("Error: Channel and User is null or undefined!");
  }
}

async function giveRole(member, role, db) {
  if (member && role) {
    let result = await member.roles.add(role);
    let date = DateTime.now().setZone(process.env.BIRTHDAY_TIMEZONE); //.plus({ days: 1 });
    if (db)
      db.addRole(
        member.id,
        role instanceof Role ? role.id : role,
        date.year,
        date.month,
        date.day,
      );
    return result;
  } else {
    return null;
  }
}

let exportObj = {
  name: "birthday",
  description:
    "background worker that runs every hour to send birthday wishing messages",
  interval: 1 * 60 * 1000,
  runInterval: async (intervalObj, client, db) => {
    const currentDate = DateTime.now().setZone(process.env.BIRTHDAY_TIMEZONE);
    let roles = await db.getRoles(
      currentDate.year,
      currentDate.month,
      currentDate.day,
    );
    for (let role of roles) {
      let member = await fetchMember(
        (await client.guilds.fetch(process.env.GUILD)).members,
        role.userId,
      );
      await member.roles.remove(role.roleId);
      await db.deleteRole(role.id);
    }
    let birthdays = await db.getBirthdays();
    for (let birthday of birthdays) {
      if (currentDate.hour != parseInt(process.env.BIRTHDAY_WISHING_HOUR))
        continue;
      test = 1;
      let birthDateTime = DateTime.fromObject(
        {
          day: birthday.day,
          month: birthday.month,
          year: birthday.year ?? currentDate.year,
          hour: 0,
          minute: 0,
          second: 0,
        },
        {
          zone: process.env.BIRTHDAY_TIMEZONE,
        },
      );
      let setAge = false;
      if (birthday.year) setAge = true;
      let age = Math.floor(
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
              await sendMessage(
                client,
                process.env.BIRTHDAY_WISHING_CHANNEL,
                birthday.userId,
                process.env.BIRTHDAY_WISHING_MESSAGE_WITH_AGE.replace(
                  "<mention>",
                  `<@${birthday.userId}>`,
                )
                  .replace("<age>", age)
                  .replace("\\n", "\n"),
              );
            } else {
              await sendMessage(
                client,
                process.env.BIRTHDAY_WISHING_CHANNEL,
                birthday.userId,
                process.env.BIRTHDAY_WISHING_MESSAGE.replace(
                  "<mention>",
                  `<@${birthday.userId}>`,
                ).replace("\\n", "\n"),
              );
            }
            let member = await fetchMember(
              (await client.guilds.fetch(process.env.GUILD)).members,
              birthday.userId,
            );
            giveRole(member, process.env.BIRTHDAY_ROLE_ID, db);
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
          await sendMessage(
            client,
            process.env.BIRTHDAY_WISHING_CHANNEL,
            birthday.userId,
            process.env.BIRTHDAY_WISHING_MESSAGE_WITH_AGE.replace(
              "<mention>",
              `<@${birthday.userId}>`,
            )
              .replace("<age>", age)
              .replace("\\n", "\n"),
          );
        } else {
          await sendMessage(
            client,
            process.env.BIRTHDAY_WISHING_CHANNEL,
            birthday.userId,
            process.env.BIRTHDAY_WISHING_MESSAGE.replace(
              "<mention>",
              `<@${birthday.userId}>`,
            ).replace("\\n", "\n"),
          );
        }
        let member = await fetchMember(
          (await client.guilds.fetch(process.env.GUILD)).members,
          birthday.userId,
        );
        giveRole(member, process.env.BIRTHDAY_ROLE_ID, db);
      }
    }
  },
};

export default exportObj;
