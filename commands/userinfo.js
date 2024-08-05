import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { fetchMember } from "../utils.js";

let listRoles = (roleManager) => {
  let roles = roleManager.cache;
  let roleList = "";
  for (let role of [...roles.values()]) {
    if (role.name == "@everyone") continue;
    roleList += `<@&${role.id}> `;
  }
  roleList = roleList.trim();
  return roleList == "" ? "No roles" : roleList;
};

let exportObj = {
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
          .setRequired(false),
      ),
  runInteraction: async (interaction, db) => {
    await interaction.deferReply({ ephemeral: true });
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      let user = interaction.options.getUser("user") ?? interaction.user;
      user = await user.fetch(true);
      let member = await fetchMember(interaction.guild.members, user);
      try {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                iconURL: user.displayAvatarURL({ dynamic: true }),
                name: user.tag,
              })
              .addFields(
                {
                  name: "User Info",
                  value: `ID: ${user.id}\nName: ${user.tag}`,
                },
                {
                  name: "Joined Discord",
                  value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F> (<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`,
                },
                {
                  name: "Joined Server",
                  value: member
                    ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F> (<t:${Math.floor(member.joinedTimestamp / 1000)}:R>)`
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
              .setThumbnail(user.displayAvatarURL({ dynamic: true }))
              .setImage(
                user.banner
                  ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}?size=1024`
                  : null,
              ),
          ],
        });
      } catch (err) {
        if (err.name == "DiscordAPIError[50007]") {
          await interaction.editReply({
            content: `Ich kann an ${user?.tag} keine DMs schicken!`,
          });
          return;
        }
        console.error(err);
        await interaction.editReply({ content: err.toString() });
      }
    }
  },
};

export default exportObj;
