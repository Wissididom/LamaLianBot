import { AuditLogEvent, EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName, getChannelTypeAsString } from "../logging.js";

export default async function handleChannelDelete(channel) {
  const logChannel = await getChannelByEventName(
    channel.client,
    Events.ChannelDelete,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  const createdTimestamp = Math.floor(
    new Date(channel.createdTimestamp) / 1000,
  );
  let parent = "Keine Kategorie";
  if (channel.parent) {
    parent = `${channel.parent.name} (${channel.parent.id})`;
  }
  const embed = new EmbedBuilder()
    .setTitle("Kanal gelöscht")
    .setDescription(`**Kanal <#${channel.id}> (${channel.name}) gelöscht**`)
    .setFields(
      {
        name: "Kategorie",
        value: parent,
        inline: false,
      },
      {
        name: "Erstellzeit",
        value: `<t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)`,
        inline: false,
      },
      {
        name: "Position",
        value: `#${channel.position}`,
        inline: false,
      },
      {
        name: "Typ",
        value: `${getChannelTypeAsString(channel.type)}`,
        inline: false,
      },
    )
    .setFooter({ text: `Kanal-ID: ${channel.id}` })
    .setTimestamp();
  const deleter = await fetchDeleter(channel);
  if (deleter) {
    embed.addFields({
      name: "Moderator",
      value:
        `<@${deleter.id}> (\`${deleter.displayName}\` - \`${deleter.username}\` - \`${deleter.id}\`)`,
      inline: false,
    });
  }
  await logChannel.send({
    embeds: [embed],
  });
}

async function fetchDeleter(channel) {
  const fetchedLogs = await channel.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.ChannelDelete,
  });
  const channelDeleteLog = fetchedLogs.entries.first();
  if (!channelDeleteLog) {
    return null;
  }
  const { executor, target } = channelDeleteLog;
  if (target.id == channel.id) {
    return executor;
  } else {
    return null;
  }
}
