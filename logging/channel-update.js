import {
  AuditLogEvent,
  EmbedBuilder,
  Events,
  PermissionsBitField,
  Role,
} from "discord.js";
import { getChannelByEventName, getChannelTypeAsString } from "../logging.js";

export default async function handleChannelUpdate(oldChannel, newChannel) {
  const logChannel = await getChannelByEventName(
    newChannel.client,
    Events.ChannelUpdate,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  const description = `**Kanal <#${newChannel.id}> (${newChannel.name}) bearbeitet**`;
  const embed = new EmbedBuilder()
    .setTitle("Kanal bearbeitet")
    .setDescription(description)
    .setFooter({ text: `Kanal-ID: ${newChannel.id}` })
    .setTimestamp();
  if (oldChannel.topic != newChannel.topic) {
    if (oldChannel.topic.trim() == "") {
      if (newChannel.topic.trim() != "") {
        embed.setDescription(
          description +
            `\n\nVorher:\nN/A\n\nNachher:\n\`\`\`${newChannel.topic}\`\`\``,
        );
      }
    } else {
      if (newChannel.topic.trim() == "") {
        embed.setDescription(
          description +
            `\n\nVorher:\n\`\`\`${oldChannel.topic}\`\`\`\nNachher:\nN/A`,
        );
      }
    }
  }
  if (oldChannel.name != newChannel.name) {
    embed.addFields({
      name: "Name",
      value: `\`${oldChannel.name}\` -> \`${newChannel.name}\``,
      inline: false,
    });
  }
  if (oldChannel.parent?.id != newChannel.parent?.id) {
    embed.addFields({
      name: "Name",
      value: `\`${oldChannel.parent?.name}\` (${oldChannel.parent?.id}) -> \`${oldChannel.parent?.name}\` (${oldChannel.parent?.id})`,
      inline: false,
    });
  }
  if (oldChannel.position != newChannel.position) {
    embed.addFields({
      name: "Position",
      value: `#${oldChannel.position} -> #${newChannel.position}`,
      inline: false,
    });
  }
  if (oldChannel.type != newChannel.type) {
    embed.addFields({
      name: "Typ",
      value: `${getChannelTypeAsString(oldChannel.type)} -> ${getChannelTypeAsString(newChannel.type)}`,
      inline: false,
    });
  }
  if (
    oldChannel.permissionOverwrites.cache !=
    newChannel.permissionOverwrites.cache
  ) {
    let auditLogEntry;
    let printType;
    if (
      oldChannel.permissionOverwrites.cache.size <
      newChannel.permissionOverwrites.cache.size
    ) {
      // Added channel overwrite
      auditLogEntry = await fetchChannelOverwriteCreate(newChannel);
      printType = "erstellt";
    } else if (
      oldChannel.permissionOverwrites.cache.size >
      newChannel.permissionOverwrites.cache.size
    ) {
      // Removed channel overwrite
      auditLogEntry = await fetchChannelOverwriteDelete(newChannel);
      printType = "gelöscht";
    } else {
      // Updated channel overwrite
      auditLogEntry = await fetchChannelOverwriteUpdate(newChannel);
      printType = "bearbeitet";
    }
    if (auditLogEntry.user || auditLogEntry.role) {
      let overwriteList = `<@${auditLogEntry.role ? `&${auditLogEntry.role.id}` : auditLogEntry.user.id}> (${auditLogEntry.role ? auditLogEntry.role.name : auditLogEntry.user.username})\n`;
      if (printType == "bearbeitet") {
        const allPermissions = new Set(Object.keys(PermissionsBitField.Flags));
        const receivedChanges = convertChangesToAssociativeArray(
          auditLogEntry.changes,
        );
        const allow = receivedChanges?.allow ?? null;
        const deny = receivedChanges?.deny ?? null;
        const changes = [];
        if (allow) {
          if (deny) {
            // both, allow and deny exist
            const permissionFields = {
              oldAllowed: getPermissionNames(
                new PermissionsBitField(BigInt(allow.old)),
              ),
              newAllowed: getPermissionNames(
                new PermissionsBitField(BigInt(allow.new)),
              ),
              oldDenied: getPermissionNames(
                new PermissionsBitField(BigInt(deny.old)),
              ),
              newDenied: getPermissionNames(
                new PermissionsBitField(BigInt(deny.new)),
              ),
            };
            for (const perm of allPermissions) {
              const srcState = permissionFields.oldAllowed.has(perm)
                ? true
                : permissionFields.oldDenied.has(perm)
                  ? false
                  : null;
              const dstState = permissionFields.newAllowed.has(perm)
                ? true
                : permissionFields.newDenied.has(perm)
                  ? false
                  : null;
              if (srcState === dstState) continue;
              changes.push({
                name: perm,
                src: srcState,
                dst: dstState,
              });
            }
          } else {
            // only allow exists
            const permissionFields = {
              oldAllowed: getPermissionNames(
                new PermissionsBitField(BigInt(allow.old)),
              ),
              newAllowed: getPermissionNames(
                new PermissionsBitField(BigInt(allow.new)),
              ),
            };
            for (const perm of allPermissions) {
              const srcState = permissionFields.oldAllowed.has(perm)
                ? true
                : null;
              const dstState = permissionFields.newAllowed.has(perm)
                ? true
                : null;
              if (srcState === dstState) continue;
              changes.push({
                name: perm,
                src: srcState,
                dst: dstState,
              });
            }
          }
        } else {
          if (deny) {
            // only deny exists
            const permissionFields = {
              oldDenied: getPermissionNames(
                new PermissionsBitField(BigInt(deny.old)),
              ),
              newDenied: getPermissionNames(
                new PermissionsBitField(BigInt(deny.new)),
              ),
            };
            for (const perm of allPermissions) {
              const srcState = permissionFields.oldDenied.has(perm)
                ? false
                : null;
              const dstState = permissionFields.newDenied.has(perm)
                ? false
                : null;
              if (srcState === dstState) continue;
              changes.push({
                name: perm,
                src: srcState,
                dst: dstState,
              });
            }
          } else {
            // nothing of interest exists
          }
        }
        for (const change of changes) {
          overwriteList += `**${change.name}**: \`${convertBoolToStrEmoji(change.src)} -> ${convertBoolToStrEmoji(change.dst)}\`\n`;
        }
      }
      embed.addFields({
        name: `Permission overwrites ${printType}`,
        value:
          overwriteList.length > 1024
            ? overwriteList.substring(0, 1024)
            : overwriteList,
        inline: false,
      });
    }
  }
  const updater = await fetchUpdater(newChannel);
  if (updater) {
    embed.addFields({
      name: "Moderator",
      value: `<@${updater.id}> (\`${updater.displayName}\` - \`${updater.username}\` - \`${updater.id}\`)`,
      inline: false,
    });
  }
  await logChannel.send({
    embeds: [embed],
  });
}

async function fetchUpdater(channel) {
  const fetchedLogs = await channel.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.ChannelUpdate,
  });
  const channelUpdateLog = fetchedLogs.entries.first();
  if (!channelUpdateLog) {
    return null;
  }
  const { executor, target } = channelUpdateLog;
  if (target.id == channel.id) {
    return executor;
  } else {
    return null;
  }
}

