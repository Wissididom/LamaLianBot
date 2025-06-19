import { GuildMemberManager, UserResolvable } from "discord.js";

export async function fileExists(path: string): Promise<boolean> {
  try {
    await Deno.lstat(path);
    return true;
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
    return false;
  }
}

export async function fetchMember(
  memberManager: GuildMemberManager,
  user: UserResolvable,
) {
  try {
    return await memberManager.fetch(user);
  } catch (err) {
    if ((err as Error).name == "DiscordAPIError[10007]") {
      return null;
    }
    throw err;
  }
}
