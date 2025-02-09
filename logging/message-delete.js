import { AttachmentBuilder, EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleMessageDelete(message) {
  const logChannel = await getChannelByEventName(
    message.client,
    Events.MessageDelete,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  const timestamp = Math.floor(new Date(message.createdTimestamp) / 1000);
  const author = message.member
    ? `<@${message.member.id}> (\`${message.member.displayName}\` - \`${message.member.user.username}\` - ${message.member.id})`
    : message.author
      ? `<@${message.author.id}> (\`${message.author.displayName}\` - \`${message.author.username}\` - ${message.author.id})`
      : "N/A";
  const memberAvatarAttachment = new AttachmentBuilder(
    message.member
      ? message.member.displayAvatarURL({ dynamic: true })
      : message.author?.displayAvatarURL({ dynamic: true }),
    { name: "avatar.gif" },
  );
  const embed = new EmbedBuilder()
    .setTitle("Nachricht gelöscht")
    .setFields(
      {
        name: "Kanal",
        value: `<#${message.channel.id}> (${message.channel.name})`,
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
    .setThumbnail("attachment://avatar.gif")
    .setFooter({
      text: `Nutzer-ID: ${(message.member ? message.member.id : message.author?.id) ?? "N/A"}`,
    })
    .setTimestamp();
  if (message.content) {
    embed.setDescription(`**Nachricht**:\n${message.content}`);
  }
  const attachment = message.attachments.first();
  if (attachment && attachment.contentType.startsWith("image/")) {
    const imageAttachment = new AttachmentBuilder(attachment.url, {
      name: attachment.name,
    });
    embed.setImage(`attachment://${attachment.name}`);
    await logChannel.send({
      embeds: [embed],
      files: [memberAvatarAttachment, imageAttachment],
    });
  } else {
    await logChannel.send({
      embeds: [embed],
      files: [memberAvatarAttachment],
    });
  }
}
