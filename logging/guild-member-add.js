import { EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleGuildMemberAdd(member) {
  const logChannel = await getChannelByEventName(
    member.client,
    Events.GuildMemberAdd,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  const joinedTimestamp = Math.floor(new Date(member.joinedTimestamp) / 1000);
  const createdTimestamp = Math.floor(
    new Date(member.user.createdTimestamp) / 1000,
  );
  await logChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Mitglied beigetreten")
        .setDescription(
          `<@${member.id}> (\`${member.displayName}\` - \`${member.user.username}\` - ${member.id})`,
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
        )
        .setFooter({ text: `Nutzer-ID: ${member.id}` })
        .setTimestamp(),
    ],
  });
}
