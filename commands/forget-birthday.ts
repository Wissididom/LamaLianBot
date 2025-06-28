import { EmbedBuilder, Interaction, SlashCommandBuilder } from "discord.js";
import Database from "../database/sqlite.ts";

const exportObj = {
  name: "forget-birthday",
  description: "Löscht deinen eigenen Geburtstag aus dem Bot",
  permissions: [],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description),
  runInteraction: async (interaction: Interaction, db: Database) => {
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      await interaction.deferReply();
      try {
        await db.deleteBirthday(interaction.user.id);
        await interaction.editReply({
          embeds: [
            new EmbedBuilder().setDescription(
              `<@${interaction.user.id}>'s Geburtstag erfolgreich gelöscht!`,
            ),
          ],
          allowedMentions: { parse: [] }, // Prevent pings of other people
        });
      } catch (err) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder().setDescription(
              `Geburtstag von <@${interaction.user.id}> konnte nicht gelöscht werden!`,
            ),
          ],
          allowedMentions: { parse: [] }, // Prevent pings of other people
        });
        console.log("forget-birthday", err);
      }
    }
  },
};

export default exportObj;
