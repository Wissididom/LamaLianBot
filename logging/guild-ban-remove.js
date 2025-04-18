import {
  AttachmentBuilder,
  AuditLogEvent,
  EmbedBuilder,
  Events,
} from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleGuildBanRemove(ban) {
  const logChannel = await getChannelByEventName(
    ban.client,
    Events.GuildBanRemove,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  let unbanner = await fetchUnbanner(ban);
  if (!ban.reason) {
    ban.reason = unbanner.reason;
  }
  unbanner = unbanner.executor;
  const createdTimestamp = Math.floor(
    new Date(ban.user.createdTimestamp) / 1000,
  );
  const banUserAvatarAttachment = new AttachmentBuilder(
    ban.user.displayAvatarURL({ dynamic: true }),
    { name: "avatar.gif" },
  );
  await logChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Mitglied entbannt")
        .setDescription(
          `**<@${ban.user.id}> (\`${ban.user.displayName}\` - \`${ban.user.username}\` - ${ban.user.id})**`,
        )
        .setThumbnail("attachment://avatar.gif")
        .setFields(
          {
            name: "Server",
            value: `${ban.guild.name} (${ban.guild.id})`,
            inline: true,
          },
          {
            name: "Account erstellt",
            value: `<t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)`,
            inline: true,
          },
          {
            name: "Moderator",
            value: unbanner
              ? `<@${unbanner.id}> (\`${unbanner.displayName}\` - \`${unbanner.username}\` - ${unbanner.id})`
              : "N/A",
            inline: true,
          },
          {
            name: "Begründung",
            value: ban.reason ? ban.reason : "N/A",
            inline: true,
          },
        )
        .setFooter({
          text: `Nutzer-ID: ${ban.user.id}; Moderator-ID: ${
            unbanner ? unbanner.id : "N/A"
          }`,
        })
        .setTimestamp(),
    ],
    files: [banUserAvatarAttachment],
  });
}

async function fetchUnbanner(ban) {
  const fetchedLogs = await ban.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MemberBanRemove,
  });
  const banLog = fetchedLogs.entries.first();
  if (!banLog) {
    return null;
  }
  const { executor, target, reason } = banLog;
  if (target.id == ban.user.id) {
    return { executor, reason };
  } else {
    return null;
  }
}
