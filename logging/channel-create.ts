import { AuditLogEvent, EmbedBuilder, Events, GuildChannel } from "discord.js";
import { getChannelByEventName, getChannelTypeAsString } from "../logging.ts";

export default async function handleChannelCreate(channel: GuildChannel) {
  const logChannel = await getChannelByEventName(
    channel.client,
    Events.ChannelCreate,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  const createdTimestamp = Math.floor(
    new Date(channel.createdTimestamp).getTime() / 1000,
  );
  let parent = "Keine Kategorie";
  if (channel.parent) {
    parent = `${channel.parent.name} (${channel.parent.id})`;
  }
  const embed = new EmbedBuilder()
    .setTitle("Kanal erstellt")
    .setDescription(`**Kanal <#${channel.id}> (${channel.name}) erstellt**`)
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
  const creator = await fetchCreator(channel);
  if (creator) {
    embed.addFields({
      name: "Moderator",
      value:
        `<@${creator.id}> (\`${creator.displayName}\` - \`${creator.username}\` - \`${creator.id}\`)`,
      inline: false,
    });
  }
  await logChannel.send({
    embeds: [embed],
  });
}

async function fetchCreator(channel: GuildChannel) {
  const fetchedLogs = await channel.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.ChannelCreate,
  });
  const channelCreateLog = fetchedLogs.entries.first();
  if (!channelCreateLog) {
    return null;
  }
  const { executor, target } = channelCreateLog;
  if (target.id == channel.id) {
    return executor;
  } else {
    return null;
  }
}
