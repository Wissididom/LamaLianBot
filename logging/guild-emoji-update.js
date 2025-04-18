import {
  AttachmentBuilder,
  AuditLogEvent,
  EmbedBuilder,
  Events,
} from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleGuildEmojiUpdate(oldEmoji, newEmoji) {
  const logChannel = await getChannelByEventName(
    newEmoji.client,
    Events.GuildEmojiUpdate,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  const emojiUrl = newEmoji.imageURL();
  const emojiAttachment = new AttachmentBuilder(emojiUrl, {
    name: "emoji.gif",
  });
  const embed = new EmbedBuilder()
    .setTitle("Emoji bearbeitet")
    .setDescription(
      `**Emoji <${
        newEmoji.animated ? "a:" : ":"
      }${newEmoji.name}:${newEmoji.id}> ([${newEmoji.name}](${emojiUrl})) bearbeitet**`,
    )
    .setThumbnail("attachment://emoji.gif")
    .setFooter({ text: `Emoji-ID: ${newEmoji.id}` })
    .setTimestamp();
  if (oldEmoji.animated != newEmoji.animated) {
    embed.addFields({
      name: "Animiert",
      value: `${oldEmoji.animated ? "Ja" : "Nein"} -> ${
        newEmoji.animated ? "Ja" : "Nein"
      }`,
      inline: true,
    });
  }
  if (oldEmoji.identifier != newEmoji.identifier) {
    embed.addFields({
      name: "Identifier",
      value: `\`${oldEmoji.identifier}\` -> \`${newEmoji.identifier}\``,
      inline: false,
    });
  }
  if (oldEmoji.managed != newEmoji.managed) {
    embed.addFields({
      name: "Von einer Anwendung verwaltet",
      value: `${oldEmoji.managed ? "Ja" : "Nein"} -> ${
        newEmoji.managed ? "Ja" : "Nein"
      }`,
      inline: true,
    });
  }
  if (oldEmoji.name != newEmoji.name) {
    embed.addFields({
      name: "Name",
      value: `\`${oldEmoji.name}\` -> \`${newEmoji.name}\``,
      inline: true,
    });
  }
  if (oldEmoji.requiresColon != newEmoji.requiresColon) {
    embed.addFields({
      name: "Doppelpunkt erforderlich",
      value: `${oldEmoji.requiresColon ? "Ja" : "Nein"} -> ${
        newEmoji.requiresColon ? "Ja" : "Nein"
      }`,
      inline: true,
    });
  }
  const updater = await fetchUpdater(newEmoji);
  if (updater) {
    embed.addFields({
      name: "Moderator",
      value:
        `<@${updater.id}> (\`${updater.displayName}\` - \`${updater.username}\` - \`${updater.id}\`)`,
      inline: false,
    });
  }
  await logChannel.send({
    embeds: [embed],
    files: [emojiAttachment],
  });
}

async function fetchUpdater(emoji) {
  const fetchedLogs = await emoji.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.EmojiUpdate,
  });
  const emojiLog = fetchedLogs.entries.first();
  if (!emojiLog) {
    return null;
  }
  const { executor, target } = emojiLog;
  if (target.id == emoji.id) {
    return executor;
  } else {
    return null;
  }
}
