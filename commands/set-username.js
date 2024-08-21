import { SlashCommandBuilder } from "discord.js";

let exportObj = {
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
          .setRequired(true),
      ),
  runInteraction: async (interaction, db) => {
    if (interaction.user.id != process.env.BOT_OWNER_USER_ID) {
      await interaction.reply({
        content: `Nur <@${process.env.BOT_OWNER_USER_ID}> (Bot-Owner) kann diesen Befehl nutzen`,
        ephemeral: true,
      });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      let username = interaction.options.getString("username");
      try {
        let user = await interaction.client.user?.setUsername(username);
        await interaction.editReply({
          content: `Username von ${user.tag} erfolgreich geändert`,
        });
      } catch (err) {
        if (err.name == "DiscordAPIError[50035]") {
          await interaction.editReply({
            content: `Discord hat mit "Invalid Form Body" geantwortet! Code: ${err.rawError.errors.username?._errors[0]?.code}; Message: ${err.rawError.errors.username?._errors[0]?.message}`,
          });
          return;
        }
        console.error(err);
        await interaction.editReply({ content: err.toString() });
      }
    }
  },
};

export default exportObj;
