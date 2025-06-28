import {
  AttachmentBuilder,
  AuditLogEvent,
  EmbedBuilder,
  Events,
  GuildMember,
  PartialGuildMember,
} from "discord.js";
import { getChannelByEventName } from "../logging.ts";

export default async function handleGuildMemberRemove(
  member: GuildMember | PartialGuildMember,
) {
  const logChannel = await getChannelByEventName(
    member.client,
    Events.GuildMemberRemove,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  const joinedTimestamp = member.joinedTimestamp
    ? Math.floor(new Date(member.joinedTimestamp).getTime() / 1000)
    : null;
  const createdTimestamp = Math.floor(
    new Date(member.user.createdTimestamp).getTime() / 1000,
  );
  const fields = [
    {
      name: "Server",
      value: `${member.guild.name} (${member.guild.id})`,
      inline: false,
    },
    {
      name: "Server beigetreten",
      value: joinedTimestamp
        ? `<t:${joinedTimestamp}:F> (<t:${joinedTimestamp}:R>)`
        : "N/A",
      inline: false,
    },
    {
      name: "Account erstellt",
      value: `<t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)`,
      inline: false,
    },
    {
      name: "Rollen",
      value: member.roles.cache
        .filter((role) => role.name != "@everyone")
        .map((role) => `<@&${role.id}>`)
        .join(", "),
      inline: false,
    },
  ];
  const kicker = await fetchKicker(member);
  let footer;
  if (kicker) {
    footer = `Nutzer-ID: ${member.id}; Moderator-ID: ${
      kicker ? kicker.id : "N/A"
    }`;
    fields.push({
      name: "Moderator",
      value:
        `<@${kicker.id}> (\`${kicker.displayName}\` - \`${kicker.username}\` - ${kicker.id})`,
      inline: true,
    });
  } else {
    footer = `Nutzer-ID: ${member.id}`;
  }
  const memberAvatarAttachment = new AttachmentBuilder(
    member.displayAvatarURL(),
    { name: "avatar.gif" },
  );
  await logChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle(`Mitglied ${kicker ? "gekickt" : "verlassen"}`)
        .setDescription(
          `<@${member.id}> ${member.displayName} (${member.user.username})`,
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

async function fetchKicker(member: GuildMember | PartialGuildMember) {
  const fetchedLogs = await member.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MemberKick,
  });
  const kickLog = fetchedLogs.entries.first();
  if (!kickLog) {
    return null; // left the guild, most likely of their own will
  }
  const { executor, target } = kickLog;
  if (!member.joinedAt || kickLog.createdAt < member.joinedAt) {
    return null; // left the guild, most likely of their own will
  }
  if (target?.id == member.id) {
    return executor; // left the guild, was kicked by the user, that is in the return value (executor)
  } else {
    return null; // left the guild, audit log fetch was inconclusive
  }
}
