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
} from "./logging.js";

const exitHandler = async (signal) => {
  console.log(`Received ${signal}`);
  await getDatabase().close();
  process.exit(0);
};

let LOGGING_CHANNEL = null;

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
  LOGGING_CHANNEL = await client.channels.fetch(process.env.LOGGING_CHANNEL);
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

client.on(Events.ApplicationCommandPermissionsUpdate, async (data) =>
  handleApplicationCommandPermissionsUpdate(LOGGING_CHANNEL, data),
);

client.on(
  Events.AutoModerationActionExecution,
  async (autoModerationActionExecution) =>
    handleAutoModerationActionExecution(
      LOGGING_CHANNEL,
      autoModerationActionExecution,
    ),
);

client.on(Events.AutoModerationRuleCreate, async (autoModerationRule) =>
  handleAutoModerationRuleCreate(LOGGING_CHANNEL, autoModerationRule),
);

client.on(Events.AutoModerationRuleDelete, async (autoModerationRule) =>
  handleAutoModerationRuleDelete(LOGGING_CHANNEL, autoModerationRule),
);

client.on(
  Events.AutoModerationRuleUpdate,
  async (oldAutoModerationRule, newAutoModerationRule) =>
    handleAutoModerationRuleUpdate(
      LOGGING_CHANNEL,
      oldAutoModerationRule,
      newAutoModerationRule,
    ),
);

client.on(Events.ChannelCreate, async (channel) =>
  handleChannelCreate(LOGGING_CHANNEL, channel),
);

client.on(Events.ChannelDelete, async (channel) =>
  handleChannelDelete(LOGGING_CHANNEL, channel),
);

client.on(Events.ChannelPinsUpdate, async (channel, time) =>
  handleChannelPinsUpdate(LOGGING_CHANNEL, channel, time),
);

client.on(Events.ChannelUpdate, async (oldChannel, newChannel) =>
  handleChannelUpdate(LOGGING_CHANNEL, oldChannel, newChannel),
);

client.on(Events.GuildEmojiCreate, async (emoji) =>
  handleGuildEmojiCreate(LOGGING_CHANNEL, emoji),
);

client.on(Events.GuildEmojiDelete, async (emoji) =>
  handleGuildEmojiDelete(LOGGING_CHANNEL, emoji),
);

client.on(Events.GuildEmojiUpdate, async (oldEmoji, newEmoji) =>
  handleGuildEmojiUpdate(LOGGING_CHANNEL, oldEmoji, newEmoji),
);

client.on(Events.GuildBanAdd, async (ban) =>
  handleGuildBanAdd(LOGGING_CHANNEL, ban),
);

client.on(Events.GuildBanRemove, async (ban) =>
  handleGuildBanRemove(LOGGING_CHANNEL, ban),
);

client.on(Events.GuildMemberAdd, async (member) => {
  // TODO: Maybe Welcome messages
  return await handleGuildMemberAdd(LOGGING_CHANNEL, member);
});

client.on(Events.GuildMemberRemove, async (member) =>
  handleGuildMemberRemove(LOGGING_CHANNEL, member),
);

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) =>
  handleGuildMemberUpdate(LOGGING_CHANNEL, oldMember, newMember),
);

client.on(Events.GuildUpdate, async (oldGuild, newGuild) =>
  handleGuildUpdate(LOGGING_CHANNEL, oldGuild, newGuild),
);

client.on(Events.InviteCreate, async (invite) =>
  handleInviteCreate(LOGGING_CHANNEL, invite),
);

client.on(Events.InviteDelete, async (invite) =>
  handleInviteDelete(LOGGING_CHANNEL, invite),
);

client.on(Events.MessageDelete, async (message) =>
  handleMessageDelete(LOGGING_CHANNEL, message),
);

client.on(Events.MessageBulkDelete, async (messages, channel) =>
  handleMessageBulkDelete(LOGGING_CHANNEL, messages, channel),
);

client.on(Events.MessageUpdate, async (oldMessage, newMessage) =>
  handleMessageUpdate(LOGGING_CHANNEL, oldMessage, newMessage),
);

client.on(Events.GuildRoleCreate, async (role) =>
  handleGuildRoleCreate(LOGGING_CHANNEL, role),
);

client.on(Events.GuildRoleDelete, async (role) =>
  handleGuildRoleDelete(LOGGING_CHANNEL, role),
);

client.on(Events.GuildRoleUpdate, async (oldRole, newRole) =>
  handleGuildRoleUpdate(LOGGING_CHANNEL, oldRole, newRole),
);

client.on(Events.StageInstanceCreate, async (stageInstance) =>
  handleStageInstanceCreate(LOGGING_CHANNEL, stageInstance),
);

client.on(Events.StageInstanceDelete, async (stageInstance) =>
  handleStageInstanceDelete(LOGGING_CHANNEL, stageInstance),
);

client.on(
  Events.StageInstanceUpdate,
  async (oldStageInstance, newStageInstance) =>
    handleStageInstanceUpdate(
      LOGGING_CHANNEL,
      oldStageInstance,
      newStageInstance,
    ),
);

client.on(Events.GuildStickerCreate, async (sticker) =>
  handleGuildStickerCreate(LOGGING_CHANNEL, sticker),
);

client.on(Events.GuildStickerDelete, async (sticker) =>
  handleGuildStickerDelete(LOGGING_CHANNEL, sticker),
);

client.on(Events.GuildStickerUpdate, async (oldSticker, newSticker) =>
  handleGuildStickerUpdate(LOGGING_CHANNEL, oldSticker, newSticker),
);

client.on(Events.UserUpdate, async (oldUser, newUser) =>
  handleUserUpdate(LOGGING_CHANNEL, oldUser, newUser),
);

client.on(Events.VoiceStateUpdate, async (oldState, newState) =>
  handleVoiceStateUpdate(LOGGING_CHANNEL, oldState, newState),
);

client.on(Events.WebhooksUpdate, async (channel) =>
  handleWebhooksUpdate(LOGGING_CHANNEL, channel),
);

if (!process.env.DISCORD_TOKEN) {
  console.log(
    "DISCORD_TOKEN not found! You must specify your Discord bot token as DISCORD_TOKEN environment variable or put it in a `.env` file.",
  );
} else {
  client.login(process.env.DISCORD_TOKEN);
}
