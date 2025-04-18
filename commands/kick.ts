import {
  EmbedBuilder,
  GuildMember,
  Interaction,
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder,
  User,
} from "discord.js";
import { fetchMember } from "../utils.ts";
import Database from "../database/sqlite.ts";

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
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("reason")
          .setDescription("Die Begründung für den Kick")
          .setRequired(false)
      ),
  runInteraction: async (interaction: Interaction, _db: Database) => {
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const user = interaction.options.getUser("user");
      const reason = interaction.options.getString("reason");
      if (interaction.user.id == user?.id) {
        await interaction.editReply({
          content: `Du kannst dich nicht selbst kicken!`,
        });
        return;
      }
      if (user) {
        const member = await fetchMember(interaction.guild.members, user);
        if (!member) {
          await interaction.editReply({
            content: `${user.username} ist nicht auf diesem Server!`,
          });
          return;
        }
        if (!member.kickable) {
          await interaction.editReply({
            content: `${member.user.username} kann ich nicht kicken!`,
          });
          return;
        }
        try {
          const kickInfo = await interaction.guild.members.kick(
            user,
            reason
              ? `[Ausgeführt von ${
                interaction.member?.user.username ?? "N/A"
              }]: ${reason}`
              : `[Ausgeführt von ${
                interaction.member?.user.username ?? "N/A"
              }]`,
          );
          let kickInfoStr;
          if (kickInfo instanceof GuildMember) {
            kickInfoStr = kickInfo.user.username;
          } else if (kickInfo instanceof User) {
            kickInfoStr = kickInfo.username;
          } else if (typeof kickInfo === "string") {
            kickInfoStr = kickInfo;
          } else {
            kickInfoStr = "N/A";
          }
          await interaction.editReply({
            embeds: [
              new EmbedBuilder().setDescription(
                `${kickInfoStr} erfolgreich gekickt`,
              ),
            ],
          });
        } catch (err) {
          console.error(err);
          await interaction.editReply({ content: (err as Error).toString() });
        }
      } else {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder().setDescription(
              "Ich habe den User nicht mitbekommen, also kann ich diesen auch nicht kicken!",
            ),
          ],
        });
      }
    }
  },
};

export default exportObj;
