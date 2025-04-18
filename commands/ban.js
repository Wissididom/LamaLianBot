import {
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import { fetchMember } from "../utils.js";

const exportObj = {
  name: "ban",
  description: "Bannt einen User",
  permissions: [PermissionsBitField.Flags.BanMembers],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Der User, der gebannt werden soll")
          .setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName("delete")
          .setDescription(
            "Die Zeit in welcher die Nachrichten des Users gelöscht werden sollen",
          )
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("reason")
          .setDescription("Die Begründung für den Bann")
          .setRequired(false)
      ),
  runInteraction: async (interaction, _db) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      const user = interaction.options.getUser("user");
      const deleteTime = interaction.options.getInteger("delete");
      const reason = interaction.options.getString("reason");
      if (interaction.user.id == user.id) {
        await interaction.editReply({
          content: `Du kannst dich nicht selbst bannen!`,
        });
        return;
      }
      const banObj = {};
      if (deleteTime) {
        banObj["deleteMessageSeconds"] = deleteTime;
      }
      if (reason) {
        banObj["reason"] =
          `[Ausgeführt von ${interaction.member.displayName}]: ${reason}`;
      } else {
        banObj["reason"] = `[Ausgeführt von ${interaction.member.displayName}]`;
      }
      const member = await fetchMember(interaction.guild.members, user);
      if (member && !member.bannable) {
        await interaction.editReply({
          content: `${member.user?.tag} kann ich nicht bannen!`,
        });
        return;
      }
      try {
        const banInfo = await interaction.guild.members.ban(user, banObj);
        await interaction.editReply({
          content: `${
            banInfo.user?.tag ?? banInfo.tag ?? banInfo
          } erfolgreich gebannt`,
        });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: err.toString() });
      }
    }
  },
};

export default exportObj;
