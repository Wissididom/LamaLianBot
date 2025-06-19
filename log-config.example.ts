import { Events } from "discord.js";

export default {
  loggingChannel: "1234567890",
  ignoredChannels: [],
  ignoredRoles: ["1234567890"],
  events: [
    {
      name: Events.MessageDelete, // Message Delete
      channel: null,
      ignoredChannels: [],
      ignoredRoles: [],
    },
    {
      name: Events.MessageUpdate, // Message Edit
      channel: null,
      ignoredChannels: [],
      ignoredRoles: [],
    },
    {
      name: Events.GuildMemberAdd, // Join
      channel: null,
      ignoredChannels: [],
      ignoredRoles: [],
    },
    {
      name: Events.GuildMemberRemove, // Leave, Kick
      channel: null,
      ignoredChannels: [],
      ignoredRoles: [],
    },
    {
      name: Events.GuildMemberUpdate, // Roles, Timeout, Nickname etc.
      channel: null,
      ignoredChannels: [],
      ignoredRoles: [],
    },
    {
      name: Events.GuildBanAdd, // Ban
      channel: null,
      ignoredChannels: [],
      ignoredRoles: [],
    },
    {
      name: Events.GuildBanRemove, // Unban
      channel: null,
      ignoredChannels: [],
      ignoredRoles: [],
    },
    {
      name: Events.GuildRoleCreate, // Role Create
      channel: null,
      ignoredChannels: [],
      ignoredRoles: [],
    },
    {
      name: Events.GuildRoleDelete, // Role Delete
      channel: null,
      ignoredChannels: [],
      ignoredRoles: [],
    },
    {
      name: Events.GuildRoleUpdate, // Role Update
      channel: null,
      ignoredChannels: [],
      ignoredRoles: [],
    },
    {
      name: Events.ChannelCreate, // Channel Create
      channel: null,
      ignoredChannels: [],
      ignoredRoles: [],
    },
    {
      name: Events.ChannelUpdate, // Channel Update
      channel: null,
      ignoredChannels: [],
      ignoredRoles: [],
    },
    {
      name: Events.ChannelDelete, // Channel Delete
      channel: null,
      ignoredChannels: [],
      ignoredRoles: [],
    },
    {
      name: Events.GuildEmojiCreate, // Emoji Create
      channel: null,
      ignoredChannels: [],
      ignoredRoles: [],
    },
    {
      name: Events.UserUpdate, // User Update
      channel: null,
      ignoredChannels: [],
      ignoredRoles: [],
    },
    {
      name: Events.VoiceStateUpdate, // Voice Channel Join, Voice Channel Leave, Voice Channel Move
      channel: null,
      ignoredChannels: [],
      ignoredRoles: [],
    },
  ],
};
