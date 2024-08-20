import { EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleGuildEmojiDelete(emoji) {
  let logChannel = await getChannelByEventName(
    emoji.client,
    Events.GuildEmojiDelete,
  );
  let createdTimestamp = Math.floor(new Date(emoji.createdTimestamp) / 1000);
  let author = emoji.author ? emoji.author : null;
  let emojiUrl = emoji.imageURL();
  await logChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Emoji gelöscht")
        .setDescription(
          `**Emoji <${emoji.animated ? "a:" : ":"}${emoji.name}:${emoji.id}> ([${emoji.name} - ${emoji.id}](${emojiUrl})) gelöscht**`,
        )
        .setFields(
          {
            name: "Animiert",
            value: emoji.animated ? "Ja" : "Nein",
            inline: true,
          },
          {
            name: "Autor",
            value: `<@${author?.id ? author?.id : "N/A"}> (${author?.name ? author?.name : "N/A"} - ${author?.id ? author?.id : "N/A"})`,
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
        .setTimestamp(),
    ],
  });
}
