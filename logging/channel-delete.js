import { EmbedBuilder, Events } from "discord.js";
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
  await logChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Kanal gelöscht")
        .setDescription(`**Kanal <#${channel.id}> (${channel.name}) gelöscht**`)
        .setFields(
          {
            name: "Kategorie",
            value: parent,
            inline: true,
          },
          {
            name: "Erstellzeit",
            value: `<t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)`,
            inline: true,
          },
          {
            name: "Position",
            value: `#${channel.position}`,
            inline: true,
          },
          {
            name: "Typ",
            value: `${getChannelTypeAsString(channel.type)}`,
            inline: true,
          },
        )
        .setFooter({ text: `Kanal-ID: ${channel.id}` })
        .setTimestamp(),
    ],
  });
}
