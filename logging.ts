import { ChannelType, Client, TextChannel } from "discord.js";
import { fileExists } from "./utils.ts";

export { default as handleApplicationCommandPermissionsUpdate } from "./logging/application-command-permissions-update.ts";
export { default as handleAutoModerationActionExecution } from "./logging/auto-moderation-action-execution.ts";
export { default as handleAutoModerationRuleCreate } from "./logging/auto-moderation-rule-create.ts";
export { default as handleAutoModerationRuleDelete } from "./logging/auto-moderation-rule-delete.ts";
export { default as handleAutoModerationRuleUpdate } from "./logging/auto-moderation-rule-update.ts";
export { default as handleChannelCreate } from "./logging/channel-create.ts";
export { default as handleChannelDelete } from "./logging/channel-delete.ts";
export { default as handleChannelPinsUpdate } from "./logging/channel-pins-update.ts";
export { default as handleChannelUpdate } from "./logging/channel-update.ts";
export { default as handleGuildEmojiCreate } from "./logging/guild-emoji-create.ts";
export { default as handleGuildEmojiDelete } from "./logging/guild-emoji-delete.ts";
export { default as handleGuildEmojiUpdate } from "./logging/guild-emoji-update.ts";
export { default as handleGuildBanAdd } from "./logging/guild-ban-add.ts";
export { default as handleGuildBanRemove } from "./logging/guild-ban-remove.ts";
export { default as handleGuildMemberAdd } from "./logging/guild-member-add.ts";
export { default as handleGuildMemberRemove } from "./logging/guild-member-remove.ts";
export { default as handleGuildMemberUpdate } from "./logging/guild-member-update.ts";
export { default as handleGuildUpdate } from "./logging/guild-update.ts";
export { default as handleInviteCreate } from "./logging/invite-create.ts";
export { default as handleInviteDelete } from "./logging/invite-delete.ts";
export { default as handleMessageDelete } from "./logging/message-delete.ts";
export { default as handleMessageBulkDelete } from "./logging/message-bulk-delete.ts";
export { default as handleMessageUpdate } from "./logging/message-update.ts";
export { default as handleGuildRoleCreate } from "./logging/guild-role-create.ts";
export { default as handleGuildRoleDelete } from "./logging/guild-role-delete.ts";
export { default as handleGuildRoleUpdate } from "./logging/guild-role-update.ts";
export { default as handleStageInstanceCreate } from "./logging/stage-instance-create.ts";
export { default as handleStageInstanceDelete } from "./logging/stage-instance-delete.ts";
export { default as handleStageInstanceUpdate } from "./logging/stage-instance-update.ts";
export { default as handleGuildStickerCreate } from "./logging/guild-sticker-create.ts";
export { default as handleGuildStickerDelete } from "./logging/guild-sticker-delete.ts";
export { default as handleGuildStickerUpdate } from "./logging/guild-sticker-update.ts";
export { default as handleUserUpdate } from "./logging/user-update.ts";
export { default as handleVoiceStateUpdate } from "./logging/voice-state-update.ts";
export { default as handleWebhooksUpdate } from "./logging/webhooks-update.ts";

const logChannels: { [key: string]: TextChannel } = {};

export async function getChannelByEventName(client: Client, eventName: string) {
  if (!(await fileExists("./log-config.ts"))) {
    console.error(
      "log-config.ts doesn't exist! Please copy log-config.example.ts to log-config.ts and adjust it's values!",
    );
    Deno.exit(1);
    return;
  }
  const logConfig = (await import("./log-config.ts")).default;
  //console.log(logConfig);
  for (const event of logConfig.events) {
    if (event.name == eventName) {
      if (event.channel) {
        if (!(event.channel in logChannels)) {
          const channel = await client.channels.fetch(
            event.channel,
          );
          if (channel instanceof TextChannel) {
            logChannels[event.channel] = channel;
          }
        }
        return logChannels[event.channel];
      } else {
        if (!(logConfig.loggingChannel in logChannels)) {
          const channel = await client.channels.fetch(
            logConfig.loggingChannel,
          );
          if (channel instanceof TextChannel) {
            logChannels[logConfig.loggingChannel] = channel;
          }
        }
        return logChannels[logConfig.loggingChannel];
      }
    }
  }
  return logChannels[logConfig.loggingChannel];
}

export function getChannelTypeAsString(type: ChannelType) {
  switch (type) {
    case ChannelType.AnnouncementThread:
      return "Ankündigungsthread";
    case ChannelType.DM:
      return "DM";
    case ChannelType.GroupDM:
      return "Gruppen-DM";
    case ChannelType.GuildAnnouncement:
      return "Ankündigungskanal";
    case ChannelType.GuildCategory:
      return "Kategorie";
    case ChannelType.GuildDirectory:
      return "Kanal im Student Hub";
    case ChannelType.GuildForum:
      return "Forum";
    case ChannelType.GuildMedia:
      return "Medienkanal";
    case ChannelType.GuildStageVoice:
      return "Stage-Kanal";
    case ChannelType.GuildText:
      return "Textkanal";
    case ChannelType.GuildVoice:
      return "Sprachkanal";
    case ChannelType.PrivateThread:
      return "privater Thread";
    case ChannelType.PublicThread:
      return "öffentlicher Thread";
    default:
      return "N/A";
  }
}
