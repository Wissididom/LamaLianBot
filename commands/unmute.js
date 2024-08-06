import { PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { fetchMember } from "../utils.js";

let exportObj = {
  name: "unmute",
  description: "Hebt den Timeout eines User auf",
  permissions: [PermissionsBitField.Flags.ModerateMembers],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Der User, dessen Timeout entfernt werden soll")
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("reason")
          .setDescription("Die Begründung für das Aufheben des Timeouts")
          .setRequired(false),
      ),
  runInteraction: async (interaction, db) => {
    await interaction.deferReply({ ephemeral: true });
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      let user = interaction.options.getUser("user");
      let reason = interaction.options.getString("reason");
      if (interaction.user.id == user.id) {
        await interaction.editReply({
          content: `Du kannst dein eigenes Timeout nicht selbst aufheben!`,
        });
        return;
      }
      try {
        let member = await fetchMember(interaction.guild.members, user);
        if (!member) {
          await interaction.editReply({
            content: `${user.tag} ist nicht auf diesem Server!`,
          });
          return;
        }
        member = await member.disableCommunicationUntil(
          null,
          reason
            ? `[Ausgeführt von ${interaction.member.displayName}]: ${reason}`
            : `[Ausgeführt von ${interaction.member.displayName}]`,
        );
        await interaction.editReply({
          content: `Das Timeout von ${member.user?.tag} wurde erfolgreich aufgehoben`,
        });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: err.toString() });
      }
    }
  },
};

export default exportObj;