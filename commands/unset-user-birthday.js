import {
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";

let exportObj = {
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
          .setRequired(true),
      ),
  runInteraction: async (interaction, db) => {
    await interaction.deferReply();
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      let user = interaction.options.getUser("user");
      try {
        await db.deleteBirthday(user.id);
        await interaction.editReply({
          embeds: [
            new EmbedBuilder().setDescription(
              `<@${user.id}>'s Geburtstag erfolgreich gelöscht!`,
            ),
          ],
          allowedMentions: { parse: [] }, // Prevent pings of other people
        });
      } catch (err) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder().setDescription(
              `Geburtstag von <@${user.id}> konnte nicht gelöscht werden!`,
            ),
          ],
          allowedMentions: { parse: [] }, // Prevent pings of other people
        });
      }
    }
  },
};

export default exportObj;
