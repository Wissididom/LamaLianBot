import {
  DiscordAPIError,
  EmbedBuilder,
  Interaction,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import Database from "../database/sqlite.ts";

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
          .setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName("day")
          .setDescription("Der Geburtstag (1-31)")
          .setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName("month")
          .setDescription("Der Geburtsmonat (1-12)")
          .setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName("year")
          .setDescription("Das Geburtsjahr (vierstellig)")
          .setRequired(false)
      ),
  runInteraction: async (interaction: Interaction, db: Database) => {
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      await interaction.deferReply();
      const user = interaction.options.getUser("user");
      const day = interaction.options.getInteger("day");
      const month = interaction.options.getInteger("month");
      const year = interaction.options.getInteger("year");
      const now = new Date();
      try {
        if (user) {
          await db.setBirthday(user.id, year, month ?? now.getMonth(), day ?? now.getDate());
          await interaction.editReply({
            embeds: [
              new EmbedBuilder().setDescription(
                `<@${user.id}>'s Geburtstag (\`${day}.${month}.${
                  year ? year : "????"
                }\`) erfolgreich gespeichert!`,
              ),
            ],
            allowedMentions: { parse: [] }, // Prevent pings of other people
          });
        } else {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder().setDescription(
                `Ich habe den User nicht mitbekommen also kann ich auch keinen Geburtstag setzen!`,
              ),
            ],
            allowedMentions: { parse: [] }, // Prevent pings of other people
          });
        }
      } catch (err) {
        if (user) {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder().setDescription(
                `Konnte <@${user.id}>'s Geburtstag (\`${day}.${month}.${
                  year ? year : "????"
                }\`) nicht speichern (${(err as DiscordAPIError).message}!`,
              ),
            ],
            allowedMentions: { parse: [] }, // Prevent pings of other people
          });
        } else {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder().setDescription(
                `Ich habe den User nicht mitbekommen also kann ich auch keinen Geburtstag setzen!`,
              ),
            ],
            allowedMentions: { parse: [] }, // Prevent pings of other people
          });
        }
      }
    }
  },
};

export default exportObj;
