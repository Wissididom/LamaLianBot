import {
  ChatInputCommandInteraction,
  Interaction,
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import Database from "../database/sqlite.ts";

function getXpFromLvl0To(level: number): bigint {
  if (level <= 0) {
    return 100n;
  }
  const xpPrevious = getXpFromLvl0To(level - 1);
  const xpOnlyNextLvl = 5n * BigInt(level) ** 2n + 50n * BigInt(level) + 100n;
  return xpOnlyNextLvl + xpPrevious;
}

async function getImportMee6ResponseObject(
  db: Database,
  serverId: string,
  interaction: ChatInputCommandInteraction,
) {
  const resultArray = [];
  for (let i = 0; true; i++) {
    const mee6response = await fetch(
      `https://mee6.xyz/api/plugins/levels/leaderboard/${serverId}?page=${i}`,
    );
    if (mee6response.ok) {
      const mee6json = await mee6response.json();
      if (mee6json.players.length < 1) break; // End of list
      for (const player of mee6json.players) {
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
          content:
            `Importieren des Servers ${serverId} ist fehlgeschlagen, weil das Leaderboard nicht gefunden wurde, wahrscheinlich ist es privat oder nicht-existent!`,
          allowedMentions: { parse: [] },
        };
      }
      if (mee6response.status == 429) {
        // Cloudflare Too Many Requests
        const retryAfter = parseInt(
          mee6response.headers.get("retry-after") ?? "1000",
          10,
        );
        console.log(`429 (${retryAfter} Sekunden) bekommen!`);
        await new Promise<void>((resolve) => {
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
  for (const player of resultArray) {
    await db.updateLevelling(
      player.id,
      0n,
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
      content:
        `Keine level/xp importiert! Wahrscheinlich hat Mee6 keine Level gespeichert oder dies ist ein unbehandelter Use-Case`,
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
              .setRequired(false)
          )
      )
      .addSubcommand((option) =>
        option
          .setName("export-sql-dump")
          .setDescription("SQL Dump exportieren (noch nicht implementiert)")
      )
      .addSubcommand((option) =>
        option
          .setName("import-sql-dump")
          .setDescription("SQL Dump importieren (noch nicht implementiert)")
          .addAttachmentOption((option) =>
            option
              .setName("sql-dump")
              .setDescription("Der zu importierende SQL-Dump")
              .setRequired(true)
          )
      ),
  runInteraction: async (interaction: Interaction, db: Database) => {
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      try {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
          case "import-mee6": {
            const serverId = interaction.options.getString("server-id") ??
              interaction.guild.id;
            await interaction.editReply(
              await getImportMee6ResponseObject(db, serverId, interaction),
            );
            break;
          }
        }
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: (err as Error).toString() });
      }
    }
  },
};

export default exportObj;
