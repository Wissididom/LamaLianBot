import { PermissionsBitField, SlashCommandBuilder } from "discord.js";

let exportObj = {
  name: "kick",
  description: "Kickt einen User",
  permissions: [PermissionsBitField.Flags.KickMembers],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Der User, der gekickt werden soll")
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("reason")
          .setDescription("Die Begründung für den Kick")
          .setRequired(false),
      ),
  runInteraction: async (interaction, db) => {
    await interaction.deferReply({ ephemeral: true });
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      let user = interaction.options.getUser("user");
      let reason = interaction.options.getString("reason");
      try {
        let kickInfo = await interaction.guild.members.kick(
          user,
          reason
            ? `[Ausgeführt von ${interaction.member.displayName}]: ${reason}`
            : `[Ausgeführt von ${interaction.member.displayName}]`,
        );
        await interaction.editReply({
          content: `${kickInfo.user?.tag ?? kickInfo.tag ?? kickInfo} erfolgreich gekickt`,
        });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: err.toString() });
      }
    }
  },
};

export default exportObj;
