import {
  ForumChannel,
  MediaChannel,
  NewsChannel,
  StageChannel,
  TextChannel,
  VoiceChannel,
} from "discord.js";

export default async function handleWebhooksUpdate(
  _channel:
    | TextChannel
    | NewsChannel
    | VoiceChannel
    | StageChannel
    | ForumChannel
    | MediaChannel,
) {
  // TODO
}
