import {
  AttachmentBuilder,
  AuditLogEvent,
  EmbedBuilder,
  Events,
} from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleGuildMemberRemove(member) {
  const logChannel = await getChannelByEventName(
    member.client,
    Events.GuildMemberRemove,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  const kicker = await fetchKicker(member);
  const joinedTimestamp = Math.floor(new Date(member.joinedTimestamp) / 1000);
  const createdTimestamp = Math.floor(
    new Date(member.user.createdTimestamp) / 1000,
  );
  const fields = [
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
  ];
  let footer;
  if (kicker) {
    footer = `Nutzer-ID: ${member.id}; Moderator-ID: ${kicker ? kicker.id : "N/A"}`;
    fields.push({
      name: "Moderator",
      value: `<@${kicker.id}> (\`${kicker.displayName}\` - \`${kicker.username}\` - ${kicker.id})`,
      inline: true,
    });
  } else {
    footer = `Nutzer-ID: ${member.id}`;
  }
  const memberAvatarAttachment = new AttachmentBuilder(
    member.displayAvatarURL({ dynamic: true }),
    { name: "avatar.gif" },
  );
  await logChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle(`Mitglied ${kicker ? "gekickt" : "verlassen"}`)
        .setDescription(
          `<@${member.id}> ${member.displayName} (${member.user.username} - ${member.user.id})`,
        )
        .setThumbnail("attachment://avatar.gif")
        .setFields(fields)
        .setFooter({
          text: footer,
        })
        .setTimestamp(),
    ],
    files: [memberAvatarAttachment],
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
