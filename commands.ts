import { readdirSync } from "fs";
import { parse as parsePath } from "path";
import Database from "./database/sqlite.ts";

import Ban from "./commands/ban.ts";
import Birthday from "./commands/birthday.ts";
import Clear from "./commands/clear.ts";
import ForgetBirthday from "./commands/forget-birthday.ts";
import Kick from "./commands/kick.ts";
import Levels from "./commands/levels.ts";
import Mute from "./commands/mute.ts";
import NextBirthdays from "./commands/next-birthdays.ts";
import Ping from "./commands/ping.ts";
import Rank from "./commands/rank.ts";
import RememberBirthday from "./commands/remember-birthday.ts";
import Remind from "./commands/remind.ts";
import RoleInfo from "./commands/roleinfo.ts";
import ServerInfo from "./commands/serverinfo.ts";
import SetAvatar from "./commands/set-avatar.ts";
import SetBanner from "./commands/set-banner.ts";
import SetUserBirthday from "./commands/set-user-birthday.ts";
import SetUsername from "./commands/set-username.ts";
import Setup from "./commands/setup.ts";
import Unban from "./commands/unban.ts";
import Unmute from "./commands/unmute.ts";
import UnsetUserBirthday from "./commands/unset-user-birthday.ts";
import UserInfo from "./commands/userinfo.ts";
import Warn from "./commands/warn.ts";
import { GuildMember, Interaction } from "discord.js";

const db = new Database();

export function getDatabase() {
  return db;
}

function getAvailableDefaultCommandNames() {
  const commands = [];
  const commandFiles = readdirSync("./commands/");
  for (const commandFile of commandFiles) {
    const name = parsePath(commandFile).name;
    commands.push(name);
  }
  return commands;
}

function getCommandObject(commandName: string) {
  switch (commandName) {
    case "ban":
      return Ban;
    case "clear":
      return Clear;
    case "kick":
      return Kick;
    case "mute":
      return Mute;
    case "unban":
      return Unban;
    case "unmute":
      return Unmute;
    case "warn":
      return Warn;
    case "userinfo":
      return UserInfo;
    case "roleinfo":
      return RoleInfo;
    case "serverinfo":
      return ServerInfo;
    case "set-avatar":
      return SetAvatar;
    case "set-banner":
      return SetBanner;
    case "set-username":
      return SetUsername;
    case "remember-birthday":
      return RememberBirthday;
    case "forget-birthday":
      return ForgetBirthday;
    case "birthday":
      return Birthday;
    case "next-birthdays":
      return NextBirthdays;
    case "set-user-birthday":
      return SetUserBirthday;
    case "unset-user-birthday":
      return UnsetUserBirthday;
    case "remind":
      return Remind;
    case "rank":
      return Rank;
    case "levels":
      return Levels;
    case "setup":
      return Setup;
    case "ping":
      return Ping;
    default:
      throw "Invalid command!";
  }
}

export async function handleApplicationCommands(interaction: Interaction) {
  if (interaction.isCommand()) {
    const { name, permissions, runInteraction } = getCommandObject(
      interaction.commandName,
    );
    if (permissions.length < 1) {
      return await runInteraction(interaction, db);
    }
    for (const permission of permissions) {
      if (!interaction.channel) break;
      if (!(interaction.member instanceof GuildMember)) break;
      if (
        !interaction.channel.isDMBased() &&
        interaction.channel.permissionsFor(interaction.member).has(permission)
      ) {
        return await runInteraction(interaction, db);
      }
    }
    return await interaction.reply({
      content:
        `You don't have permission for the command ${name} in this channel or server-wide!`,
    });
  }
  /*if (interaction.isAutocomplete()) {
    const { runAutocomplete } = getCommandObject(interaction.commandName);
    return runAutocomplete(interaction, db);
  }*/
}

export function getRegisterArray() {
  const defaultCommandNames = getAvailableDefaultCommandNames();
  const registerArray = [];
  for (let i = 0; i < defaultCommandNames.length; i++) {
    const commandObject = getCommandObject(defaultCommandNames[i]);
    registerArray.push(commandObject.registerObject());
  }
  return registerArray;
}
