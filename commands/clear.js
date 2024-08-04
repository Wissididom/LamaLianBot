import { PermissionsBitField, SlashCommandBuilder } from "discord.js";

let exportObj = {
  name: "clear",
  description: "Mehrere Nachrichten auf einmal löschen",
  permissions: [PermissionsBitField.Flags.ManageMessages],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addIntegerOption((option) =>
        option
          .setName("amount")
          .setDescription(
            "Die Anzahl an Nachrichten, die gelöscht werden sollen (max. 14 Tage alt)",
          )
          .setRequired(true),
      ),
  runInteraction: async (interaction, db) => {
    await interaction.deferReply({ ephemeral: true });
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      let amount = interaction.options.getInteger("amount");
      try {
        let messages = await interaction.channel.bulkDelete(amount);
        await interaction.editReply({
          content: `${messages.size} Nachrichten erfolgreich gelöscht`,
        });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: err.toString() });
      }
    }
  },
};

export default exportObj;
