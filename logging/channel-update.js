import { EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName, getChannelTypeAsString } from "../logging.js";

export default async function handleChannelUpdate(oldChannel, newChannel) {
  let logChannel = await getChannelByEventName(
    newChannel.client,
    Events.ChannelUpdate,
  );
  let embed = new EmbedBuilder()
    .setTitle("Kanal bearbeitet")
    .setDescription(
      `**Kanal <#${newChannel.id}> (${newChannel.name} - ${newChannel.id}) bearbeitet**`,
    );
  if (oldChannel.name != newChannel.name) {
    embed.addFields({
      name: "Name",
      value: `\`${oldChannel.name}\` -> \`${newChannel.name}\``,
      inline: true,
    });
  }
  if (oldChannel.parent?.id != newChannel.parent?.id) {
    embed.addFields({
      name: "Name",
      value: `\`${oldChannel.parent?.name}\` (${oldChannel.parent?.id}) -> \`${oldChannel.parent?.name}\` (${oldChannel.parent?.id})`,
      inline: true,
    });
  }
  if (oldChannel.position != newChannel.position) {
    embed.addFields({
      name: "Position",
      value: `#${oldChannel.position} -> #${newChannel.position}`,
      inline: true,
    });
  }
  if (oldChannel.type != newChannel.type) {
    embed.addFields({
      name: "Typ",
      value: `${getChannelTypeAsString(oldChannel.type)} -> ${getChannelTypeAsString(newChannel.type)}`,
      inline: true,
    });
  }
  embed.setTimestamp();
  await logChannel.send({
    embeds: [embed],
  });
}
