import { EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleGuildMemberAdd(member) {
  let logChannel = await getChannelByEventName(
    member.client,
    Events.GuildMemberAdd,
  );
  let joinedTimestamp = Math.floor(new Date(member.joinedTimestamp) / 1000);
  let createdTimestamp = Math.floor(
    new Date(member.user.createdTimestamp) / 1000,
  );
  await logChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Mitglied beigetreten")
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
        )
        .setTimestamp(),
    ],
  });
}
