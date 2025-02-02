import { AuditLogEvent, EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName, getChannelTypeAsString } from "../logging.js";

export default async function handleChannelUpdate(oldChannel, newChannel) {
  const logChannel = await getChannelByEventName(
    newChannel.client,
    Events.ChannelUpdate,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  const description = `**Kanal <#${newChannel.id}> (${newChannel.name}) bearbeitet**`;
  const embed = new EmbedBuilder()
    .setTitle("Kanal bearbeitet")
    .setDescription(description)
    .setFooter({ text: `Kanal-ID: ${newChannel.id}` })
    .setTimestamp();
  if (oldChannel.topic != newChannel.topic) {
    if (oldChannel.topic.trim() == "") {
      if (newChannel.topic.trim() != "") {
        embed.setDescription(
          description +
            `\n\nVorher:\nN/A\n\nNachher:\n\`\`\`${newChannel.topic}\`\`\``,
        );
      }
    } else {
      if (newChannel.topic.trim() == "") {
        embed.setDescription(
          description +
            `\n\nVorher:\n\`\`\`${oldChannel.topic}\`\`\`\nNachher:\nN/A`,
        );
      }
    }
  }
  if (oldChannel.name != newChannel.name) {
    embed.addFields({
      name: "Name",
      value: `\`${oldChannel.name}\` -> \`${newChannel.name}\``,
      inline: false,
    });
  }
  if (oldChannel.parent?.id != newChannel.parent?.id) {
    embed.addFields({
      name: "Name",
      value: `\`${oldChannel.parent?.name}\` (${oldChannel.parent?.id}) -> \`${oldChannel.parent?.name}\` (${oldChannel.parent?.id})`,
      inline: false,
    });
  }
  if (oldChannel.position != newChannel.position) {
    embed.addFields({
      name: "Position",
      value: `#${oldChannel.position} -> #${newChannel.position}`,
      inline: false,
    });
  }
  if (oldChannel.type != newChannel.type) {
    embed.addFields({
      name: "Typ",
      value: `${getChannelTypeAsString(oldChannel.type)} -> ${getChannelTypeAsString(newChannel.type)}`,
      inline: false,
    });
  }
  const updater = await fetchUpdater(newChannel);
  if (updater) {
    embed.addFields({
      name: "Moderator",
      value: `<@${updater.id}> (\`${updater.displayName}\` - \`${updater.username}\` - \`${updater.id}\`)`,
      inline: false,
    });
  }
  await logChannel.send({
    embeds: [embed],
  });
}

async function fetchUpdater(channel) {
  const fetchedLogs = await channel.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.ChannelUpdate,
  });
  const channelUpdateLog = fetchedLogs.entries.first();
  if (!channelUpdateLog) {
    return null;
  }
  const { executor, target } = channelUpdateLog;
  if (target.id == channel.id) {
    return executor;
  } else {
    return null;
  }
}
