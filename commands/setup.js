import {
  EmbedBuilder,
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";

function getXpFromLvl0To(level) {
  if (level <= 0) {
    return 100.0;
  }
  let xpPrevious = getXpFromLvl0To(level - 1);
  let xpOnlyNextLvl = 5 * level ** 2 + 50 * level + 100;
  return xpOnlyNextLvl + xpPrevious;
}

async function getImportMee6ResponseObject(db, serverId, interaction) {
  let resultArray = [];
  for (let i = 0; true; i++) {
    let mee6response = await fetch(
      `https://mee6.xyz/api/plugins/levels/leaderboard/${serverId}?page=${i}`,
    );
    if (mee6response.ok) {
      let mee6json = await mee6response.json();
      if (mee6json.players.length < 1) break; // End of list
      for (let player of mee6json.players) {
        resultArray.push(player);
      }
      if (interaction) {
        await interaction.editReply({
          content: `Seite ${i + 1} wird geladen...`,
          allowedMentions: { parse: [] },
        });
      }
    } else {
      if (mee6response.status == 404) {
        // Probably "Guild not found"
        return {
          content: `Importieren des Servers ${serverId} ist fehlgeschlagen, weil das Leaderboard nicht gefunden wurde, wahrscheinlich ist es privat oder nicht-existent!`,
          allowedMentions: { parse: [] },
        };
      }
      if (mee6response.status == 429) {
        // Cloudflare Too Many Requests
        let retryAfter = mee6response.headers.get("retry-after");
        console.log(`429 (${retryAfter} Sekunden) bekommen!`);
        await new Promise((resolve, reject) => {
          setTimeout(() => resolve(), 1000 * retryAfter);
        });
        i--;
      } else {
        break;
      }
    }
  }
  let importCount = 0;
  if (resultArray.length > 0) {
    await db.deleteLevelling();
  }
  for (let player of resultArray) {
    await db.updateLevelling(
      player.id,
      0,
      player.xp,
      player.level,
      getXpFromLvl0To(player.level),
    );
    importCount++;
  }
  if (importCount > 0) {
    return {
      content: `${importCount} levels von Mee6 importiert, inklusive deren XP`,
      allowedMentions: { parse: [] },
    };
  } else {
    return {
      content: `Keine level/xp importiert! Wahrscheinlich hat Mee6 keine Level gespeichert oder dies ist ein unbehandelter Use-Case`,
      allowedMentions: { parse: [] },
    };
  }
}

const exportObj = {
  name: "setup",
  description: "Richtet den Bot ein",
  permissions: [PermissionsBitField.Flags.Administrator],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addSubcommand((option) =>
        option
          .setName("import-mee6")
          .setDescription("Level von Mee6 importieren")
          .addStringOption((option) =>
            option
              .setName("server-id")
              .setDescription(
                "Die Server-ID der zu importierenden Mee6-Installation",
              )
              .setRequired(false),
          ),
      )
      .addSubcommand((option) =>
        option
          .setName("export-sql-dump")
          .setDescription("SQL Dump exportieren (noch nicht implementiert)"),
      )
      .addSubcommand((option) =>
        option
          .setName("import-sql-dump")
          .setDescription("SQL Dump importieren (noch nicht implementiert)")
          .addAttachmentOption((option) =>
            option
              .setName("sql-dump")
              .setDescription("Der zu importierende SQL-Dump")
              .setRequired(true),
          ),
      ),
  runInteraction: async (interaction, db) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      try {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
          case "import-mee6": {
            let serverId =
              interaction.options.getString("server-id") ??
              interaction.guild.id;
            await interaction.editReply(
              await getImportMee6ResponseObject(db, serverId, interaction),
            );
            break;
          }
        }
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: err.toString() });
      }
    }
  },
};

export default exportObj;
