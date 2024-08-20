import { EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName, getChannelTypeAsString } from "../logging.js";

export default async function handleChannelCreate(channel) {
  let logChannel = await getChannelByEventName(
    channel.client,
    Events.ChannelCreate,
  );
  let createdTimestamp = Math.floor(new Date(channel.createdTimestamp) / 1000);
  let parent = "Keine Kategorie";
  if (channel.parent) {
    parent = `${channel.parent.name} (${channel.parent.id})`;
  }
  await logChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Kanal erstellt")
        .setDescription(
          `**Kanal <#${channel.id}> (${channel.name} - ${channel.id}) erstellt**`,
        )
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
        .setTimestamp(),
    ],
  });
}
