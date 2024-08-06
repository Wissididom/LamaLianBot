import "dotenv/config";
import {
  ActivityType,
  Client,
  Events,
  GatewayIntentBits,
  Partials,
} from "discord.js";

import { getDatabase, handleApplicationCommands } from "./commands.js";
import { moderate } from "./moderation.js";
import { runWorkers } from "./background-worker/background-worker.js";

const exitHandler = async (signal) => {
  console.log(`Received ${signal}`);
  await getDatabase().close();
  process.exit(0);
};

process.on("SIGINT", exitHandler);
process.on("SIGTERM", exitHandler);
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await getDatabase().close();
  process.exit(1);
});
process.on("exit", async (code) => {
  console.log(`Process exited with code: ${code}`);
  await getDatabase().close();
});

const client = new Client({
  intents: [
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
  ],
});

client.on(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user?.tag}`);
  client.user?.setActivity({
    name: "twitch.tv/lamalian",
    type: ActivityType.Watching,
  });
  let db = getDatabase();
  await runWorkers(client, db);
});

client.on(Events.MessageCreate, async (msg) => {
  if (msg.author.system) {
    return; // Ignore system messages
  } else if (msg.author.bot) {
    return; // Ignore bot messages
  } else {
    await moderate(msg);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  await handleApplicationCommands(interaction);
});

if (!process.env.DISCORD_TOKEN) {
  console.log(
    "DISCORD_TOKEN not found! You must specify your Discord bot token as DISCORD_TOKEN environment variable or put it in a `.env` file.",
  );
} else {
  client.login(process.env.DISCORD_TOKEN);
}
