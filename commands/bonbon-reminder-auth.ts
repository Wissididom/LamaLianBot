import { Interaction, MessageFlags, SlashCommandBuilder } from "discord.js";
import Database from "../database/sqlite.ts";

const exportObj = {
  name: "bonbon-reminder-auth",
  description: "Gets the auth url for authorizing the bonbon reminder",
  permissions: [],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description),
  runInteraction: async (interaction: Interaction, _db: Database) => {
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      const clientId = Deno.env.get("TWITCH_CLIENT_ID");
      const streamerAuthUrl =
        `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=http://localhost&response_type=code&scope=${
          encodeURIComponent("channel:bot")
        }`;
      const chatterAuthUrl =
        `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=http://localhost&response_type=code&scope=${
          encodeURIComponent(
            "user:write:chat moderator:manage:announcements user:bot",
          )
        }`;
      await interaction.reply({
        content:
          `Streamer-Account: [Authorize](<${streamerAuthUrl}>)\nChatter-Account: [Authorize](<${chatterAuthUrl}>)\nNach der Authorisierung kommt eine Seite, die nicht geladen werden kann. Wenn in der url nichts von error steht hat alles geklappt.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export default exportObj;
