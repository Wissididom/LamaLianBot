import { GuildMemberManager, UserResolvable } from "discord.js";
import { DateTime } from "luxon";

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

export function isLeapYear(year: number): boolean {
  return year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
}

export function isLeapYearFallbackToday(
  currentDate: DateTime,
): boolean {
  return isLeapYear(currentDate.year) && currentDate.month === 3 &&
    currentDate.day === 1;
}
