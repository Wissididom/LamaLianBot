import {
  AttachmentBuilder,
  EmbedBuilder,
  Events,
  PartialUser,
  User,
} from "discord.js";
import { getChannelByEventName } from "../logging.ts";

export default async function handleUserUpdate(
  oldUser: PartialUser | User,
  newUser: User,
) {
  const logChannel = await getChannelByEventName(
    newUser.client,
    Events.UserUpdate,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  let fields = 0;
  const userAvatarAttachment = new AttachmentBuilder(
    newUser.displayAvatarURL(),
    { name: "avatar.gif" },
  );
  const embed = new EmbedBuilder()
    .setTitle("Benutzerprofil aktualisiert")
    .setDescription(
      `**<@${newUser.id}> (\`${newUser.displayName}\` - \`${newUser.username}\` - ${newUser.id}) hat sein/ihr Profil aktualisiert**`,
    )
    .setThumbnail("attachment://avatar.gif")
    .setFooter({ text: `Nutzer-ID: ${newUser.id}` })
    .setTimestamp();
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
      value: `${oldUser.system ? "Ja" : "Nein"} -> ${
        newUser.system ? "Ja" : "Nein"
      }`,
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
      value:
        `[vorher](<${oldUser.displayAvatarURL()}>) -> [nachher](<${newUser.displayAvatarURL()}>)`,
      inline: true,
    });
    fields++;
  }
  if (fields > 0) {
    await logChannel.send({
      embeds: [embed],
      files: [userAvatarAttachment],
    });
  }
}
