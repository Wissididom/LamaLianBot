import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

let listTags = (tags) => {
  let tagList = [];
  switch (tags.availableForPurchase) {
    case true:
      tagList.push("Available for Purchase");
      break;
    case false:
      tagList.push("Not available for Purchase");
      break;
  }
  if (tags.botId) {
    tagList.push(`Belongs to <@${tags.botId}>`);
  }
  if (tags.guildConnections) {
    tagList.push("A guild's linked role");
  }
  if (tags.integrationId) {
    tagList.push(`Belongs to Integration ID ${tags.integrationId}`);
  }
  if (tags.premiumSubscriberRole) {
    tagList.push("This role is a premium subscriber role for this server");
  }
  if (tags.subscriptionListingId) {
    tagList.push(
      `This subscription SKU ID for this role is ${tags.subscriptionListingId}`,
    );
  }
  return tagList.length > 0 ? tagList.join("\n") : "N/A";
};

let exportObj = {
  name: "roleinfo",
  description: "Zeigt Informationen über eine Rolle in einem Embed an",
  permissions: [],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addRoleOption((option) =>
        option
          .setName("role")
          .setDescription(
            "Die Rolle, dessen Informationen angezeigt werden soll",
          )
          .setRequired(true),
      ),
  runInteraction: async (interaction, db) => {
    await interaction.deferReply({ ephemeral: true });
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      try {
        let role = interaction.options.getRole("role");
        let permissionsArray = role.permissions.toArray();
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: role.name,
              })
              .addFields(
                { name: "ID", value: role.id },
                { name: "Name", value: role.name },
                {
                  name: "Color",
                  value: `#${role.color.toString(16).toUpperCase().padStart(6, "0")}`,
                },
                { name: "Hoisted", value: role.hoist.toString() },
                {
                  name: "Icon",
                  value: role.icon
                    ? `https://cdn.discordapp.com/role-icons/${role.id}/${role.icon}.png`
                    : "N/A",
                },
                { name: "Managed", value: role.managed.toString() },
                {
                  name: "Permissions",
                  value: permissionsArray.length > 0 ? permissionsArray.join(", ") : "Keine Berechtigungen",
                },
                { name: "Position", value: `#${role.position}` },
                {
                  name: "Tags",
                  value: role.tags ? listTags(role.tags) : `N/A`,
                },
              )
              .setThumbnail(
                role.icon
                  ? `https://cdn.discordapp.com/role-icons/${role.id}/${role.icon}.png`
                  : undefined,
              ),
          ],
        });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: err.toString() });
      }
    }
  },
};

export default exportObj;
