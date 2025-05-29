import {
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
  runInteraction: async (interaction: Interaction, _db: Database) => {
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const user = interaction.options.getUser("user");
      const deleteTime = interaction.options.getInteger("delete");
      const reason = interaction.options.getString("reason");
      if (interaction.user.id == user?.id) {
        await interaction.editReply({
          content: `Du kannst dich nicht selbst bannen!`,
        });
        return;
      }
      const banObj: {
        deleteMessageSeconds: number | undefined;
        reason: string | undefined;
      } = {
        deleteMessageSeconds: undefined,
        reason: undefined,
      };
      if (deleteTime) {
        banObj.deleteMessageSeconds = deleteTime;
      }
      if (reason) {
        banObj.reason =
          `[Ausgeführt von ${interaction.member?.user.username}]: ${reason}`;
      } else {
        banObj.reason = `[Ausgeführt von ${interaction.member?.user.username}]`;
      }
      if (user) {
        const member = await fetchMember(interaction.guild.members, user);
        if (member && !member.bannable) {
          await interaction.editReply({
            content: `${member.user?.tag} kann ich nicht bannen!`,
          });
          return;
        }
        try {
          const banInfo = await interaction.guild.members.ban(user, banObj);
          let banInfoStr;
          if (banInfo instanceof GuildMember) {
            banInfoStr = banInfo.user.username;
          } else if (banInfo instanceof User) {
            banInfoStr = banInfo.username;
          } else if (typeof banInfo === "string") {
            banInfoStr = banInfo;
          } else {
            banInfoStr = "N/A";
          }
          await interaction.editReply({
            content: `${banInfoStr} erfolgreich gebannt`,
          });
        } catch (err) {
          console.error(err);
          await interaction.editReply({ content: (err as Error).toString() });
        }
      }
    }
  },
};

export default exportObj;
