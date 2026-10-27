async function getTwitchToken(clientId: string, clientSecret: string) {
  const params = new URLSearchParams(
    {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    },
  );
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: params,
  });
  if (!res.ok) {
    throw `failed to get token: ${res.status} ${await res.text()}`;
  }
  return await res.json() as {
    access_token: string;
    expires_in: number;
    token_type: string;
  };
}

async function getAuthorizationByUsers(
  accessToken: string,
  clientId: string,
  userIds: string[],
) {
  const params = new URLSearchParams();
  for (const userId of userIds) {
    params.append("user_id", userId);
  }
  const res = await fetch(
    `https://api.twitch.tv/helix/authorization/users?${params}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Client-ID": clientId,
      },
    },
  );
  if (!res.ok) {
    throw `failed to get authorizations: ${res.status} ${await res.text()}`;
  }
  return (await res.json()) as {
    data: {
      user_id: string;
      user_name: string;
      user_login: string;
      scopes: string[];
      has_authorized: boolean;
    }[];
  };
}

const clientId = Deno.env.get("TWITCH_CLIENT_ID")!;
const clientSecret = Deno.env.get("TWITCH_CLIENT_SECRET")!;
const config: {
  channelIds: string[];
  senderId: string;
  textMessage: string;
  useAnnouncements: boolean;
}[] = JSON.parse(await Deno.readTextFile("bonbon-reminder.json"));
const token = await getTwitchToken(clientId, clientSecret);
let userIds = [];
for (const configEntry of config) {
  for (const channelId of configEntry.channelIds) {
    userIds.push(channelId);
  }
  userIds.push(configEntry.senderId);
}
userIds = [...new Set(userIds)];
const batchSize = 10;
for (let i = 0; i < userIds.length; i += batchSize) {
  const batch = userIds.slice(i, i + batchSize);
  const authorizations = await getAuthorizationByUsers(
    token.access_token,
    clientId,
    batch,
  );
  console.log(JSON.stringify(authorizations.data));
}
