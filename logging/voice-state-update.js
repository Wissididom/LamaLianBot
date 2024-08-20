import { EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleVoiceStateUpdate(oldState, newState) {
  let logChannel = await getChannelByEventName(
    newState.client,
    Events.VoiceStateUpdate,
  );
  if (oldState.channel == null && newState.channel != null) {
    logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("Sprachkanal beigetreten")
          .setDescription(
            `**<@${newState.member?.id}> (\`${newState.member?.displayName}\` - ${newState.member?.id})\n<#${newState.channel.id}> (\`${newState.channel.name}\` - ${newState.channel.id}) beigetreten**`,
          ),
      ],
    });
  } else if (oldState.channel != null && newState.channel == null) {
    logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("Sprachkanal verlassen")
          .setDescription(
            `**<@${newState.member?.id}> (\`${newState.member?.displayName}\` - ${newState.member?.id})\n<#${oldState.channel.id}> (\`${oldState.channel.name}\` - ${oldState.channel.id}) verlassen**`,
          ),
      ],
    });
  } else if (
    oldState.channel != null &&
    newState.channel != null &&
    oldState.channel.id != newState.channel.id
  ) {
    logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("Sprachkanal gewechselt")
          .setDescription(
            `**<@${newState.member?.id}> (\`${newState.member?.displayName}\` - ${newState.member?.id})**`,
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
          ),
      ],
    });
  }
}
