import { Message } from "discord.js";

async function checkLinks(links: string[]) {
  return await fetch("https://api.safelink.gg/v1/check", {
    method: "POST",
    headers: {
      "User-Agent": "LamaLianBot (https://wissididom.me, 0.1)",
    },
    body: JSON.stringify({
      urls: links,
    }),
  }).then((res) => {
    if (res.ok) {
      return res.json();
    } else {
      return res;
    }
  });
}

function findLinks(text: string): string[] {
  const urlPattern =
    /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\b[-A-Z0-9+&@#\/%?=~_|]+(\.[A-Z]{2,})+\b[-A-Z0-9+&@#\/%=~_|]*)/gi;
  const matches = text.match(urlPattern);
  return matches?.map((match) => {
    return match;
  }) ?? [];
}

export async function moderate(msg: Message) {
  // TODO: Delete, timeout, kick, ban and log action in logging channel if enabled
  const useSafelink = false;
  if (useSafelink) {
    const links = findLinks(msg.content);
    const result = await checkLinks(links);
    for (const entry of result.data) {
      if (entry.flags.length > 0) {
        // TODO: Found something, need to handle moderation. - Return false
      }
    }
    return true;
  } else {
    return true;
  }
}

//console.log(await checkLinks(findLinks('discord.gg/test abc https://grabify.com/test abc www.example.com')));
//console.log(findLinks('discord.gg/test abc https://grabify.com/test abc www.example.com abc https://www.example.com/test'));
