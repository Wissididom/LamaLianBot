import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

let exportObj = {
  name: "forget-birthday",
  description: "Löscht deinen eigenen Geburtstag aus dem Bot",
  permissions: [],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description),
  runInteraction: async (interaction, db) => {
    await interaction.deferReply();
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      try {
        await db.deleteBirthday(interaction.user.id);
        await interaction.editReply({
          embeds: [
            new EmbedBuilder().setDescription(
              `<@${interaction.user.id}>'s Geburtstag erfolgreich gelöscht!`,
            ),
          ],
          allowed_mentions: { parse: [] }, // Prevent pings of other people
        });
      } catch (err) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder().setDescription(
              `Geburtstag von <@${interaction.user.id}> konnte nicht gelöscht werden!`,
            ),
          ],
          allowed_mentions: { parse: [] }, // Prevent pings of other people
        });
      }
    }
  },
};

export default exportObj;
