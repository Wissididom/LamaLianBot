import {
  Interaction,
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import Database from "../database/sqlite.ts";

const exportObj = {
  name: "warn",
  description:
    "Warnt einen User indem der Bot die angegebene Nachricht an den User per DM sendet",
  permissions: [PermissionsBitField.Flags.ModerateMembers],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Der User, der gewarnt werden soll")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("reason")
          .setDescription(
            "Die Nachricht, die an den User per DM gesendet werden soll",
          )
          .setRequired(false)
      ),
  runInteraction: async (interaction: Interaction, _db: Database) => {
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const user = interaction.options.getUser("user");
      let reason = interaction.options.getString("reason");
      if (interaction.user.id == user?.id) {
        await interaction.editReply({
          content: `Du kannst dich nicht selbst warnen!`,
        });
        return;
      }
      if (!reason) {
        reason =
          "Es wurde keine Begründung von den Mods angegeben / No reason provided by mods";
      }
      try {
        await user?.send({
          content:
            `You were warned on the server **${interaction.guild.name}** for / Du wurdest auf **${interaction.guild.name}** für folgendes gewarnt:\n\`\`\`${reason}\`\`\``,
        });
        await interaction.editReply({
          content: `DM an ${user?.username} wurde erfolgreich gesendet`,
        });
      } catch (err) {
        if ((err as Error).name == "DiscordAPIError[50007]") {
          await interaction.editReply({
            content: `Ich kann an ${user?.username} keine DMs schicken!`,
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
