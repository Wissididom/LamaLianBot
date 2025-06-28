// deno-lint-ignore-file no-explicit-any
import { REST, Routes } from "discord.js";
import { getRegisterArray } from "./commands.ts";

if (!Deno.env.has("DISCORD_TOKEN")) {
  throw new Error(
    "DISCORD_TOKEN not found! You must setup the DISCORD_TOKEN before running this bot.",
  );
}

const rest = new REST().setToken(Deno.env.get("DISCORD_TOKEN")!); // When .has return true, .get has to return a non-nullable value

(async () => {
  const registerArray = getRegisterArray();
  try {
    console.log(
      `Started refreshing ${registerArray.length} application (/) commands.`,
    );
    const userData = await rest.get(Routes.user());
    const userId: any = (userData as any).id;
    const data: any = await rest.put(Routes.applicationCommands(userId), {
      body: registerArray,
    });
    console.log(`Started reloaded ${data.length} application (/) commands.`);
  } catch (err) {
    console.error(err);
  }
})();
