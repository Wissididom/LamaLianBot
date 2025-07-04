import {
  AttachmentBuilder,
  EmbedBuilder,
  Events,
  GuildEmoji,
} from "discord.js";
import { getChannelByEventName } from "../logging.ts";

export default async function handleGuildEmojiCreate(emoji: GuildEmoji) {
  const logChannel = await getChannelByEventName(
    emoji.client,
    Events.GuildEmojiCreate,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  const createdTimestamp = Math.floor(
    new Date(emoji.createdTimestamp).getTime() / 1000,
  );
  const author = emoji.managed
    ? null
    : emoji.author
    ? emoji.author
    : await emoji.fetchAuthor();
  const emojiUrl = emoji.imageURL();
  const emojiAttachment = new AttachmentBuilder(emojiUrl, {
    name: "emoji.gif",
  });
  const embed = new EmbedBuilder()
    .setTitle("Emoji erstellt")
    .setDescription(
      `**Emoji <${
        emoji.animated ? "a:" : ":"
      }${emoji.name}:${emoji.id}> ([${emoji.name}](${emojiUrl})) erstellt**`,
    )
    .setFields(
      {
        name: "Animiert",
        value: emoji.animated ? "Ja" : "Nein",
        inline: true,
      },
      {
        name: "Autor",
        value: emoji.managed || !author
          ? "N/A"
          : `<@${author.id}> (\`${author.displayName}\` - \`${author.username}\` - ${author.id})`,
        inline: false,
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
        value: emoji.name ?? "N/A",
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
  await logChannel.send({
    embeds: [embed],
    files: [emojiAttachment],
  });
}
