import {
  AttachmentBuilder,
  EmbedBuilder,
  Events,
  GuildMember,
} from "discord.js";
import { getChannelByEventName } from "../logging.ts";

export default async function handleGuildMemberAdd(member: GuildMember) {
  const logChannel = await getChannelByEventName(
    member.client,
    Events.GuildMemberAdd,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  const joinedTimestamp = member.joinedTimestamp
    ? Math.floor(new Date(member.joinedTimestamp).getTime() / 1000)
    : null;
  const createdTimestamp = Math.floor(
    new Date(member.user.createdTimestamp).getTime() / 1000,
  );
  const memberAvatarAttachment = new AttachmentBuilder(
    member.displayAvatarURL(),
    { name: "avatar.gif" },
  );
  await logChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Mitglied beigetreten")
        .setDescription(
          `<@${member.id}> (\`${member.displayName}\` - \`${member.user.username}\` - ${member.id})`,
        )
        .setThumbnail("attachment://avatar.gif")
        .setFields(
          {
            name: "Server",
            value: `${member.guild.name} (${member.guild.id})`,
            inline: true,
          },
          {
            name: "Server beigetreten",
            value: joinedTimestamp
              ? `<t:${joinedTimestamp}:F> (<t:${joinedTimestamp}:R>)`
              : "N/A",
            inline: true,
          },
          {
            name: "Account erstellt",
            value: `<t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)`,
            inline: true,
          },
        )
        .setFooter({ text: `Nutzer-ID: ${member.id}` })
        .setTimestamp(),
    ],
    files: [memberAvatarAttachment],
  });
}
