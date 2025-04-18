import BirthdayRoleWorker from "./birthday-role-worker.js";
import BirthdayMessageWorker from "./birthday-message-worker.js";
import RemindWorker from "./remind-worker.js";
import { schedule } from "node-cron";
import process from "node:process";

export function scheduleWorkers(client, db) {
  const workerNames = ["birthday-role", "birthday-message", "remind"];
  for (const workerName of workerNames) {
    scheduleWorker(workerName, client, db);
  }
}

export function scheduleWorker(name, client, db) {
  const worker = getWorker(name);
  if (worker) {
    console.log(`Schedule ${name} worker for cron "${worker.cron}"`);
    schedule(
      worker.cron,
      async () => {
        await worker.run(client, db);
      },
      {
        scheduled: true,
        timezone: process.env.BIRTHDAY_TIMEZONE,
      },
    );
  }
}

export function getWorker(name) {
  switch (name) {
    case "birthday-role":
      return BirthdayRoleWorker;
    case "birthday-message":
      return BirthdayMessageWorker;
    case "remind":
      return RemindWorker;
    default:
      return null;
  }
}
