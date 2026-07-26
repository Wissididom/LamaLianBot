import { Message, PermissionsBitField } from "discord.js";

export async function handleHoneypot(
  message: Message,
  honeypotChannelId: string,
) {
  if (message.channelId == honeypotChannelId) {
    console.log("Honeypot post");
    if (
      message.member?.permissions.has(
        PermissionsBitField.Flags.Administrator,
        false,
      )
    ) {
      // Administrator
      return;
    }
    if (!message.member) return;
    await message.member.send({
      content: `Du hast eine Nachricht in den ${
        message.channel.isDMBased() ? "DM" : message.channel.name
      } Channel gesendet. Falls du gehackt wurdest ändere deine Passwörter und setze dein Betriebssystem neu auf, für den Fall, dass du dir Malware eingefangen hast. Du wurdest gesoftbanned/gekickt.\n\nYou sent a message in the ${
        message.channel.isDMBased() ? "DM" : message.channel.name
      } channel. If you've been hacked, change your passwords and reset your operating system, for the case that you've gotten Malware on it. You were soft-banned/kicked.`,
    }).catch(console.error);
    const memberId = message.member.id;
    await message.member.ban({
      deleteMessageSeconds: 60 * 60, /*last hour*/
      reason: "Honeypot triggered",
    }).then(console.log).catch(console.error);
    if (!memberId) return;
    await message.guild?.members.unban(memberId, "Honeypot triggered")
      .then(console.log).catch(console.error);
  }
}
