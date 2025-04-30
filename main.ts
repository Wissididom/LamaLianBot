import {
  ActivityType,
  Client,
  Events,
  GatewayIntentBits,
  GuildMember,
  Interaction,
  Message,
  Partials,
} from "discord.js";

import { getDatabase, handleApplicationCommands } from "./commands.ts";
import { moderate } from "./moderation.ts";
import { scheduleWorkers } from "./background-worker/background-worker.ts";
import {
  handleApplicationCommandPermissionsUpdate,
  handleAutoModerationActionExecution,
  handleAutoModerationRuleCreate,
  handleAutoModerationRuleDelete,
  handleAutoModerationRuleUpdate,
  handleChannelCreate,
  handleChannelDelete,
  handleChannelPinsUpdate,
  handleChannelUpdate,
  handleGuildBanAdd,
  handleGuildBanRemove,
  handleGuildEmojiCreate,
  handleGuildEmojiDelete,
  handleGuildEmojiUpdate,
  handleGuildMemberAdd,
  handleGuildMemberRemove,
  handleGuildMemberUpdate,
  handleGuildRoleCreate,
  handleGuildRoleDelete,
  handleGuildRoleUpdate,
  handleGuildStickerCreate,
  handleGuildStickerDelete,
  handleGuildStickerUpdate,
  handleGuildUpdate,
  handleInviteCreate,
  handleInviteDelete,
  handleMessageBulkDelete,
  handleMessageDelete,
  handleMessageUpdate,
  handleStageInstanceCreate,
  handleStageInstanceDelete,
  handleStageInstanceUpdate,
  handleUserUpdate,
  handleVoiceStateUpdate,
  handleWebhooksUpdate,
} from "./logging.ts";
import { handleLevelling } from "./levelling.ts";

const exitHandler = async (signal: string) => {
  console.log(`Received ${signal}`);
  await getDatabase().close();
  Deno.exit(0);
};

Deno.addSignalListener("SIGINT", () => exitHandler("SIGINT"));
Deno.addSignalListener("SIGTERM", () => exitHandler("SIGTERM"));
addEventListener("error", async (event) => {
  console.error("Uncaught Exception:", event.error);
  await getDatabase().close();
  Deno.exit(1);
});

const client = new Client({
  intents: [
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildExpressions,
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

client.on(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user?.tag}`);
  client.user?.setActivity({
    name: "twitch.tv/lamalian",
    type: ActivityType.Watching,
  });
  scheduleWorkers(client, getDatabase());
});

client.on(Events.MessageCreate, async (msg: Message) => {
  if (msg.author.system) {
    return; // Ignore system messages
  } else if (msg.author.bot) {
    return; // Ignore bot messages
  } else {
    if (await moderate(msg)) {
      if (Deno.env.get("USE_LEVELLING")?.toLowerCase() == "true") {
        await handleLevelling(getDatabase(), msg);
      }
    }
  }
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  await handleApplicationCommands(interaction);
});

client.on(
  Events.ApplicationCommandPermissionsUpdate,
  handleApplicationCommandPermissionsUpdate,
);

client.on(
  Events.AutoModerationActionExecution,
  handleAutoModerationActionExecution,
);

client.on(Events.AutoModerationRuleCreate, handleAutoModerationRuleCreate);

client.on(Events.AutoModerationRuleDelete, handleAutoModerationRuleDelete);

client.on(Events.AutoModerationRuleUpdate, handleAutoModerationRuleUpdate);

client.on(Events.ChannelCreate, handleChannelCreate);

client.on(Events.ChannelDelete, handleChannelDelete);

client.on(Events.ChannelPinsUpdate, handleChannelPinsUpdate);

client.on(Events.ChannelUpdate, handleChannelUpdate);

client.on(Events.GuildEmojiCreate, handleGuildEmojiCreate);

client.on(Events.GuildEmojiDelete, handleGuildEmojiDelete);

client.on(Events.GuildEmojiUpdate, handleGuildEmojiUpdate);

client.on(Events.GuildBanAdd, handleGuildBanAdd);

client.on(Events.GuildBanRemove, handleGuildBanRemove);

client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
  // TODO: Maybe Welcome messages
  return await handleGuildMemberAdd(member);
});

client.on(Events.GuildMemberRemove, handleGuildMemberRemove);

client.on(Events.GuildMemberUpdate, handleGuildMemberUpdate);

client.on(Events.GuildUpdate, handleGuildUpdate);

client.on(Events.InviteCreate, handleInviteCreate);

client.on(Events.InviteDelete, handleInviteDelete);

client.on(Events.MessageDelete, handleMessageDelete);

client.on(Events.MessageBulkDelete, handleMessageBulkDelete);

client.on(Events.MessageUpdate, handleMessageUpdate);

client.on(Events.GuildRoleCreate, handleGuildRoleCreate);

client.on(Events.GuildRoleDelete, handleGuildRoleDelete);

client.on(Events.GuildRoleUpdate, handleGuildRoleUpdate);

client.on(Events.StageInstanceCreate, handleStageInstanceCreate);

client.on(Events.StageInstanceDelete, handleStageInstanceDelete);

client.on(Events.StageInstanceUpdate, handleStageInstanceUpdate);

client.on(Events.GuildStickerCreate, handleGuildStickerCreate);

client.on(Events.GuildStickerDelete, handleGuildStickerDelete);

client.on(Events.GuildStickerUpdate, handleGuildStickerUpdate);

client.on(Events.UserUpdate, handleUserUpdate);

client.on(Events.VoiceStateUpdate, handleVoiceStateUpdate);

client.on(Events.WebhooksUpdate, handleWebhooksUpdate);

if (!Deno.env.has("DISCORD_TOKEN")) {
  console.log(
    "DISCORD_TOKEN not found! You must specify your Discord bot token as DISCORD_TOKEN environment variable or put it in a `.env` file.",
  );
} else {
  client.login(Deno.env.get("DISCORD_TOKEN"));
}
