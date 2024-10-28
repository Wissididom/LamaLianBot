import BirthdayRoleWorker from "./birthday-role-worker.js";
import BirthdayMessageWorker from "./birthday-message-worker.js";
import { schedule } from "node-cron";

export async function scheduleWorkers(client, db) {
  let workerNames = ["birthday-role", "birthday-message"];
  for (let workerName of workerNames) {
    await scheduleWorker(workerName, client, db);
  }
}

export async function scheduleWorker(name, client, db) {
  let worker = getWorker(name);
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
    default:
      return null;
  }
}
