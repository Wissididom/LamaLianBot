import { EmbedBuilder, Interaction, SlashCommandBuilder } from "discord.js";
import Database from "../database/sqlite.ts";

const exportObj = {
  name: "birthday",
  description: "Den Geburtstag von dir selber oder jemand anderem abrufen",
  permissions: [],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Der User dessen Geburtstag du sehen möchtest")
          .setRequired(false)
      ),
  runInteraction: async (interaction: Interaction, db: Database) => {
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      await interaction.deferReply();
      let user = interaction.options.getUser("user");
      if (!user) {
        user = interaction.user;
      }
      const birthday = await db.getBirthday(user.id);
      if (birthday) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder().setDescription(
              `<@${user}>'s Geburtstag ist am \`${
                birthday.day.toString().padStart(2, "0")
              }.${birthday.month.toString().padStart(2, "0")}.${
                birthday.year ? birthday.year : "????"
              }\`!`,
            ),
          ],
          allowedMentions: { parse: [] }, // Prevent pings of other people
        });
      } else {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder().setDescription(
              `Ich kenne <@${user}>'s Geburtstag **noch** nicht!`,
            ),
          ],
          allowedMentions: { parse: [] }, // Prevent pings of other people
        });
      }
    }
  },
};

export default exportObj;
