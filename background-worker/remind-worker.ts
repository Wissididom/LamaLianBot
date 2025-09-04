import { Client } from "discord.js";
import { DateTime } from "luxon";
import Database from "../database/sqlite.ts";

async function sendMessage(client: Client, userId: string, message: string) {
  if (userId) {
    const user = await client.users.fetch(userId);
    await user.send({ content: message, allowedMentions: { parse: [] } });
  } else {
    console.log(`Failed to send message to user ${userId}!`);
  }
}

const exportObj = {
  name: "remind",
  description: "background worker that sends reminder messages",
  cron: `* * * * * *`,
  run: async (client: Client, db: Database) => {
    const reminders = await db.getUpcomingReminder();
    const now = DateTime.now().startOf("second");
    let foundReminder = false;
    for (const reminder of reminders) {
      try {
        const reminderTime = DateTime.fromObject({
          year: reminder.year,
          month: reminder.month,
          day: reminder.day,
          hour: reminder.hour,
          minute: reminder.minute,
          second: reminder.second,
        });
        if (reminderTime.equals(now)) {
          await sendMessage(
            client,
            reminder.userId,
            `Reminder: ${reminder.topic}`,
          );
          await db.deleteReminder(reminder.id);
          foundReminder = true;
        }
      } catch (err) {
        console.error(`Error processing reminder ${reminder.id}:`, err);
      }
    }
    if (foundReminder) {
      await db.deleteOldReminders();
    }
  },
};

export default exportObj;
