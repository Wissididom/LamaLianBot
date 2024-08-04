import "dotenv/config";

import { REST, Routes } from "discord.js";
import { getRegisterArray } from "./commands.js";

if (!process.env.DISCORD_TOKEN) {
  throw new Error(
    "DISCORD_TOKEN not found! You must setup the DISCORD_TOKEN before running this bot.",
  );
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  const registerArray = await getRegisterArray();
  try {
    console.log(
      `Started refreshing ${registerArray.length} application (/) commands.`,
    );
    const userData = await rest.get(Routes.user());
    const userId = userData.id;
    const data = await rest.put(Routes.applicationCommands(userId), {
      body: registerArray,
    });
    console.log(`Started reloaded ${data.length} application (/) commands.`);
  } catch (err) {
    console.error(err);
  }
})();
