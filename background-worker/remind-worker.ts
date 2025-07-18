import { Client } from "discord.js";
import Database from "../database/sqlite.ts";

async function sendMessage(client: Client, userId: string, message: string) {
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
  cron: `* * * * * *`,
  run: async (client: Client, db: Database) => {
    const upcomingReminder = await db.getUpcomingReminder();
    for (const reminder of upcomingReminder) {
      try {
        const now = new Date();
        if (
          reminder.day == now.getDate() &&
          reminder.month == now.getMonth() + 1 &&
          reminder.year == now.getFullYear() &&
          reminder.hour == now.getHours() &&
          reminder.minute == now.getMinutes() &&
          reminder.second == now.getSeconds()
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
