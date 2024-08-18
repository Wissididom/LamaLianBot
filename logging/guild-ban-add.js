import { AuditLogEvent, EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleGuildBanAdd(ban) {
  let logChannel = await getChannelByEventName(ban.client, Events.GuildBanAdd);
  ban = await ban.fetch();
  let banner = await fetchBanner(ban);
  let createdTimestamp = Math.floor(new Date(ban.user.createdTimestamp) / 1000);
  await logChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Mitglied gebannt")
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
            value: `<@${banner.id}> (${banner.displayName} - ${banner.id})`,
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

async function fetchBanner(ban) {
  const fetchedLogs = await ban.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MemberBanAdd,
  });
  const banLog = fetchedLogs.entries.first();
  if (!banLog) {
    return null;
  }
  const { executor, target } = banLog;
  if (target.id == ban.user.id) {
    return executor;
  } else {
    return null;
  }
}
