import { MessageFlags, SlashCommandBuilder } from "discord.js";
import process from "node:process";

const exportObj = {
  name: "set-avatar",
  description:
    "Setzt den Avatar des Bots. Kann nur vom Bot-Owner ausgeführt werden",
  permissions: [],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addAttachmentOption((option) =>
        option
          .setName("avatar")
          .setDescription("Der neue Avatar des Bots")
          .setRequired(true)
      ),
  runInteraction: async (interaction, _db) => {
    if (interaction.user.id != process.env.BOT_OWNER_USER_ID) {
      await interaction.reply({
        content:
          `Nur <@${process.env.BOT_OWNER_USER_ID}> (Bot-Owner) kann diesen Befehl nutzen`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      const avatar = interaction.options.getAttachment("avatar");
      try {
        const user = await interaction.client.user?.setAvatar(avatar.url);
        await interaction.editReply({
          content: `Avatar von ${user.tag} erfolgreich geändert`,
        });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: err.toString() });
      }
    }
  },
};

export default exportObj;
