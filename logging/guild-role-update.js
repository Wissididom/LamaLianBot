import { EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleGuildRoleUpdate(oldRole, newRole) {
  const logChannel = await getChannelByEventName(
    newRole.client,
    Events.GuildRoleUpdate,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  const embed = new EmbedBuilder()
    .setTitle("Rolle bearbeitet")
    .setDescription(`**Rolle <@&${newRole.id}> (${newRole.name}) bearbeitet**`)
    .setFooter({ text: `Role-ID: ${newRole.id}` })
    .setTimestamp();
  if (oldRole.hexColor != newRole.hexColor) {
    embed.addFields({
      name: "Farbe",
      value: `${oldRole.hexColor} -> ${newRole.hexColor}`,
      inline: true,
    });
  }
  if (oldRole.hoist != newRole.hoist) {
    embed.addFields({
      name: "Separat angezeigt",
      value: `${oldRole.hoist ? "Ja" : "Nein"} -> ${newRole.hoist ? "Ja" : "Nein"}`,
      inline: true,
    });
  }
  if (oldRole.icon != newRole.icon) {
    embed.addFields({
      name: "Icon",
      value: `[altes Icon](${oldRole.iconURL()}) -> [neues Icon](${newRole.iconURL()})`,
      inline: true,
    });
  }
  if (oldRole.managed != newRole.managed) {
    embed.addFields({
      name: "Von einer Anwendung verwaltet",
      value: `${oldRole.managed ? "Ja" : "Nein"} -> ${newRole.managed ? "Ja" : "Nein"}`,
      inline: true,
    });
  }
  if (oldRole.mentionable != newRole.mentionable) {
    embed.addFields({
      name: "Von jedem erwähnbar",
      value: `${oldRole.mentionable ? "Ja" : "Nein"} -> ${newRole.mentionable ? "Ja" : "Nein"}`,
      inline: true,
    });
  }
  if (oldRole.name != newRole.name) {
    embed.addFields({
      name: "Name",
      value: `\`${oldRole.name}\` -> \`${newRole.name}\``,
      inline: true,
    });
  }
  if (oldRole.permissions != newRole.permissions) {
    const oldArray = oldRole.permissions.toArray();
    const newArray = newRole.permissions.toArray();
    const oldJoined = oldArray.join(", ");
    const newJoined = newArray.join(", ");
    if (oldJoined != newJoined) {
      embed.addFields({
        name: "Rechte",
        value: `${oldArray && oldArray.length > 0 ? oldJoined : "Keine Rechte"} -> ${newArray && newArray.length > 0 ? newJoined : "Keine Rechte"}`,
        inline: true,
      });
    }
  }
  if (oldRole.position != newRole.position) {
    embed.addFields({
      name: "Position",
      value: `#${oldRole.position} -> #${newRole.position}`,
      inline: true,
    });
  }
  await logChannel.send({
    embeds: [embed],
  });
}
