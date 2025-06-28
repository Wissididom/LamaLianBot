import {
  Interaction,
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import { fetchMember } from "../utils.ts";
import Database from "../database/sqlite.ts";

const exportObj = {
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
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("reason")
          .setDescription("Die Begründung für das Aufheben des Timeouts")
          .setRequired(false)
      ),
  runInteraction: async (interaction: Interaction, _db: Database) => {
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const user = interaction.options.getUser("user");
      const reason = interaction.options.getString("reason");
      if (interaction.user.id == user?.id) {
        await interaction.editReply({
          content: `Du kannst dein eigenes Timeout nicht selbst aufheben!`,
        });
        return;
      }
      try {
        if (user) {
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
              ? `[Ausgeführt von ${
                interaction.member?.user.username ?? "N/A"
              }]: ${reason}`
              : `[Ausgeführt von ${
                interaction.member?.user.username ?? "N/A"
              }]`,
          );
          await interaction.editReply({
            content:
              `Das Timeout von ${member.user.username} wurde erfolgreich aufgehoben`,
          });
        }
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: (err as Error).toString() });
      }
    }
  },
};

export default exportObj;
