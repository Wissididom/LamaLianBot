import { AuditLogEvent, EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleGuildBanRemove(ban) {
  let logChannel = await getChannelByEventName(
    ban.client,
    Events.GuildBanRemove,
  );
  let unbanner = await fetchUnbanner(ban);
  if (!ban.reason) {
    ban.reason = unbanner.reason;
  }
  unbanner = unbanner.executor;
  let createdTimestamp = Math.floor(new Date(ban.user.createdTimestamp) / 1000);
  await logChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Mitglied entbannt")
        .setDescription(
          `**<@${ban.user.id}> ${ban.user.displayName} (${ban.user.id})**`,
        )
        .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
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
            value: `<@${unbanner.id}> (${unbanner.displayName} - ${unbanner.id})`,
            inline: true,
          },
          {
            name: "Begründung",
            value: ban.reason ? ban.reason : "N/A",
            inline: true,
          },
        )
        .setTimestamp(),
    ],
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
