import { Interaction, MessageFlags, SlashCommandBuilder } from "discord.js";
import Database from "../database/sqlite.ts";

const exportObj = {
  name: "set-avatar",
  description:
    "Setzt den Avatar des Bots. Kann nur vom Bot-Owner ausgeführt werden",
  permissions: [],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addAttachmentOption((option) =>
        option
          .setName("avatar")
          .setDescription("Der neue Avatar des Bots")
          .setRequired(true)
      ),
  runInteraction: async (interaction: Interaction, _db: Database) => {
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      if (interaction.user.id != Deno.env.get("BOT_OWNER_USER_ID")) {
        await interaction.reply({
          content: `Nur <@${
            Deno.env.get("BOT_OWNER_USER_ID")
          }> (Bot-Owner) kann diesen Befehl nutzen`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const avatar = interaction.options.getAttachment("avatar");
      try {
        if (avatar) {
          const user = await interaction.client.user?.setAvatar(avatar.url);
          await interaction.editReply({
            content: `Avatar von ${user.tag} erfolgreich geändert`,
          });
        } else {
          await interaction.editReply({
            content: `Hochgeladener Avatar konnte nicht geladen werden!`,
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
