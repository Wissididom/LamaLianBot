import {
  AttachmentBuilder,
  AuditLogEvent,
  EmbedBuilder,
  Events,
} from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleGuildEmojiDelete(emoji) {
  const logChannel = await getChannelByEventName(
    emoji.client,
    Events.GuildEmojiDelete,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  const createdTimestamp = Math.floor(new Date(emoji.createdTimestamp) / 1000);
  const emojiUrl = emoji.imageURL();
  const emojiAttachment = new AttachmentBuilder(emojiUrl, {
    name: "emoji.gif",
  });
  const embed = new EmbedBuilder()
    .setTitle("Emoji gelöscht")
    .setDescription(
      `**Emoji <${emoji.animated ? "a:" : ":"}${emoji.name}:${emoji.id}> ([${emoji.name}](${emojiUrl})) gelöscht**`,
    )
    .setFields(
      {
        name: "Animiert",
        value: emoji.animated ? "Ja" : "Nein",
        inline: true,
      },
      {
        name: "Erstellzeit",
        value: `<t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)`,
        inline: true,
      },
      {
        name: "Identifier",
        value: `\`${emoji.identifier}\``,
        inline: true,
      },
      {
        name: "Von einer Anwendung verwaltet",
        value: emoji.managed ? "Ja" : "Nein",
        inline: true,
      },
      {
        name: "Name",
        value: emoji.name,
        inline: true,
      },
      {
        name: "Doppelpunkt erforderlich",
        value: emoji.requiresColons ? "Ja" : "Nein",
        inline: true,
      },
      {
        name: "URL",
        value: emojiUrl,
        inline: true,
      },
    )
    .setThumbnail("attachment://emoji.gif")
    .setFooter({ text: `Emoji-ID: ${emoji.id}` })
    .setTimestamp();
  const deleter = await fetchDeleter(emoji);
  if (deleter) {
    embed.addFields({
      name: "Moderator",
      value: `<@${deleter.id}> (\`${deleter.displayName}\` - \`${deleter.username}\` - \`${deleter.id}\`)`,
      inline: false,
    });
  }
  await logChannel.send({
    embeds: [embed],
    files: [emojiAttachment],
  });
}

async function fetchDeleter(emoji) {
  const fetchedLogs = await emoji.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.EmojiDelete,
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
