import { EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleMessageUpdate(oldMessage, newMessage) {
  let logChannel = await getChannelByEventName(
    newMessage.client,
    Events.MessageUpdate,
  );
  let timestamp = Math.floor(new Date(newMessage.createdTimestamp) / 1000);
  let author = newMessage.member
    ? newMessage.member.displayName
    : newMessage.author
      ? newMessage.author.displayName
      : "N/A";
  if (newMessage.member || newMessage.author) {
    author += ` (<@${newMessage.member ? newMessage.member.id : newMessage.author.id}> - ${newMessage.member ? newMessage.member.id : newMessage.author.id})`;
  }
  if (oldMessage.content == newMessage.content) {
    // Don't handle event if content is the same
    return;
  }
  await logChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Nachricht bearbeitet")
        .setDescription(
          `**alte Nachricht**:\n${oldMessage.content ? oldMessage.content : "N/A"}\n\n**neue Nachricht**:\n${newMessage.content ? newMessage.content : "N/A"}`,
        )
        .setFields(
          {
            name: "Kanal",
            value: `${newMessage.channel.name} (<#${newMessage.channel.id}>)`,
            inline: true,
          },
          {
            name: "Nachrichten-ID",
            value: `[${newMessage.id}](${newMessage.url})`,
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
