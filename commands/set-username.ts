import {
  DiscordAPIError,
  Interaction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import Database from "../database/sqlite.ts";

const exportObj = {
  name: "set-username",
  description:
    "Setzt den Nutzernamen des Bots. Kann nur vom Bot-Owner ausgeführt werden",
  permissions: [],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addStringOption((option) =>
        option
          .setName("username")
          .setDescription("Der neue Username des Bots")
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
      const username = interaction.options.getString("username");
      try {
        if (username) {
          const user = await interaction.client.user?.setUsername(username);
          await interaction.editReply({
            content: `Username von ${user.username} erfolgreich geändert`,
          });
        } else {
          await interaction.editReply({
            content:
              "Ich haben den Usernamen nicht mitbekommen, daher kann ich den Usernamen auch nicht anpassen!",
          });
        }
      } catch (err) {
        if ((err as DiscordAPIError).name == "DiscordAPIError[50035]") {
          await interaction.editReply({
            content: `Discord hat mit "Invalid Form Body" geantwortet! Code: ${
              (err as DiscordAPIError).code
            }; Message: ${(err as DiscordAPIError).message}`,
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
