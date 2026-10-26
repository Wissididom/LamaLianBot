import { Client } from "discord.js";
import Database from "../database/sqlite.ts";

async function getTwitchToken(clientId: string, clientSecret: string) {
  const params = new URLSearchParams(
    {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials"
    }
  );
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: params
  });
  if (!res.ok) {
    throw `failed to get token: ${res.status} ${await res.text()}`;
  }
  return await res.json() as {
    access_token: string,
    expires_in: number,
    token_type: string
  };
}

async function sendChatMessage(accessToken: string, clientId: string, broadcasterId: string, senderId: string, message: string) {
  const payload = {
    broadcaster_id: broadcasterId,
    sender_id: senderId,
    message: message,
    for_source_only: "false"
  };
  const res = await fetch("https://api.twitch.tv/helix/chat/messages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Client-ID": clientId,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw `failed to send message: ${res.status} ${await res.text()}`;
  }
  const responseText = await res.text();
  console.log(`Bonbon-Reminder-Message: ${new Date()}: ${senderId} -> ${broadcasterId}\n${responseText}`);
  return JSON.parse(responseText) as {
    data: {
      message_id: string,
      is_sent: boolean
    }[]
  };
}

async function sendChatAnnouncement(accessToken: string, clientId: string, broadcasterId: string, senderId: string, message: string) {
  const payload = {
    message: message,
    for_source_only: "false"
  };
  const res = await fetch(`https://api.twitch.tv/helix/chat/announcements?broadcaster_id=${broadcasterId}&moderator_id=${senderId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Client-ID": clientId,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw `failed to send message: ${res.status} ${await res.text()}`;
  }
  console.log(`Bonbon-Reminder-Announcement: ${new Date()}: ${senderId} -> ${broadcasterId}`);
  return res.ok;
}

const exportObj = {
  name: "bonbon-reminder",
  description: "background worker that reminds to take bonbons at a given cron expression",
  cron: `0 0 ${Deno.env.get("BONBON_REMINDER_HOURS")} * * *`,
  run: async (_client: Client, _db: Database) => {
    const clientId = Deno.env.get("TWITCH_CLIENT_ID");
    const clientSecret = Deno.env.get("TWITCH_CLIENT_SECRET");
    if (!clientId || !clientSecret) return;
    const config: {
      channelIds: string[],
      senderId: string,
      textMessage: string,
      useAnnouncements: boolean
    }[] = JSON.parse(await Deno.readTextFile("bonbon-reminder.json"));
    const token = await getTwitchToken(clientId, clientSecret);
    for (const configEntry of config) {
      for (const channelId of configEntry.channelIds) {
        if (configEntry.useAnnouncements) {
          await sendChatAnnouncement(token.access_token, clientId, channelId, configEntry.senderId, configEntry.textMessage);
        } else {
          await sendChatMessage(token.access_token, clientId, channelId, configEntry.senderId, configEntry.textMessage);
        }
      }
    }
  },
};

export default exportObj;
