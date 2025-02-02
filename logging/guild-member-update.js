import { AuditLogEvent, EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleGuildMemberUpdate(oldMember, newMember) {
  const logChannel = await getChannelByEventName(
    newMember.client,
    Events.GuildMemberUpdate,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  if (oldMember.avatar != newMember.avatar) {
    const embed = new EmbedBuilder()
      .setTitle("Server-Avatar geändert")
      .setDescription(
        `Der Server-Avatar von <@${newMember.id}> (\`${newMember.displayName}\` - \`${newMember.user?.username}\` - ${newMember.id}) hat sich geändert`,
      )
      .setThumbnail(newMember.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setFooter({ text: `Nutzer-ID: ${newMember.id}` });
    embed.addFields({
      name: "Server-Avatar",
      value: `[vorher](<${oldMember.displayAvatarURL({ dynamic: true })}>) -> [nachher](<${newMember.displayAvatarURL({ dynamic: true })}>)`,
      inline: true,
    });
    await logChannel.send({
      embeds: [embed],
    });
  }
  if (oldMember.roles.cache.size > newMember.roles.cache.size) {
    const embed = new EmbedBuilder()
      .setTitle("⛔️ Rollen entfernt")
      .setDescription(
        `Die Rollen von <@${newMember.id}> (\`${newMember.displayName}\` - \`${newMember.user?.username}\` - ${newMember.id}) haben sich geändert`,
      )
      .setThumbnail(newMember.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
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
        value: `<@${roler.id}> (\`${roler.displayName}\` - \`${roler.username}\` - ${roler.id})`,
        inline: true,
      });
      embed.setFooter({
        text: `Nutzer-ID: ${newMember.id} - Moderator-ID: ${roler.id}`,
      });
    }
    await logChannel.send({
      embeds: [embed],
    });
  } else if (oldMember.roles.cache.size < newMember.roles.cache.size) {
    const embed = new EmbedBuilder()
      .setTitle("✅ Rollen hinzugefügt")
      .setDescription(
        `Die Rollen von <@${newMember.id}> (\`${newMember.displayName}\` - \`${newMember.user?.username}\` - ${newMember.id}) haben sich geändert`,
      )
      .setThumbnail(newMember.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
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
        value: `<@${roler.id}> (\`${roler.displayName}\` - \`${roler.username}\` - ${roler.id})`,
        inline: true,
      });
      embed.setFooter({
        text: `Nutzer-ID: ${newMember.id} - Moderator-ID: ${roler.id}`,
      });
    }
    await logChannel.send({
      embeds: [embed],
    });
  }
  if (
    oldMember.nickname &&
    newMember.nickname &&
    oldMember.nickname != newMember.nickname
  ) {
    const embed = new EmbedBuilder()
      .setTitle("Nickname geändert")
      .setDescription(
        `Der Nickname von <@${newMember.id}> (\`${newMember.displayName}\` - \`${newMember.user?.username}\` - ${newMember.id}) hat sich geändert`,
      )
      .setThumbnail(newMember.displayAvatarURL({ dynamic: true }))
      .setFields({
        name: "Nickname",
        value: `\`${oldMember.nickname}\` -> \`${newMember.nickname}\``,
        inline: true,
      })
      .setTimestamp()
      .setFooter({ text: `Nutzer-ID: ${newMember.id}` });
    await logChannel.send({
      embeds: [embed],
    });
  } else if (oldMember.nickname && !newMember.nickname) {
    const embed = new EmbedBuilder()
      .setTitle("Nickname entfernt")
      .setDescription(
        `Der Nickname von <@${newMember.id}> (\`${newMember.displayName}\` - \`${newMember.user?.username}\` - ${newMember.id}) wurde entfernt`,
      )
      .setThumbnail(newMember.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setFooter({ text: `Nutzer-ID: ${newMember.id}` });
    await logChannel.send({
      embeds: [embed],
    });
  } else if (!oldMember.nickname && newMember.nickname) {
    const embed = new EmbedBuilder()
      .setTitle("Nickname hinzugefügt")
      .setDescription(
        `Der Nickname von <@${newMember.id}> (\`${newMember.displayName}\` - \`${newMember.user?.username}\` - ${newMember.id}) wurde hinzugefügt`,
      )
      .setThumbnail(newMember.displayAvatarURL({ dynamic: true }))
      .setFields({
        name: "Nickname",
        value: `\`${newMember.nickname}\``,
        inline: true,
      })
      .setTimestamp()
      .setFooter({ text: `Nutzer-ID: ${newMember.id}` });
    await logChannel.send({
      embeds: [embed],
    });
  }
  if (
    !oldMember.communicationDisabledUntil &&
    newMember.communicationDisabledUntil
  ) {
    if (newMember.communicationDisabledUntil > new Date()) {
      await addTimeout(logChannel, newMember);
    } else {
      await removeTimeout(logChannel, newMember);
    }
  } else if (
    oldMember.communicationDisabledUntil &&
    !newMember.communicationDisabledUntil
  ) {
    await removeTimeout(logChannel, newMember);
  } else if (
    oldMember.communicationDisabledUntil &&
    newMember.communicationDisabledUntil
  ) {
    if (newMember.communicationDisabledUntil > new Date()) {
      await addTimeout(logChannel, newMember);
    } else {
      await removeTimeout(logChannel, newMember);
    }
  }
}

async function addTimeout(logChannel, member) {
  const timeoutTimestamp = Math.floor(
    member.communicationDisabledUntilTimestamp / 1000,
  );
  const embed = new EmbedBuilder()
    .setTitle("In Timeout versetzt")
    .setDescription(
      `<@${member.id}> (\`${member.displayName}\` - \`${member.user?.username}\` - ${member.id}) wurde in Timeout versetzt`,
    )
    .setThumbnail(member.displayAvatarURL({ dynamic: true }))
    .setFields({
      name: "Ende",
      value: `<t:${timeoutTimestamp}:F> (<t:${timeoutTimestamp}:R>)`,
      inline: true,
    })
    .setTimestamp()
    .setFooter({ text: `Nutzer-ID: ${member.id}` });
  await logChannel.send({
    embeds: [embed],
  });
}

async function removeTimeout(logChannel, member) {
  const embed = new EmbedBuilder()
    .setTitle("Timeout aufgehoben")
    .setDescription(
      `<@${member.id}>'s (\`${member.displayName}\` - \`${member.user?.username}\` - ${member.id}) Timeout wurde aufgehoben`,
    )
    .setThumbnail(member.displayAvatarURL({ dynamic: true }))
    .setTimestamp()
    .setFooter({ text: `Nutzer-ID: ${member.id}` });
  await logChannel.send({
    embeds: [embed],
  });
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
