import {
  EmbedBuilder,
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";

async function getLevellingLevelsResponseObject(db, page) {
  if (page == undefined || page == null || page < 1) page = 1;
  const databaseTable = await db.getLevelling();
  const response = [];
  for (let i = 0; i < databaseTable.length; i++) {
    if (databaseTable[i].userId == user.id) {
      response.push(
        `User <@${databaseTable[i].userId}>; Rank #${i + 1}; Level ${databaseTable[i].lvl} (${databaseTable[i].xp} / ${databaseTable[i].nextLvlXp} XP)`,
      );
    }
  }
  if (response.length > 0) {
    return {
      embeds: [
        new EmbedBuilder()
          .setTitle("Levels:")
          .setDescription("\`\`\`\n" + response.join("\n") + "\n\`\`\`"),
      ],
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
          .setRequired(false),
      ),
  runInteraction: async (interaction, db) => {
    if (interaction.options.getBoolean("public") == false) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    } else {
      await interaction.deferReply();
    }
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      let page = interaction.options.getInteger("page");
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
