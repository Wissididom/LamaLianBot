import {
  EmbedBuilder,
  Interaction,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import Database from "../database/sqlite.ts";

const exportObj = {
  name: "unset-user-birthday",
  description: "Löscht den Geburtstag eines Users aus dem Bot",
  permissions: [PermissionsBitField.Flags.ManageGuild],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Der User, dessen Geburtstag gelöscht werden soll")
          .setRequired(true)
      ),
  runInteraction: async (interaction: Interaction, db: Database) => {
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      await interaction.deferReply();
      const user = interaction.options.getUser("user");
      try {
        if (user) {
          await db.deleteBirthday(user.id);
          await interaction.editReply({
            embeds: [
              new EmbedBuilder().setDescription(
                `<@${user.id}>'s Geburtstag erfolgreich gelöscht!`,
              ),
            ],
            allowedMentions: { parse: [] }, // Prevent pings of other people
          });
        } else {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder().setDescription(
                `Wie hast du es geschafft keinen User anzugeben? Der Geburtstag kann nicht gelöscht werden, da ich nicht weiß, welcher User gemeint ist!`,
              ),
            ],
            allowedMentions: { parse: [] }, // Prevent pings of other people
          });
        }
      } catch (err) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder().setDescription(
              user
                ? `Geburtstag von <@${user.id}> konnte nicht gelöscht werden!`
                : "Es wurde eine Ausnahme geworfen und es war kein User angegeben! Wie hast du das geschafft?!",
            ),
          ],
          allowedMentions: { parse: [] }, // Prevent pings of other people
        });
        console.log("unset-user-birthday", err);
      }
    }
  },
};

export default exportObj;
