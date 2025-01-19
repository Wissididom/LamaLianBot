import {
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";

const exportObj = {
  name: "set-user-birthday",
  description: "Speichert den Geburtstag eines Users im Bot",
  permissions: [PermissionsBitField.Flags.ManageGuild],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Der User, dessen Geburtstag gesetzt werden soll")
          .setRequired(true),
      )
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
      const user = interaction.options.getUser("user");
      const day = interaction.options.getInteger("day");
      const month = interaction.options.getInteger("month");
      const year = interaction.options.getInteger("year");
      try {
        await db.setBirthday(user.id, year, month, day);
        await interaction.editReply({
          embeds: [
            new EmbedBuilder().setDescription(
              `<@${user.id}>'s Geburtstag (\`${day}.${month}.${year ? year : "????"}\`) erfolgreich gespeichert!`,
            ),
          ],
          allowedMentions: { parse: [] }, // Prevent pings of other people
        });
      } catch (err) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder().setDescription(
              `Konnte <@${user.id}>'s Geburtstag (\`${day}.${month}.${year ? year : "????"}\`) nicht speichern (${err.message}!`,
            ),
          ],
          allowedMentions: { parse: [] }, // Prevent pings of other people
        });
      }
    }
  },
};

export default exportObj;
