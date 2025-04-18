import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import process from "node:process";

const exportObj = {
  name: "ping",
  description: "Zeigt Informationen über den Bot in einem Embed an",
  permissions: [],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addBooleanOption((option) =>
        option
          .setName("public")
          .setDescription(
            "Ob die Antwort auf diesen Command für jeden auf dem Server sichtbar sein soll",
          )
          .setRequired(false)
      ),
  runInteraction: async (interaction, _db) => {
    const pub = interaction.options.getBoolean("public") == true;
    if (pub) {
      await interaction.deferReply();
    } else {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    }
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      try {
        const now = Date.now();
        const reply = await interaction.fetchReply();
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: interaction.guild.name,
                iconURL: interaction.guild.iconURL(),
              })
              .setImage(interaction.client.user.avatarURL())
              .addFields(
                { name: "Server-ID", value: interaction.guild.id },
                { name: "Server-Name", value: interaction.guild.name },
                { name: "Bot-ID", value: interaction.client.user.id },
                { name: "Bot-Name", value: interaction.client.user.username },
                {
                  name: "Bot-Owner-ID",
                  value: process.env.BOT_OWNER_USER_ID ?? "N/A",
                },
                {
                  name: "Bot-Owner-Name",
                  value: process.env.BOT_OWNER_USER_ID
                    ? (
                      await interaction.client.users.fetch(
                        process.env.BOT_OWNER_USER_ID,
                      )
                    )?.username
                    : "N/A",
                },
                {
                  name: "Latency",
                  value: `${
                    reply.createdTimestamp - interaction.createdTimestamp
                  }ms`,
                },
                { name: "Powered by", value: `Node.js ${process.version}` },
                {
                  name: "Uptime",
                  value: `${interaction.client.uptime / 1000}s - <t:${
                    Math.round((now - interaction.client.uptime) / 1000)
                  }:F> (<t:${
                    Math.round((now - interaction.client.uptime) / 1000)
                  }:R>)`,
                },
              )
              .setThumbnail(interaction.guild.iconURL()),
          ],
        });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: err.toString() });
      }
    }
  },
};

export default exportObj;
