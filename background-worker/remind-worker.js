import { DateTime, Interval } from "luxon";
import { fetchMember } from "../utils.js";

async function sendMessage(client, userId, message) {
  if (userId) {
    const user = await client.users.fetch(userId);
    await user.send({ content: message, allowedMentions: { parse: [] } });
  } else {
    console.log("Error: User is null or undefined!");
  }
}

const exportObj = {
  name: "remind",
  description: "background worker that sends reminder messages",
  cron: `0 * * * * *`,
  run: async (client, db) => {
    const upcomingReminder = await db.getUpcomingReminder();
    for (const reminder of upcomingReminder) {
      try {
        const now = new Date();
        if (
          reminder.day == now.getDate() &&
          reminder.month == now.getMonth() + 1 &&
          reminder.year == now.getFullYear() &&
          reminder.hour == now.getHours() &&
          reminder.minute == now.getMinutes()
        ) {
          await sendMessage(
            client,
            reminder.userId,
            `Reminder: ${reminder.topic}`,
          );
          await db.deleteReminder(reminder.id);
          await db.deleteOldReminders();
        }
      } catch (err) {
        console.log(`Error: ${err}`);
      }
    }
  },
};

export default exportObj;
