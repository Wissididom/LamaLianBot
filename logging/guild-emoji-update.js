import { EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleGuildEmojiUpdate(oldEmoji, newEmoji) {
  let logChannel = await getChannelByEventName(
    newEmoji.client,
    Events.GuildEmojiUpdate,
  );
  let emojiUrl = newEmoji.imageURL();
  let embed = new EmbedBuilder()
    .setTitle("Emoji bearbeitet")
    .setDescription(
      `**Emoji <${newEmoji.animated ? "a:" : ":"}${newEmoji.name}:${newEmoji.id}> ([${newEmoji.name} - ${newEmoji.id}](${emojiUrl})) bearbeitet**`,
    );
  if (oldEmoji.animated != newEmoji.animated) {
    embed.addFields({
      name: "Animiert",
      value: `${oldEmoji.animated ? "Ja" : "Nein"} -> ${newEmoji.animated ? "Ja" : "Nein"}`,
      inline: true,
    });
  }
  if (oldEmoji.author != newEmoji.author) {
    embed.addFields({
      name: "Author",
      value: `<@${oldEmoji.author.id}> (${oldEmoji.author.name} - ${oldEmoji.author.id}) -> <@${newEmoji.author.id}> (${newEmoji.author.name} - ${newEmoji.author.id})`,
      inline: true,
    });
  }
  if (oldEmoji.identifier != newEmoji.identifier) {
    embed.addFields({
      name: "Identifier",
      value: `\`${oldEmoji.identifier}\` -> \`${newEmoji.identifier}\``,
      inline: true,
    });
  }
  if (oldEmoji.managed != newEmoji.managed) {
    embed.addFields({
      name: "Von einer Anwendung verwaltet",
      value: `${oldEmoji.managed ? "Ja" : "Nein"} -> ${newEmoji.managed ? "Ja" : "Nein"}`,
      inline: true,
    });
  }
  if (oldEmoji.name != newEmoji.name) {
    embed.addFields({
      name: "Name",
      value: `\`${oldEmoji.name}\` -> \`${newEmoji.name}>\``,
      inline: true,
    });
  }
  if (oldEmoji.requiresColon != newEmoji.requiresColon) {
    embed.addFields({
      name: "Doppelpunkt erforderlich",
      value: `${oldEmoji.requiresColon ? "Ja" : "Nein"} -> ${newEmoji.requiresColon ? "Ja" : "Nein"}`,
      inline: true,
    });
  }
  embed.setTimestamp();
  await logChannel.send({
    embeds: [embed],
  });
}