function convertChangesToAssociativeArray(changes) {
  if (!changes) return null;
  const result = {};
  for (const change of changes) {
    result[change.key] = {
      old: change.old,
      new: change.new,
    };
  }
  return result;
}

async function fetchChannelOverwriteCreate(channel) {
  return await fetchChannelOverwrite(
    channel,
    AuditLogEvent.ChannelOverwriteCreate,
  );
}

async function fetchChannelOverwriteDelete(channel) {
  return await fetchChannelOverwrite(
    channel,
    AuditLogEvent.ChannelOverwriteDelete,
  );
}

async function fetchChannelOverwriteUpdate(channel) {
  return await fetchChannelOverwrite(
    channel,
    AuditLogEvent.ChannelOverwriteUpdate,
  );
}

async function fetchChannelOverwrite(channel, type) {
  const fetchedLogs = await channel.guild.fetchAuditLogs({
    limit: 1,
    type,
  });
  const channelOverwriteLog = fetchedLogs.entries.first();
  if (!channelOverwriteLog) {
    return null;
  }
  const { executor, target, extra, changes, reason } = channelOverwriteLog;
  if (target.id == channel.id) {
    if (extra instanceof Role) {
      return {
        type,
        updater: executor,
        role: extra,
        user: null,
        changes,
        reason,
      };
    } else {
      return {
        type,
        updater: executor,
        role: null,
        user: extra,
        changes,
        reason,
      };
    }
  } else {
    return null;
  }
}

function getPermissionNames(permissions) {
  const result = [];
  for (const perm of Object.keys(PermissionsBitField.Flags)) {
    if (permissions.has(PermissionsBitField.Flags[perm])) {
      result.push(perm);
    }
  }
  return new Set(result);
}

function convertBoolToStrEmoji(perm) {
  switch (perm) {
    case true:
      return "✅";
    case false:
      return "❌";
    case null:
      return "/";
    default:
      return "N/A";
  }
}
