import { EmbedBuilder, SlashCommandBuilder, User } from "discord.js";

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
  runInteraction: async (interaction, db) => {
    await interaction.deferReply();
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      let user = interaction.options.getUser("user")?.id;
      if (!user) {
        user = interaction.user.id;
      }
      const birthday = await db.getBirthday(
        user instanceof User ? user.id : user,
      );
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
