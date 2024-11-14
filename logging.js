import { ChannelType } from "discord.js";
import logConfig from "./log-config.js";

export { default as handleApplicationCommandPermissionsUpdate } from "./logging/application-command-permissions-update.js";
export { default as handleAutoModerationActionExecution } from "./logging/auto-moderation-action-execution.js";
export { default as handleAutoModerationRuleCreate } from "./logging/auto-moderation-rule-create.js";
export { default as handleAutoModerationRuleDelete } from "./logging/auto-moderation-rule-delete.js";
export { default as handleAutoModerationRuleUpdate } from "./logging/auto-moderation-rule-update.js";
export { default as handleChannelCreate } from "./logging/channel-create.js";
export { default as handleChannelDelete } from "./logging/channel-delete.js";
export { default as handleChannelPinsUpdate } from "./logging/channel-pins-update.js";
export { default as handleChannelUpdate } from "./logging/channel-update.js";
export { default as handleGuildEmojiCreate } from "./logging/guild-emoji-create.js";
export { default as handleGuildEmojiDelete } from "./logging/guild-emoji-delete.js";
export { default as handleGuildEmojiUpdate } from "./logging/guild-emoji-update.js";
export { default as handleGuildBanAdd } from "./logging/guild-ban-add.js";
export { default as handleGuildBanRemove } from "./logging/guild-ban-remove.js";
export { default as handleGuildMemberAdd } from "./logging/guild-member-add.js";
export { default as handleGuildMemberRemove } from "./logging/guild-member-remove.js";
export { default as handleGuildMemberUpdate } from "./logging/guild-member-update.js";
export { default as handleGuildUpdate } from "./logging/guild-update.js";
export { default as handleInviteCreate } from "./logging/invite-create.js";
export { default as handleInviteDelete } from "./logging/invite-delete.js";
export { default as handleMessageDelete } from "./logging/message-delete.js";
export { default as handleMessageBulkDelete } from "./logging/message-bulk-delete.js";
export { default as handleMessageUpdate } from "./logging/message-update.js";
export { default as handleGuildRoleCreate } from "./logging/guild-role-create.js";
export { default as handleGuildRoleDelete } from "./logging/guild-role-delete.js";
export { default as handleGuildRoleUpdate } from "./logging/guild-role-update.js";
export { default as handleStageInstanceCreate } from "./logging/stage-instance-create.js";
export { default as handleStageInstanceDelete } from "./logging/stage-instance-delete.js";
export { default as handleStageInstanceUpdate } from "./logging/stage-instance-update.js";
export { default as handleGuildStickerCreate } from "./logging/guild-sticker-create.js";
export { default as handleGuildStickerDelete } from "./logging/guild-sticker-delete.js";
export { default as handleGuildStickerUpdate } from "./logging/guild-sticker-update.js";
export { default as handleUserUpdate } from "./logging/user-update.js";
export { default as handleVoiceStateUpdate } from "./logging/voice-state-update.js";
export { default as handleWebhooksUpdate } from "./logging/webhooks-update.js";

var logChannels = [];

export async function getChannelByEventName(client, eventName) {
  for (let event of logConfig.events) {
    if (event.name == eventName) {
      if (event.channel) {
        if (!(event.channel in logChannels)) {
          logChannels[event.channel] = await client.channels.fetch(
            event.channel,
          );
        }
        return logChannels[event.channel];
      } else {
        if (!(logConfig.loggingChannel in logChannels)) {
          logChannels[logConfig.loggingChannel] = await client.channels.fetch(
            logConfig.loggingChannel,
          );
        }
        return logChannels[logConfig.loggingChannel];
      }
    }
  }
  return logChannels[logConfig.loggingChannel];
}

export function getChannelTypeAsString(type) {
  switch (type) {
    case ChannelType.AnnouncementThread:
      return "Anknündigungsthread";
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
