import {
  GuildTextBasedChannel,
  Message,
  OmitPartialGroupDMChannel,
  PartialMessage,
  ReadonlyCollection,
} from "discord.js";

export default async function handleMessageBulkDelete(
  _messages: ReadonlyCollection<
    string,
    OmitPartialGroupDMChannel<Message<boolean> | PartialMessage>
  >,
  _channel: GuildTextBasedChannel,
) {
  // TODO
}
