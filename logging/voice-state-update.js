import { EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleVoiceStateUpdate(oldState, newState) {
  const logChannel = await getChannelByEventName(
    newState.client,
    Events.VoiceStateUpdate,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  const embed = new EmbedBuilder().setTimestamp();
  if (newState.member) embed.setThumbnail("attachment://avatar.gif");
  if (oldState.channel == null && newState.channel != null) {
    embed
      .setTitle("Sprachkanal beigetreten")
      .setDescription(
        `**<@${newState.member?.id}> (\`${newState.member?.displayName}\` - \`${newState.member?.username}\` - ${newState.member?.id})\n<#${newState.channel.id}> (\`${newState.channel.name}\` - ${newState.channel.id}) beigetreten**`,
      )
      .setFooter({ text: `Nutzer-ID: ${newState.member?.id}` });
  } else if (oldState.channel != null && newState.channel == null) {
    embed
      .setTitle("Sprachkanal verlassen")
      .setDescription(
        `**<@${newState.member?.id}> (\`${newState.member?.displayName}\` - \`${newState.member?.username}\` - ${newState.member?.id})\n<#${oldState.channel.id}> (\`${oldState.channel.name}\` - ${oldState.channel.id}) verlassen**`,
      )
      .setFooter({ text: `Nutzer-ID: ${newState.member?.id}` });
  } else if (
    oldState.channel != null &&
    newState.channel != null &&
    oldState.channel.id != newState.channel.id
  ) {
    embed
      .setTitle("Sprachkanal gewechselt")
      .setDescription(
        `**<@${newState.member?.id}> (\`${newState.member?.displayName}\` - \`${newState.member?.username}\` - ${newState.member?.id})**`,
      )
      .setFields(
        {
          name: "Von",
          value: `<#${oldState.channel.id}> (\`${oldState.channel.name}\` - ${oldState.channel.id})`,
          inline: true,
        },
        {
          name: "Zu",
          value: `<#${newState.channel.id}> (\`${newState.channel.name}\` - ${newState.channel.id})**`,
          inline: true,
        },
      )
      .setFooter({ text: `Nutzer-ID: ${newState.member?.id}` });
  } else {
    embed.setTitle(
      `Sprachkanaleinstellungen für <@${newState.member?.id}> (\`${newState.member?.displayName}\` - \`${newState.member?.username}\` - ${newState.member?.id}) geändert`,
    );
    if (oldState.deaf != newState.deaf) {
      // I don't care if it is a selfDeaf or a serverDeaf here
      embed.addFields({
        name: "Taub",
        value: `${oldState.deaf ? "Ja" : "Nein"} -> ${newState.deaf ? "Ja" : "Nein"}`,
        inline: true,
      });
    }
    if (oldState.mute != newState.mute) {
      embed.addFields({
        name: "Stumm",
        value: `${oldState.mute ? "Ja" : "Nein"} -> ${newState.mute ? "Ja" : "Nein"}`,
        inline: true,
      });
    }
    if (oldState.video != newState.video) {
      embed.addFields({
        name: "Video",
        value: `${oldState.video ? "Ja" : "Nein"} -> ${newState.video ? "Ja" : "Nein"}`,
        inline: true,
      });
    }
    if (oldState.streaming != newState.streaming) {
      embed.addFields({
        name: "Streaming Screen",
        value: `${oldState.streaming ? "Ja" : "Nein"} -> ${newState.streaming ? "Ja" : "Nein"}`,
        inline: true,
      });
    }
  }
  if (newState.member) {
    const userAvatarAttachment = new AttachmentBuilder(
      newState.member.displayAvatarURL({ dynamic: true }),
      { name: "avatar.gif" },
    );
    await logChannel.send({
      embeds: [embed],
      files: [userAvatarAttachment],
    });
  } else {
    await logChannel.send({
      embeds: [embed],
    });
  }
}
