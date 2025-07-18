import {
  EmbedBuilder,
  GuildMemberRoleManager,
  Interaction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { fetchMember } from "../utils.ts";
import Database from "../database/sqlite.ts";

const listRoles = (roleManager: GuildMemberRoleManager) => {
  const roles = roleManager.cache;
  let roleList = "";
  for (const role of [...roles.values()]) {
    if (role.name == "@everyone") continue;
    roleList += `<@&${role.id}> `;
  }
  roleList = roleList.trim();
  return roleList == "" ? "No roles" : roleList;
};

const exportObj = {
  name: "userinfo",
  description: "Zeigt Informationen über einen User in einem Embed an",
  permissions: [],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription(
            "Der User, dessen Informationen angezeigt werden sollen",
          )
          .setRequired(false)
      ),
  runInteraction: async (interaction: Interaction, _db: Database) => {
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      let user = interaction.options.getUser("user") ?? interaction.user;
      user = await user.fetch(true);
      const member = await fetchMember(interaction.guild.members, user);
      try {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                iconURL: user.displayAvatarURL(),
                name: user.tag,
              })
              .addFields(
                {
                  name: "User Info",
                  value: `ID: ${user.id}\nName: ${user.tag}\nBot: ${user.bot}`,
                },
                {
                  name: "Joined Discord",
                  value: `<t:${
                    Math.floor(user.createdTimestamp / 1000)
                  }:F> (<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`,
                },
                {
                  name: "Joined Server",
                  value: member?.joinedTimestamp
                    ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F> (<t:${
                      Math.floor(member.joinedTimestamp / 1000)
                    }:R>)`
                    : `N/A`,
                },
                {
                  name: "Roles",
                  value: member ? listRoles(member.roles) : `N/A`,
                },
                {
                  name: "Is timed out",
                  value: member
                    ? (
                      !!member.communicationDisabledUntilTimestamp &&
                      member.communicationDisabledUntilTimestamp >= Date.now()
                    ).toString()
                    : `N/A`,
                },
              )
              .setThumbnail(user.displayAvatarURL())
              .setImage(
                user.banner
                  ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}?size=1024`
                  : null,
              ),
          ],
        });
      } catch (err) {
        if ((err as Error).name == "DiscordAPIError[50007]") {
          await interaction.editReply({
            content: `Ich kann an ${user?.tag} keine DMs schicken!`,
          });
          return;
        }
        console.error(err);
        await interaction.editReply({ content: (err as Error).toString() });
      }
    }
  },
};

export default exportObj;
