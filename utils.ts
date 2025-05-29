import { GuildMemberManager, UserResolvable } from "discord.js";

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
