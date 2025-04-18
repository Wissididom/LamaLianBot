import BirthdayRoleWorker from "./birthday-role-worker.ts";
import BirthdayMessageWorker from "./birthday-message-worker.ts";
import RemindWorker from "./remind-worker.ts";
import { schedule } from "node-cron";
import process from "node:process";
import { Client } from "discord.js";
import Database from "../database/sqlite.ts";

export function scheduleWorkers(client: Client, db: Database) {
  const workerNames = ["birthday-role", "birthday-message", "remind"];
  for (const workerName of workerNames) {
    scheduleWorker(workerName, client, db);
  }
}

export function scheduleWorker(name: string, client: Client, db: Database) {
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

export function getWorker(name: string) {
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
