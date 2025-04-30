import {
  EmbedBuilder,
  Interaction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import Database from "../database/sqlite.ts";

const exportObj = {
  name: "serverinfo",
  description: "Zeigt Informationen über den Server in einem Embed an",
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
  runInteraction: async (interaction: Interaction, _db: Database) => {
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      const pub = interaction.options.getBoolean("public") == true;
      if (pub) {
        await interaction.deferReply();
      } else {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      }
      try {
        const { guild } = interaction;
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL() ?? undefined,
              })
              .setImage(guild.iconURL())
              .addFields(
                { name: "Owner-ID", value: guild.ownerId },
                {
                  name: "Owner-Name",
                  value: guild.ownerId
                    ? (await guild.client.users.fetch(guild.ownerId))?.username
                    : "N/A",
                },
                { name: "Server-ID", value: guild.id },
                { name: "Server-Name", value: guild.name },
                {
                  name: "Text Channels",
                  value: guild.channels.cache
                    .filter((c) => c.type === 0)
                    .size.toString(),
                  inline: true,
                },
                {
                  name: "Voice Channels",
                  value: guild.channels.cache
                    .filter((c) => c.type === 2)
                    .size.toString(),
                  inline: true,
                },
                {
                  name: "Category Channels",
                  value: guild.channels.cache
                    .filter((c) => c.type === 4)
                    .size.toString(),
                  inline: true,
                },
                {
                  name: "Members",
                  value: guild.memberCount.toString(),
                  inline: true,
                },
                {
                  name: "Roles",
                  value: guild.roles.cache
                    .filter((r) => r.name != "@everyone")
                    .size.toString(),
                  inline: true,
                },
                {
                  name: "Created",
                  value: `<t:${
                    Math.round(guild.createdTimestamp / 1000)
                  }:F> (<t:${Math.round(guild.createdTimestamp / 1000)}:R>)`,
                },
                {
                  name: "Role List",
                  value: guild.roles.cache
                    .filter((r) => r.name != "@everyone")
                    .map((r) => `<@&${r.id}>`)
                    .join(", "),
                },
              )
              .setThumbnail(guild.iconURL())
              .setFooter({ text: `Server-ID: ${guild.id}` }),
          ],
        });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: (err as Error).toString() });
      }
    }
  },
};

export default exportObj;
