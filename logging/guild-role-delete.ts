import { AuditLogEvent, EmbedBuilder, Events, Role } from "discord.js";
import { getChannelByEventName } from "../logging.ts";

export default async function handleGuildRoleDelete(role: Role) {
  const logChannel = await getChannelByEventName(
    role.client,
    Events.GuildRoleDelete,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  const createdTimestamp = Math.floor(
    new Date(role.createdTimestamp).getTime() / 1000,
  );
  const permissionArray = role.permissions.toArray();
  const embed = new EmbedBuilder()
    .setTitle("Rolle gelöscht")
    .setDescription(`**Rolle <@&${role.id}> (${role.name}) gelöscht**`)
    .setFields(
      {
        name: "Farbe",
        value: role.hexColor,
        inline: true,
      },
      {
        name: "Erstellzeit",
        value: `<t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)`,
        inline: true,
      },
      {
        name: "Separat angezeigt",
        value: `${role.hoist ? "Ja" : "Nein"}`,
        inline: true,
      },
      {
        name: "Von einer Anwendung verwaltet",
        value: `${role.managed ? "Ja" : "Nein"}`,
        inline: true,
      },
      {
        name: "Von jedem erwähnbar",
        value: `${role.mentionable ? "Ja" : "Nein"}`,
        inline: true,
      },
      {
        name: "Rechte",
        value: permissionArray && permissionArray.length > 0
          ? permissionArray.join(", ")
          : "Keine Rechte",
        inline: true,
      },
      {
        name: "Position",
        value: `${role.position}`,
        inline: true,
      },
    )
    .setFooter({ text: `Role-ID: ${role.id}` })
    .setTimestamp();
  const deleter = await fetchDeleter(role);
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

async function fetchDeleter(role: Role) {
  const fetchedLogs = await role.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.RoleDelete,
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
