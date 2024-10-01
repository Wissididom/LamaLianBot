import { EmbedBuilder, Events } from "discord.js";
import { getChannelByEventName } from "../logging.js";

export default async function handleUserUpdate(oldUser, newUser) {
  let logChannel = await getChannelByEventName(
    newUser.client,
    Events.UserUpdate,
  );
  let fields = 0;
  let embed = new EmbedBuilder()
    .setTitle("Benutzerprofil aktualisiert")
    .setDescription(
      `**<@${newUser.id}> (${newUser.displayName} - ${newUser.id}) hat sein/ihr Profil aktualisiert**`,
    );
  if (oldUser.bot != newUser.bot) {
    embed.addFields({
      name: "Bot",
      value: `${oldUser.bot ? "Ja" : "Nein"} -> ${newUser.bot ? "Ja" : "Nein"}`,
      inline: true,
    });
    fields++;
  }
  if (oldUser.globalName != newUser.globalName) {
    embed.addFields({
      name: "globaler Name",
      value: `\`${oldUser.globalName}\` -> \`${newUser.globalName}\``,
      inline: true,
    });
    fields++;
  }
  // Intentionally don't handle the hexAccentColor, because for that I'd need to force fetch users and then I don't know what it was before
  if (oldUser.system != newUser.system) {
    embed.addFields({
      name: "System",
      value: `${oldUser.system ? "Ja" : "Nein"} -> ${newUser.system ? "Ja" : "Nein"}`,
      inline: true,
    });
    fields++;
  }
  if (oldUser.username != newUser.username) {
    embed.addFields({
      name: "Benutzername",
      value: `\`${oldUser.username}\` -> \`${newUser.username}\``,
      inline: true,
    });
    fields++;
  }
  if (oldUser.avatar != newUser.avatar) {
    embed.addFields({
      name: "Avatar",
      value: `[Old](<${oldUser.avatarURL()}>) -> [New](<${newUser.avatarURL()}>)`,
      inline: true,
    });
    fields++;
  }
  embed.setTimestamp();
  if (fields > 0) {
    await logChannel.send({
      embeds: [embed],
    });
  }
}
