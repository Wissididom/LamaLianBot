import {
  EmbedBuilder,
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";

async function getLevellingLevelsResponseObject(db, page = 1) {
  if (page == undefined || page == null || page < 1) page = 1;
  const databaseTable = await db.getLevelling();
  const response = [];
  for (let i = 0; i < databaseTable.length; i++) {
    response.push(
      `Rang ${i + 1}; <@${databaseTable[i].userId}>; Level ${
        databaseTable[i].lvl
      } (${databaseTable[i].xp} / ${databaseTable[i].nextLvlXp} XP)`,
    );
  }
  if (response.length > 0) {
    const responseEmbeds = [];
    let currentPart = "";
    for (const line of response) {
      if (currentPart.length + line.length + 1 > 4096) {
        responseEmbeds.push(new EmbedBuilder().setDescription(currentPart));
        currentPart = line;
      } else {
        if (currentPart.length > 0) {
          currentPart += "\n";
        }
        currentPart += line;
      }
    }
    if (currentPart.length > 0) {
      responseEmbeds.push(new EmbedBuilder().setDescription(currentPart));
    }
    if (page < 1 || page > responseEmbeds.length) {
      return {
        embeds: [
          new EmbedBuilder()
            .setTitle("Ungültige Seite")
            .setDescription(
              `Bitte nur Seiten zwischen 1 und ${responseEmbeds.length} verwenden!`,
            ),
        ],
      };
    }
    return {
      embeds: [responseEmbeds[page - 1]],
    };
  } else {
    return {
      embeds: [
        new EmbedBuilder()
          .setTitle("Keine Levelling-Einträge gefunden")
          .setDescription(
            "Es konnten keine Levelling-Einträge gefunden werden!",
          ),
      ],
    };
  }
}

const exportObj = {
  name: "levels",
  description: "Ruft eine Liste an Rängen und Usern ab",
  permissions: [PermissionsBitField.Flags.BanMembers],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addBooleanOption((option) =>
        option
          .setName("public")
          .setDescription("Ob die Antwort des Bots öffentlich sein soll")
          .setRequired(false)
      )
      .addIntegerOption((option) =>
        option
          .setName("page")
          .setDescription("Seite die angezeigt werden soll")
          .setRequired(false)
      ),
  runInteraction: async (interaction, db) => {
    if (interaction.options.getBoolean("public") == false) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    } else {
      await interaction.deferReply();
    }
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      const page = interaction.options.getInteger("page") ?? 1;
      try {
        await interaction.editReply(
          await getLevellingLevelsResponseObject(db, page),
        );
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: err.toString() });
      }
    }
  },
};

export default exportObj;
