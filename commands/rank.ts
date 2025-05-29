import {
  EmbedBuilder,
  Interaction,
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder,
  User,
} from "discord.js";
import Database from "../database/sqlite.ts";

async function getLevellingRankResponseObject(db: Database, user: User) {
  const databaseTable = await db.getLevelling(user.id);
  for (let i = 0; i < databaseTable.length; i++) {
    if (databaseTable[i].userId == user.id) {
      return {
        embeds: [
          new EmbedBuilder().setTitle(`Rang gefunden`).addFields(
            {
              name: "User",
              value:
                `<@${user.id}> (\`${user.displayName}\` - \`${user.username}\` - ${user.id})`,
            },
            { name: "Rank", value: `#${i + 1}` },
            {
              name: "Level",
              value: `${databaseTable[i].lvl} (${databaseTable[i].xp} / ${
                databaseTable[i].nextLvlXp
              } XP)`,
            },
          ),
        ],
      };
    }
  }
  return {
    embeds: [
      new EmbedBuilder()
        .setTitle("Kein Levelling-Eintrag")
        .setDescription(
          `Es konnt kein Levelling-Eintrag für <@${user.id}> (\`${user.displayName}\` - \`${user.username}\` - ${user.id}) gefunden werden!`,
        ),
    ],
  };
}

const exportObj = {
  name: "rank",
  description: "Den Rang eines Users oder deinen eigenen abfragen",
  permissions: [PermissionsBitField.Flags.BanMembers],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Der User, dessen Rang abgefragt werden soll")
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName("public")
          .setDescription("Ob die Antwort des Bots öffentlich sein soll")
          .setRequired(false)
      ),
  runInteraction: async (interaction: Interaction, db: Database) => {
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      if (interaction.options.getBoolean("public") == false) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      } else {
        await interaction.deferReply();
      }
      let user = interaction.options.getUser("user");
      if (!user) {
        user = interaction.user;
      }
      try {
        await interaction.editReply(
          await getLevellingRankResponseObject(db, user),
        );
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: (err as Error).toString() });
      }
    }
  },
};

export default exportObj;
