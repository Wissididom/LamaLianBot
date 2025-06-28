import {
  Interaction,
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import Database from "../database/sqlite.ts";

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
  runInteraction: async (interaction: Interaction, _db: Database) => {
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      let user = interaction.options.getUser("user");
      const reason = interaction.options.getString("reason");
      if (interaction.user.id == user?.id) {
        await interaction.editReply({
          content: `Du kannst dich nicht selbst entbannen!`,
        });
        return;
      }
      try {
        if (user) {
          user = await interaction.guild.members.unban(
            user,
            reason
              ? `[Ausgeführt von ${interaction.member?.user.username}]: ${reason}`
              : `[Ausgeführt von ${interaction.member?.user.username}]`,
          );
          await interaction.editReply({
            content: `${user?.tag} erfolgreich entbannt`,
          });
        } else {
          await interaction.editReply({
            content:
              `Wie hast du es geschafft keinen User anzugeben? Der User kann nicht entbannt werden, da ich nicht weiß, welcher User gemeint ist!`,
          });
        }
      } catch (err) {
        if ((err as Error).name == "DiscordAPIError[10026]") {
          await interaction.editReply({
            content:
              `${user?.tag} scheint nicht gebannt zu sein (entweder wurde bereits entbannt oder der User war nie gebannt)!`,
          });
          return;
        }
        console.error(err);
        await interaction.editReply({ content: (err as Error).toString() });
      }
    }
  },
};

export default exportObj;
