import { DateTime, Interval } from "luxon";

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

let exportObj = {
  name: "birthday-message",
  description: "background worker that sends birthday wishing messages",
  cron: `0 0 ${process.env.BIRTHDAY_WISHING_HOUR} * * *`,
  run: async (client, db) => {
    const currentDate = DateTime.now().setZone(process.env.BIRTHDAY_TIMEZONE);
    let birthdays = await db.getBirthdays();
    for (let birthday of birthdays) {
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
      }
    }
  },
};

export default exportObj;
