import {
  APIRoleTags,
  EmbedBuilder,
  Interaction,
  MessageFlags,
  RoleTagData,
  SlashCommandBuilder,
} from "discord.js";
import Database from "../database/sqlite.ts";

const listTags = (tags: RoleTagData | APIRoleTags) => {
  const tagList = [];
  if ("availableForPurchase" in tags || "available_for_purchase" in tags) {
    tagList.push("Available for Purchase");
  } else {
    tagList.push("Not available for Purchase");
  }
  if ("botId" in tags) {
    tagList.push(`Belongs to <@${tags.botId}>`);
  }
  if ("bot_id" in tags) {
    tagList.push(`Belongs to <@${tags.bot_id}>`);
  }
  if ("guildConnections" in tags || "guild_connections" in tags) {
    tagList.push("A guild's linked role");
  }
  if ("integrationId" in tags) {
    tagList.push(`Belongs to Integration ID ${tags.integrationId}`);
  }
  if ("integration_id" in tags) {
    tagList.push(`Belongs to Integration ID ${tags.integration_id}`);
  }
  if ("premiumSubscriberRole" in tags || "premium_subscriber" in tags) {
    tagList.push("This role is a premium subscriber role for this server");
  }
  if ("subscriptionListingId" in tags) {
    tagList.push(
      `This subscription SKU ID for this role is ${tags.subscriptionListingId}`,
    );
  }
  if ("subscription_listing_id" in tags) {
    tagList.push(
      `This subscription SKU ID for this role is ${tags.subscription_listing_id}`,
    );
  }
  return tagList.length > 0 ? tagList.join("\n") : "N/A";
};

const exportObj = {
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
          .setRequired(true)
      ),
  runInteraction: async (interaction: Interaction, _db: Database) => {
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      try {
        const role = interaction.options.getRole("role");
        if (!role) {
          await interaction.editReply({
            content:
              "Rolle nicht mitbekommen, also weiß ich nicht, über welche Rolle du Informationen erhalten willst!",
          });
          return;
        }
        const permissionsArray = typeof role.permissions === "string"
          ? [role.permissions]
          : role.permissions.toArray();
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
                  value: `#${
                    role.color.toString(16).toUpperCase().padStart(6, "0")
                  }`,
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
                  value: permissionsArray.length > 0
                    ? permissionsArray.join(", ")
                    : "Keine Berechtigungen",
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
                  : null,
              ),
          ],
        });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: (err as Error).toString() });
      }
    }
  },
};

export default exportObj;
