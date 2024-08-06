import { readdirSync } from "fs";
import { parse as parsePath } from "path";
import Database from "./database/sqlite.js";

import Ban from "./commands/ban.js";
import Clear from "./commands/clear.js";
import Kick from "./commands/kick.js";
import Mute from "./commands/mute.js";
import Unban from "./commands/unban.js";
import Unmute from "./commands/unmute.js";
import Warn from "./commands/warn.js";
import UserInfo from "./commands/userinfo.js";
import RoleInfo from "./commands/roleinfo.js";
import SetAvatar from "./commands/set-avatar.js";
import SetBanner from "./commands/set-banner.js";
import SetUsername from "./commands/set-username.js";
import RememberBirthday from "./commands/remember-birthday.js";
import ForgetBirthday from "./commands/forget-birthday.js";
import Birthday from "./commands/birthday.js";
import NextBirthdays from "./commands/next-birthdays.js";
import SetUserBirthday from "./commands/set-user-birthday.js";
import UnsetUserBirthday from "./commands/unset-user-birthday.js";

export function getDatabase() {
  return Database;
}

function getAvailableDefaultCommandNames() {
  let commands = [];
  let commandFiles = readdirSync("./commands/");
  for (let commandFile of commandFiles) {
    let name = parsePath(commandFile).name;
    commands.push(name);
  }
  return commands;
}

async function getCommandObject(commandName) {
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
    case "logging":
      // TODO
      return null;
    default:
      // TODO
      return null;
  }
}

export async function handleApplicationCommands(interaction) {
  if (interaction.isCommand()) {
    const { name, permissions, runInteraction } = await getCommandObject(
      interaction.commandName,
    );
    if (permissions.length < 1) {
      return await runInteraction(interaction, Database);
    }
    for (let permission of permissions) {
      if (
        interaction.channel?.permissionsFor(interaction.member).has(permission)
      ) {
        return await runInteraction(interaction, Database);
      }
    }
    return await interaction.reply({
      content: `You don't have permission for the command ${name} in this channel or server-wide!`,
    });
  }
  if (interaction.isAutocomplete()) {
    const { runAutocomplete } = await getCommandObject(interaction.commandName);
    return runAutocomplete(interaction, Database);
  }
}

export async function getRegisterArray() {
  let defaultCommandNames = getAvailableDefaultCommandNames();
  let registerArray = [];
  for (let i = 0; i < defaultCommandNames.length; i++) {
    let commandObject = await getCommandObject(defaultCommandNames[i]);
    registerArray.push(commandObject.registerObject());
  }
  return registerArray;
}
