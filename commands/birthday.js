import { EmbedBuilder, SlashCommandBuilder, User } from "discord.js";

let exportObj = {
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
          .setRequired(false),
      ),
  runInteraction: async (interaction, db) => {
    await interaction.deferReply({ ephemeral: true });
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      let user = interaction.options.getUser("user")?.id;
      if (!user) {
        user = interaction.user.id;
      }
      let birthday = await db.getBirthday(
        user instanceof User ? user.id : user,
      );
      if (birthday) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder().setDescription(
              `<@${user}>'s Geburtstag is am \`${birthday.day}.${birthday.month}.${birthday.year ? birthday.year : "????"}\`!`,
            ),
          ],
          allowed_mentions: { parse: [] }, // Prevent pings of other people
        });
      } else {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder().setDescription(
              `Ich kenne <@${user}>'s Geburtstag **noch** nicht!`,
            ),
          ],
          allowed_mentions: { parse: [] }, // Prevent pings of other people
        });
      }
    }
  },
};

export default exportObj;