import {
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";

const exportObj = {
  name: "unban",
  description: "Entbannt einen User",
  permissions: [PermissionsBitField.Flags.BanMembers],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Der User, der entbannt werden soll")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("reason")
          .setDescription("Die Begründung für die Entbannung")
          .setRequired(false)
      ),
  runInteraction: async (interaction, _db) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      let user = interaction.options.getUser("user");
      const reason = interaction.options.getString("reason");
      if (interaction.user.id == user.id) {
        await interaction.editReply({
          content: `Du kannst dich nicht selbst entbannen!`,
        });
        return;
      }
      try {
        user = await interaction.guild.members.unban(
          user,
          reason
            ? `[Ausgeführt von ${interaction.member.displayName}]: ${reason}`
            : `[Ausgeführt von ${interaction.member.displayName}]`,
        );
        await interaction.editReply({
          content: `${user?.tag} erfolgreich entbannt`,
        });
      } catch (err) {
        if (err.name == "DiscordAPIError[10026]") {
          await interaction.editReply({
            content:
              `${user?.tag} scheint nicht gebannt zu sein (entweder wurde bereits entbannt oder der User war nie gebannt)!`,
          });
          return;
        }
        console.error(err);
        await interaction.editReply({ content: err.toString() });
      }
    }
  },
};

export default exportObj;
