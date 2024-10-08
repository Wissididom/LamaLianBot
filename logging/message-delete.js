import { EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleMessageDelete(message) {
  let logChannel = await getChannelByEventName(
    message.client,
    Events.MessageDelete,
  );
  let timestamp = Math.floor(new Date(message.createdTimestamp) / 1000);
  let author = message.member
    ? message.member.displayName
    : message.author
      ? message.author.displayName
      : "N/A";
  if (message.member || message.author) {
    author += ` (<@${message.member ? message.member.id : message.author.id}> - ${message.member ? message.member.id : message.author.id})`;
  }
  await logChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Nachricht gelöscht")
        .setDescription(
          `**Nachricht**:\n${message.content ? message.content : "N/A"}`,
        )
        .setFields(
          {
            name: "Kanal",
            value: `${message.channel.name} (<#${message.channel.id}>)`,
            inline: true,
          },
          {
            name: "Nachrichten-ID",
            value: `[${message.id}](${message.url})`,
            inline: true,
          },
          {
            name: "Nachrichtenautor",
            value: author,
            inline: true,
          },
          {
            name: "Nachricht erstellt",
            value: `<t:${timestamp}:F> (<t:${timestamp}:R>)`,
            inline: true,
          },
        )
        .setTimestamp(),
    ],
  });
}
