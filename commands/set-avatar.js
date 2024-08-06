import { SlashCommandBuilder } from "discord.js";

let exportObj = {
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
          .setRequired(true),
      ),
  runInteraction: async (interaction, db) => {
    if (interaction.user.id != process.env.BOT_OWNER_USER_ID) {
      await interaction.reply({
        content: `Nur <@${process.env.BOT_OWNER_USER_ID}> (Bot-Owner) kann diesen Befehl nutzen`,
        ephemeral: true,
      });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      let avatar = interaction.options.getAttachment("avatar");
      try {
        let user = await interaction.client.user?.setAvatar(avatar.url);
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