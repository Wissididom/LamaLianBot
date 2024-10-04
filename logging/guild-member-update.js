import { EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleGuildMemberUpdate(oldMember, newMember) {
  let logChannel = await getChannelByEventName(
    newMember.client,
    Events.GuildMemberUpdate,
  );
  if (oldUser.avatar != newUser.avatar) {
    let embed = new EmbedBuilder()
      .setTitle("Server-Avatar geändert")
      .setDescription(
        `Der Server-Avatar von <@${newMember.id}> (${newMember.displayName} - ${newMember.id}) hat sich geändert`,
      )
      .setThumbnail(newMember.displayAvatarURL({ dynamic: true }))
      .setTimestamp();
    embed.addFields({
      name: "Server-Avatar",
      value: `[Old](<${oldMember.displayAvatarURL({ dynamic: true })}>) -> [New](<${newMember.displayAvatarURL({ dynamic: true })}>)`,
      inline: true,
    });
    logChannel.send({
      embeds: [embed],
    });
  }
  if (oldMember.roles.cache.size > newMember.roles.cache.size) {
    let embed = new EmbedBuilder()
      .setTitle("⛔️ Rollen entfernt")
      .setDescription(
        `Die Rollen von <@${newMember.id}> (${newMember.displayName} - ${newMember.id}) haben sich geändert`,
      )
      .setThumbnail(newMember.displayAvatarURL({ dynamic: true }))
      .setTimestamp();
    oldMember.roles.cache.forEach((role) => {
      if (!newMember.roles.cache.has(role.id)) {
        embed.addFields({
          name: "Rolle entfernt",
          value: `${role.name} (<@&${role.id}> - ${role.id})`,
          inline: true,
        });
      }
    });
    logChannel.send({
      embeds: [embed],
    });
  } else if (oldMember.roles.cache.size < newMember.roles.cache.size) {
    let embed = new EmbedBuilder()
      .setTitle("✅ Rollen hinzugefügt")
      .setDescription(
        `Die Rollen von <@${newMember.id}> (${newMember.displayName} - ${newMember.id}) haben sich geändert`,
      )
      .setThumbnail(newMember.displayAvatarURL({ dynamic: true }))
      .setTimestamp();
    newMember.roles.cache.forEach((role) => {
      if (!oldMember.roles.cache.has(role.id)) {
        embed.addFields({
          name: "Rolle hinzugefügt",
          value: `${role.name} (<@&${role.id}> - ${role.id})`,
          inline: true,
        });
      }
    });
    logChannel.send({
      embeds: [embed],
    });
  }
  if (
    oldMember.nickname &&
    newMember.nickname &&
    oldMember.nickname != newMember.nickname
  ) {
    let embed = new EmbedBuilder()
      .setTitle("Nickname geändert")
      .setDescription(
        `Der Nickname von <@${newMember.id}> (${newMember.displayName} - ${newMember.id}) hat sich geändert`,
      )
      .setThumbnail(newMember.displayAvatarURL({ dynamic: true }))
      .setFields({
        name: "Nickname",
        value: `\`${oldMember.nickname}\` -> \`${newMember.nickname}\``,
        inline: true,
      })
      .setTimestamp();
    logChannel.send({
      embeds: [embed],
    });
  } else if (oldMember.nickname && !newMember.nickname) {
    let embed = new EmbedBuilder()
      .setTitle("Nickname entfernt")
      .setDescription(
        `Der Nickname von <@${newMember.id}> (${newMember.displayName} - ${newMember.id}) wurde entfernt`,
      )
      .setThumbnail(newMember.displayAvatarURL({ dynamic: true }))
      .setTimestamp();
    logChannel.send({
      embeds: [embed],
    });
  } else if (!oldMember.nickname && newMember.nickname) {
    let embed = new EmbedBuilder()
      .setTitle("Nickname hinzugefügt")
      .setDescription(
        `Der Nickname von <@${newMember.id}> (${newMember.displayName} - ${newMember.id}) wurde hinzugefügt`,
      )
      .setThumbnail(newMember.displayAvatarURL({ dynamic: true }))
      .setFields({
        name: "Nickname",
        value: `\`${newMember.nickname}\``,
        inline: true,
      })
      .setTimestamp();
    logChannel.send({
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
  let timeoutTimestamp = Math.floor(
    member.communicationDisabledUntilTimestamp / 1000,
  );
  let embed = new EmbedBuilder()
    .setTitle("In Timeout versetzt")
    .setDescription(
      `<@${member.id}> (${member.displayName} - ${member.id}) wurde in Timeout versetzt`,
    )
    .setThumbnail(member.displayAvatarURL({ dynamic: true }))
    .setFields({
      name: "Ende",
      value: `<t:${timeoutTimestamp}:F> (<t:${timeoutTimestamp}:R>)`,
      inline: true,
    })
    .setTimestamp();
  logChannel.send({
    embeds: [embed],
  });
}

async function removeTimeout(member) {
  let embed = new EmbedBuilder()
    .setTitle("Timeout aufgehoben")
    .setDescription(
      `<@${member.id}>'s (${member.displayName} - ${member.id}) Timeout wurde aufgehoben`,
    )
    .setThumbnail(member.displayAvatarURL({ dynamic: true }))
    .setTimestamp();
  logChannel.send({
    embeds: [embed],
  });
}
