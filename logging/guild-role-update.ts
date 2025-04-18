import { AuditLogEvent, EmbedBuilder, Events, Role } from "discord.js";
import { getChannelByEventName } from "../logging.ts";

export default async function handleGuildRoleUpdate(
  oldRole: Role,
  newRole: Role,
) {
  const logChannel = await getChannelByEventName(
    newRole.client,
    Events.GuildRoleUpdate,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  let fieldsAdded = false;
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
    fieldsAdded = true;
  }
  if (oldRole.hoist != newRole.hoist) {
    embed.addFields({
      name: "Separat angezeigt",
      value: `${oldRole.hoist ? "Ja" : "Nein"} -> ${
        newRole.hoist ? "Ja" : "Nein"
      }`,
      inline: true,
    });
    fieldsAdded = true;
  }
  if (oldRole.icon != newRole.icon) {
    embed.addFields({
      name: "Icon",
      value:
        `[altes Icon](${oldRole.iconURL()}) -> [neues Icon](${newRole.iconURL()})`,
      inline: true,
    });
    fieldsAdded = true;
  }
  if (oldRole.managed != newRole.managed) {
    embed.addFields({
      name: "Von einer Anwendung verwaltet",
      value: `${oldRole.managed ? "Ja" : "Nein"} -> ${
        newRole.managed ? "Ja" : "Nein"
      }`,
      inline: true,
    });
    fieldsAdded = true;
  }
  if (oldRole.mentionable != newRole.mentionable) {
    embed.addFields({
      name: "Von jedem erwähnbar",
      value: `${oldRole.mentionable ? "Ja" : "Nein"} -> ${
        newRole.mentionable ? "Ja" : "Nein"
      }`,
      inline: true,
    });
    fieldsAdded = true;
  }
  if (oldRole.name != newRole.name) {
    embed.addFields({
      name: "Name",
      value: `\`${oldRole.name}\` -> \`${newRole.name}\``,
      inline: true,
    });
    fieldsAdded = true;
  }
  if (oldRole.position != newRole.position) {
    embed.addFields({
      name: "Position",
      value: `#${oldRole.position} -> #${newRole.position}`,
      inline: true,
    });
    fieldsAdded = true;
  }
  if (oldRole.permissions != newRole.permissions) {
    const oldArray = oldRole.permissions.toArray();
    const newArray = newRole.permissions.toArray();
    const oldJoined = oldArray.join(", ");
    const newJoined = newArray.join(", ");
    if (oldJoined != newJoined) {
      embed.addFields({
        name: "Rechte",
        value: `${
          oldArray && oldArray.length > 0 ? oldJoined : "Keine Rechte"
        } -> ${newArray && newArray.length > 0 ? newJoined : "Keine Rechte"}`,
        inline: false,
      });
      fieldsAdded = true;
    }
  }
  const updater = await fetchUpdater(newRole);
  if (updater) {
    embed.addFields({
      name: "Moderator",
      value:
        `<@${updater.id}> (\`${updater.displayName}\` - \`${updater.username}\` - \`${updater.id}\`)`,
      inline: false,
    });
    fieldsAdded = true;
  }
  if (!fieldsAdded) return;
  await logChannel.send({
    embeds: [embed],
  });
}

async function fetchUpdater(role: Role) {
  const fetchedLogs = await role.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.RoleUpdate,
  });
  const roleLog = fetchedLogs.entries.first();
  if (!roleLog) {
    return null;
  }
  const { executor, target } = roleLog;
  if (target?.id == role.id) {
    return executor;
  } else {
    return null;
  }
}
