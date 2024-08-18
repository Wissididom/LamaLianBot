import { Events } from "discord.js";

export default {
  loggingChannel: "1234567890",
  ignoredChannels: null,
  ignoredRoles: ["1234567890"],
  events: [
    {
      name: Events.MessageDelete, // Message Delete
      channel: null,
      ignoredChannels: null,
      ignoredRoles: null,
    },
    {
      name: Events.MessageUpdate, // Message Edit
      channel: null,
      ignoredChannels: null,
      ignoredRoles: null,
    },
    {
      name: Events.GuildMemberAdd, // Join
      channel: null,
      ignoredChannels: null,
      ignoredRoles: null,
    },
    {
      name: Events.GuildMemberRemove, // Leave, Kick
      channel: null,
      ignoredChannels: null,
      ignoredRoles: null,
    },
    {
      name: Events.GuildMemberUpdate, // Roles, Timeout, Nickname etc.
      channel: null,
      ignoredChannels: null,
      ignoredRoles: null,
    },
    {
      name: Events.GuildBanAdd, // Ban
      channel: null,
      ignoredChannels: null,
      ignoredRoles: null,
    },
    {
      name: Events.GuildBanRemove, // Unban
      channel: null,
      ignoredChannels: null,
      ignoredRoles: null,
    },
    {
      name: Events.GuildRoleCreate, // Role Create
      channel: null,
      ignoredChannels: null,
      ignoredRoles: null,
    },
    {
      name: Events.GuildRoleDelete, // Role Delete
      channel: null,
      ignoredChannels: null,
      ignoredRoles: null,
    },
    {
      name: Events.GuildRoleUpdate, // Role Update
      channel: null,
      ignoredChannels: null,
      ignoredRoles: null,
    },
    {
      name: Events.ChannelCreate, // Channel Create
      channel: null,
      ignoredChannels: null,
      ignoredRoles: null,
    },
    {
      name: Events.ChannelUpdate, // Channel Update
      channel: null,
      ignoredChannels: null,
      ignoredRoles: null,
    },
    {
      name: Events.ChannelDelete, // Channel Delete
      channel: null,
      ignoredChannels: null,
      ignoredRoles: null,
    },
    {
      name: Events.GuildEmojiCreate, // Emoji Create
      channel: null,
      ignoredChannels: null,
      ignoredRoles: null,
    },
    {
      name: Events.UserUpdate, // User Update
      channel: null,
      ignoredChannels: null,
      ignoredRoles: null,
    },
    {
      name: Events.VoiceStateUpdate, // Voice Channel Join, Voice Channel Leave, Voice Channel Move
      channel: null,
      ignoredChannels: null,
      ignoredRoles: null,
    },
  ],
};
