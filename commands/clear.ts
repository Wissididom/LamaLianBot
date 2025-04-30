import {
  GuildChannel,
  Interaction,
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import Database from "../database/sqlite.ts";

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
          .setRequired(true)
      ),
  runInteraction: async (interaction: Interaction, _db: Database) => {
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const amount = interaction.options.getInteger("amount") ?? 1;
      try {
        if (interaction.channel instanceof GuildChannel) {
          const messages = await interaction.channel.bulkDelete(amount, true);
          await interaction.editReply({
            content: `${messages.size} Nachrichten erfolgreich gelöscht`,
          });
        }
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: (err as Error).toString() });
      }
    }
  },
};

export default exportObj;
