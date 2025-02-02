import { AuditLogEvent, EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleGuildRoleCreate(role) {
  const logChannel = await getChannelByEventName(
    role.client,
    Events.GuildRoleCreate,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  const createdTimestamp = Math.floor(new Date(role.createdTimestamp) / 1000);
  const permissionArray = role.permissions.toArray();
  const embed = new EmbedBuilder()
    .setTitle("Rolle erstellt")
    .setDescription(`**Rolle <@&${role.id}> (${role.name}) erstellt**`)
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
        name: "Position",
        value: `${role.position}`,
        inline: true,
      },
      {
        name: "Rechte",
        value:
          permissionArray && permissionArray.length > 0
            ? permissionArray.join(", ")
            : "Keine Rechte",
        inline: false,
      },
    )
    .setFooter({ text: `Role-ID: ${role.id}` })
    .setTimestamp();
  const creator = await fetchCreator(role);
  if (creator) {
    embed.addFields({
      name: "Moderator",
      value: `<@${creator.id}> (\`${creator.displayName}\` - \`${creator.username}\` - \`${creator.id}\`)`,
      inline: false,
    });
  }
  await logChannel.send({
    embeds: [embed],
  });
}

async function fetchCreator(role) {
  const fetchedLogs = await role.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.RoleCreate,
  });
  const roleLog = fetchedLogs.entries.first();
  if (!roleLog) {
    return null;
  }
  const { executor, target } = roleLog;
  if (target.id == role.id) {
    return executor;
  } else {
    return null;
  }
}
