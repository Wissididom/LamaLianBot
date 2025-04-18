import {
  Interaction,
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import { fetchMember } from "../utils.ts";
import Database from "../database/sqlite.ts";

const exportObj = {
  name: "mute",
  description: "Gibt einem User einen Timeout",
  permissions: [PermissionsBitField.Flags.ModerateMembers],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Der User, der einen Timeout bekommen soll")
          .setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName("duration")
          .setDescription(
            "Die Zeit, die der User in Timeout versetzt werden soll",
          )
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("reason")
          .setDescription("Die Begründung für den Timeout")
          .setRequired(false)
      ),
  runInteraction: async (interaction: Interaction, _db: Database) => {
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const user = interaction.options.getUser("user");
      const duration = interaction.options.getInteger("duration") ?? 60;
      const reason = interaction.options.getString("reason");
      if (interaction.user.id == user?.id) {
        await interaction.editReply({
          content: `Du kannst dich nicht selbst in Timeout versetzen!`,
        });
        return;
      }
      if (user) {
        let member = await fetchMember(interaction.guild.members, user);
        if (!member) {
          await interaction.editReply({
            content: `${user.tag} ist nicht auf diesem Server!`,
          });
          return;
        }
        if (!member.moderatable) {
          await interaction.editReply({
            content: `${member.user?.tag} kann ich nicht in Timeout versetzen!`,
          });
          return;
        }
        try {
          member = await member.disableCommunicationUntil(
            Date.now() + duration * 1000,
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
              `<@${member.id}> erfolgreich für ${duration} Sekunden in Timeout versetzt`,
          });
        } catch (err) {
          console.error(err);
          await interaction.editReply({ content: (err as Error).toString() });
        }
      } else {
        await interaction.editReply({
          content:
            "Ich habe den User nicht mitbekommen und deshalb kann ich auch niemanden muten",
        });
      }
    }
  },
};

export default exportObj;
