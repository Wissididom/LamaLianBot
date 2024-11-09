import { AuditLogEvent, EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleGuildMemberRemove(member) {
  let logChannel = await getChannelByEventName(
    member.client,
    Events.GuildMemberRemove,
  );
  let kicker = await fetchKicker(member);
  let joinedTimestamp = Math.floor(new Date(member.joinedTimestamp) / 1000);
  let createdTimestamp = Math.floor(
    new Date(member.user.createdTimestamp) / 1000,
  );
  await logChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle(`Mitglied ${kicker ? "gekickt" : "verlassen"}`)
        .setDescription(
          `<@${member.id}> ${member.displayName} (${member.user.username})`,
        )
        .setThumbnail(member.displayAvatarURL({ dynamic: true }))
        .setFields(
          {
            name: "Server",
            value: `${member.guild.name} (${member.guild.id})`,
            inline: true,
          },
          {
            name: "Server beigetreten",
            value: `<t:${joinedTimestamp}:F> (<t:${joinedTimestamp}:R>)`,
            inline: true,
          },
          {
            name: "Account erstellt",
            value: `<t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)`,
            inline: true,
          },
          {
            name: "Moderator (falls Kick)",
            value: kicker ? `<@${kicker.id}> (${kicker.displayName})` : "N/A",
            inline: true,
          },
        )
        .setFooter({
          text: `Nutzer-ID: ${member.id}; Moderator-ID: ${kicker ? kicker.id : "N/A"}`,
        })
        .setTimestamp(),
    ],
  });
}

async function fetchKicker(member) {
  const fetchedLogs = await member.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MemberKick,
  });
  const kickLog = fetchedLogs.entries.first();
  if (!kickLog) {
    return null; // left the guild, most likely of their own will
  }
  const { executor, target } = kickLog;
  if (kickLog.createdAt < member.joinedAt) {
    return null; // left the guild, most likely of their own will
  }
  if (target.id == member.id) {
    return executor; // left the guild, was kicked by the user, that is in the return value (executor)
  } else {
    return null; // left the guild, audit log fetch was inconclusive
  }
}
