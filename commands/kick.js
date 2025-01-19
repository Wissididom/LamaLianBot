import {
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import { fetchMember } from "../utils.js";

const exportObj = {
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
  runInteraction: async (interaction, _db) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      const user = interaction.options.getUser("user");
      const reason = interaction.options.getString("reason");
      if (interaction.user.id == user.id) {
        await interaction.editReply({
          content: `Du kannst dich nicht selbst kicken!`,
        });
        return;
      }
      const member = await fetchMember(interaction.guild.members, user);
      if (!member) {
        await interaction.editReply({
          content: `${member.user?.tag} ist nicht auf diesem Server!`,
        });
        return;
      }
      if (!member.kickable) {
        await interaction.editReply({
          content: `${member.user?.tag} kann ich nicht kicken!`,
        });
        return;
      }
      try {
        const kickInfo = await interaction.guild.members.kick(
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
