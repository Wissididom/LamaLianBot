import {
  AttachmentBuilder,
  AuditLogEvent,
  EmbedBuilder,
  Events,
} from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleGuildMemberUpdate(oldMember, newMember) {
  const logChannel = await getChannelByEventName(
    newMember.client,
    Events.GuildMemberUpdate,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  const memberAvatarAttachment = new AttachmentBuilder(
    newMember.displayAvatarURL({ dynamic: true }),
    { name: "avatar.gif" },
  );
  const embed = new EmbedBuilder()
    .setThumbnail("attachment://avatar.gif")
    .setTimestamp();
  var shouldPost = false;
  if (oldMember.avatar != newMember.avatar) {
    embed
      .setTitle("Server-Avatar geändert")
      .setDescription(
        `Der Server-Avatar von <@${newMember.id}> (\`${newMember.displayName}\` - \`${newMember.user?.username}\` - ${newMember.id}) hat sich geändert`,
      )
      .setFooter({ text: `Nutzer-ID: ${newMember.id}` });
    embed.addFields({
      name: "Server-Avatar",
      value: `[vorher](<${
        oldMember.displayAvatarURL({ dynamic: true })
      }>) -> [nachher](<${newMember.displayAvatarURL({ dynamic: true })}>)`,
      inline: true,
    });
    shouldPost = true;
  }
  if (oldMember.roles.cache.size > newMember.roles.cache.size) {
    embed
      .setTitle("⛔️ Rollen entfernt")
      .setDescription(
        `Die Rollen von <@${newMember.id}> (\`${newMember.displayName}\` - \`${newMember.user?.username}\` - ${newMember.id}) haben sich geändert`,
      )
      .setFooter({ text: `Nutzer-ID: ${newMember.id}` });
    oldMember.roles.cache.forEach((role) => {
      if (!newMember.roles.cache.has(role.id)) {
        embed.addFields({
          name: "Rolle entfernt",
          value: `<@&${role.id}> (\`${role.name}\` - \`${role.id}\`)`,
          inline: true,
        });
      }
    });
    const roler = await fetchRoler(newMember);
    if (roler) {
      embed.addFields({
        name: "Moderator",
        value:
          `<@${roler.id}> (\`${roler.displayName}\` - \`${roler.username}\` - ${roler.id})`,
        inline: true,
      });
      embed.setFooter({
        text: `Nutzer-ID: ${newMember.id} - Moderator-ID: ${roler.id}`,
      });
    }
    shouldPost = true;
  } else if (oldMember.roles.cache.size < newMember.roles.cache.size) {
    embed
      .setTitle("✅ Rollen hinzugefügt")
      .setDescription(
        `Die Rollen von <@${newMember.id}> (\`${newMember.displayName}\` - \`${newMember.user?.username}\` - ${newMember.id}) haben sich geändert`,
      )
      .setFooter({ text: `Nutzer-ID: ${newMember.id}` });
    newMember.roles.cache.forEach((role) => {
      if (!oldMember.roles.cache.has(role.id)) {
        embed.addFields({
          name: "Rolle hinzugefügt",
          value: `<@&${role.id}> (\`${role.name}\` - \`${role.id}\`)`,
          inline: true,
        });
      }
    });
    const roler = await fetchRoler(newMember);
    if (roler) {
      embed.addFields({
        name: "Moderator",
        value:
          `<@${roler.id}> (\`${roler.displayName}\` - \`${roler.username}\` - ${roler.id})`,
        inline: true,
      });
      embed.setFooter({
        text: `Nutzer-ID: ${newMember.id} - Moderator-ID: ${roler.id}`,
      });
    }
    shouldPost = true;
  }
  if (
    oldMember.nickname &&
    newMember.nickname &&
    oldMember.nickname != newMember.nickname
  ) {
    embed
      .setTitle("Nickname geändert")
      .setDescription(
        `Der Nickname von <@${newMember.id}> (\`${newMember.displayName}\` - \`${newMember.user?.username}\` - ${newMember.id}) hat sich geändert`,
      )
      .setFields({
        name: "Nickname",
        value: `\`${oldMember.nickname}\` -> \`${newMember.nickname}\``,
        inline: true,
      })
      .setFooter({ text: `Nutzer-ID: ${newMember.id}` });
    shouldPost = true;
  } else if (oldMember.nickname && !newMember.nickname) {
    embed
      .setTitle("Nickname entfernt")
      .setDescription(
        `Der Nickname von <@${newMember.id}> (\`${newMember.displayName}\` - \`${newMember.user?.username}\` - ${newMember.id}) wurde entfernt`,
      )
      .setFooter({ text: `Nutzer-ID: ${newMember.id}` });
    shouldPost = true;
  } else if (!oldMember.nickname && newMember.nickname) {
    embed
      .setTitle("Nickname hinzugefügt")
      .setDescription(
        `Der Nickname von <@${newMember.id}> (\`${newMember.displayName}\` - \`${newMember.user?.username}\` - ${newMember.id}) wurde hinzugefügt`,
      )
      .setFields({
        name: "Nickname",
        value: `\`${newMember.nickname}\``,
        inline: true,
      })
      .setFooter({ text: `Nutzer-ID: ${newMember.id}` });
    shouldPost = true;
  }
  if (
    !oldMember.communicationDisabledUntil &&
    newMember.communicationDisabledUntil
  ) {
    if (newMember.communicationDisabledUntil > new Date()) {
      embed = addTimeout(newMember, embed);
    } else {
      embed = removeTimeout(newMember, embed);
    }
    shouldPost = true;
  } else if (
    oldMember.communicationDisabledUntil &&
    !newMember.communicationDisabledUntil
  ) {
    embed = removeTimeout(newMember, embed);
    shouldPost = true;
  } else if (
    oldMember.communicationDisabledUntil &&
    newMember.communicationDisabledUntil
  ) {
    if (newMember.communicationDisabledUntil > new Date()) {
      embed = addTimeout(newMember, embed);
    } else {
      embed = removeTimeout(newMember, embed);
    }
    shouldPost = true;
  }
  if (shouldPost) {
    await logChannel.send({
      embeds: [embed],
      files: [memberAvatarAttachment],
    });
  }
}

function addTimeout(member, embed) {
  const timeoutTimestamp = Math.floor(
    member.communicationDisabledUntilTimestamp / 1000,
  );
  return embed
    .setTitle("In Timeout versetzt")
    .setDescription(
      `<@${member.id}> (\`${member.displayName}\` - \`${member.user?.username}\` - ${member.id}) wurde in Timeout versetzt`,
    )
    .setFields({
      name: "Ende",
      value: `<t:${timeoutTimestamp}:F> (<t:${timeoutTimestamp}:R>)`,
      inline: true,
    })
    .setFooter({ text: `Nutzer-ID: ${member.id}` });
}

function removeTimeout(member, embed) {
  return embed
    .setTitle("Timeout aufgehoben")
    .setDescription(
      `<@${member.id}>'s (\`${member.displayName}\` - \`${member.user?.username}\` - ${member.id}) Timeout wurde aufgehoben`,
    )
    .setFooter({ text: `Nutzer-ID: ${member.id}` });
}

async function fetchRoler(member) {
  const fetchedLogs = await member.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MemberRoleUpdate,
  });
  const memberRoleLog = fetchedLogs.entries.first();
  if (!memberRoleLog) {
    return null;
  }
  const { executor, target } = memberRoleLog;
  if (target.id == member.id) {
    return executor;
  } else {
    return null;
  }
}
