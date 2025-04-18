import process from "node:process";
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export async function handleLevelling(db, message) {
  // Mee6 formular taken from https://wiki.cakey.bot/en/feature/leveling and/or https://github.com/Mee6/Mee6-documentation/blob/master/docs/levels_xp.md
  const min = 15;
  const max = 25;
  const gainedXp = Math.floor(randomIntFromInterval(min, max));
  const databaseTable = (await db.getLevelling(message.author.id))[0];
  // at max. once per minute allowed to avoid spamming
  if (
    databaseTable &&
    databaseTable.lastMessageTimestamp + 60 * 1000 >= message.createdTimestamp
  ) {
    return;
  }
  const xp = (databaseTable?.xp ?? 0) + gainedXp;
  let currentLvl = databaseTable?.lvl ?? 0;
  let nextLvlXp = !databaseTable || databaseTable.nextLvlXp == 0
    ? 5 * 1 ** 2 + 50 * 1 + 100 - xp
    : databaseTable.nextLvlXp;
  if (xp >= nextLvlXp) {
    // Level-Up
    currentLvl += 1;
    nextLvlXp = 5 * currentLvl ** 2 + 50 * currentLvl + 100 - xp;
    const levelupMessage = process.env.LEVELUP_MESSAGE.replace(
      "{player}",
      `<@${message.author.id}>`,
    )
      .replace("{level}", currentLvl)
      .replace("{xp}", xp);
    const levelupChannel = process.env.LEVELUP_CHANNEL.trim().toUpperCase();
    switch (levelupChannel) {
      case "DM": {
        await message.author.send({
          content: levelupMessage,
        });
        break;
      }
      case "": {
        await message.channel.send({
          content: levelupMessage,
        });
        break;
      }
      default: {
        const channel = await message.guild.channels.fetch(levelupChannel);
        if (!channel) break;
        await channel.send({
          content: levelupMessage,
        });
        break;
      }
    }
  }
  db.updateLevelling(
    message.author.id,
    message.createdTimestamp, /*milliseconds*/
    xp,
    currentLvl,
    nextLvlXp,
  );
}
