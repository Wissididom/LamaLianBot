export async function fetchMember(memberManager, user) {
  try {
    return await memberManager.fetch(user);
  } catch (err) {
    if (err.name == "DiscordAPIError[10007]") {
      return null;
    }
    throw err;
  }
}
