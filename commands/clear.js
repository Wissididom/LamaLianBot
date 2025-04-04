import {
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";

const exportObj = {
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
  runInteraction: async (interaction, _db) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      const amount = interaction.options.getInteger("amount");
      try {
        const messages = await interaction.channel.bulkDelete(amount, true);
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
