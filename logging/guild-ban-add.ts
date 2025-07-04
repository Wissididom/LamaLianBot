import {
  AttachmentBuilder,
  AuditLogEvent,
  EmbedBuilder,
  Events,
  GuildBan,
} from "discord.js";
import { getChannelByEventName } from "../logging.ts";

export default async function handleGuildBanAdd(ban: GuildBan) {
  const logChannel = await getChannelByEventName(
    ban.client,
    Events.GuildBanAdd,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  ban = await ban.fetch();
  const createdTimestamp = Math.floor(
    new Date(ban.user.createdTimestamp).getTime() / 1000,
  );
  const banUserAvatarAttachment = new AttachmentBuilder(
    ban.user.displayAvatarURL(),
    { name: "avatar.gif" },
  );
  const banner = await fetchBanner(ban);
  await logChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Mitglied gebannt")
        .setDescription(
          `**<@${ban.user.id}> (\`${ban.user.displayName}\` - \`${ban.user.username}\` - ${ban.user.id})**`,
        )
        .setThumbnail("attachment://avatar.gif")
        .setFields(
          {
            name: "Server",
            value: `${ban.guild.name} (${ban.guild.id})`,
            inline: false,
          },
          {
            name: "Account erstellt",
            value: `<t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)`,
            inline: false,
          },
          {
            name: "Moderator",
            value: banner
              ? `<@${banner.id}> (\`${banner.displayName}\` - \`${banner.username}\` - ${banner.id})`
              : "N/A",
            inline: false,
          },
          {
            name: "Begründung",
            value: ban.reason ? ban.reason : "N/A",
            inline: false,
          },
        )
        .setFooter({
          text: `Nutzer-ID: ${ban.user.id}; Moderator-ID: ${
            banner ? banner.id : "N/A"
          }`,
        })
        .setTimestamp(),
    ],
    files: [banUserAvatarAttachment],
  });
}

async function fetchBanner(ban: GuildBan) {
  const fetchedLogs = await ban.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MemberBanAdd,
  });
  const banLog = fetchedLogs.entries.first();
  if (!banLog) {
    return null;
  }
  const { executor, target } = banLog;
  if (target?.id == ban.user.id) {
    return executor;
  } else {
    return null;
  }
}
