import { AttachmentBuilder, EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleMessageUpdate(oldMessage, newMessage) {
  if (newMessage.author.id == newMessage.client.user.id) {
    return; // Don't handle messages sent by the bot itself
  }
  const logChannel = await getChannelByEventName(
    newMessage.client,
    Events.MessageUpdate,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  const timestamp = Math.floor(new Date(newMessage.createdTimestamp) / 1000);
  let author = newMessage.member
    ? `<@${newMessage.member.id}> (\`${newMessage.member.displayName}\` - \`${newMessage.member.user.username}\` - ${newMessage.member.id})`
    : newMessage.author
    ? `<@${newMessage.author.id}> (\`${newMessage.author.displayName}\` - \`${newMessage.author.username}\` - ${newMessage.author.id})`
    : "N/A";
  if (oldMessage.content == newMessage.content) {
    // Don't handle event if content is the same
    return;
  }
  let description;
  if (oldMessage.content) {
    if (newMessage.content) {
      description =
        `**alte Nachricht**:\n${oldMessage.content}\n\n**neue Nachricht**:\n${newMessage.content}`;
    } else {
      description = `**alte Nachricht**:\n${oldMessage.content}`;
    }
  } else {
    if (newMessage.content) {
      description = `**neue Nachricht**:\n${newMessage.content}`;
    } else {
      description = "";
    }
  }
  const memberAvatarAttachment = new AttachmentBuilder(
    newMessage.member
      ? newMessage.member.displayAvatarURL({ dynamic: true })
      : newMessage.author?.displayAvatarURL({ dynamic: true }),
    { name: "avatar.gif" },
  );
  await logChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Nachricht bearbeitet")
        .setDescription(description)
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
        .setThumbnail("attachment://avatar.gif")
        .setFooter({
          text: `Nutzer-ID: ${
            newMessage.member ? newMessage.member.id : newMessage.author.id
          }`,
        })
        .setTimestamp(),
    ],
    files: [memberAvatarAttachment],
  });
}
