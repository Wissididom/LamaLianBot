import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

const exportObj = {
  name: "remember-birthday",
  description: "Speichert deinen Geburtstag im Bot",
  permissions: [],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addIntegerOption((option) =>
        option
          .setName("day")
          .setDescription("Der Geburtstag (1-31)")
          .setRequired(true),
      )
      .addIntegerOption((option) =>
        option
          .setName("month")
          .setDescription("Der Geburtsmonat (1-12)")
          .setRequired(true),
      )
      .addIntegerOption((option) =>
        option
          .setName("year")
          .setDescription("Das Geburtsjahr (vierstellig)")
          .setRequired(false),
      ),
  runInteraction: async (interaction, db) => {
    await interaction.deferReply();
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      const day = interaction.options.getInteger("day");
      const month = interaction.options.getInteger("month");
      const year = interaction.options.getInteger("year");
      try {
        await db.setBirthday(interaction.user.id, year, month, day);
        await interaction.editReply({
          embeds: [
            new EmbedBuilder().setDescription(
              `<@${interaction.user.id}>'s Geburtstag (\`${day}.${month}.${year ? year : "????"}\`) erfolgreich gespeichert!`,
            ),
          ],
          allowedMentions: { parse: [] }, // Prevent pings of other people
        });
      } catch (err) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder().setDescription(
              `Konnte <@${interaction.user.id}>'s Geburtstag (\`${day}.${month}.${year ? year : "????"}\`) nicht speichern (${err.message}!`,
            ),
          ],
          allowedMentions: { parse: [] }, // Prevent pings of other people
        });
      }
    }
  },
};

export default exportObj;
