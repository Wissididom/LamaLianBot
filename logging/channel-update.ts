import {
  AuditLogChange,
  AuditLogEvent,
  BaseGuildTextChannel,
  Collection,
  DMChannel,
  EmbedBuilder,
  Events,
  GuildChannel,
  GuildMember,
  PermissionOverwrites,
  PermissionsBitField,
  Role,
  User,
} from "discord.js";
import { getChannelByEventName, getChannelTypeAsString } from "../logging.ts";

export default async function handleChannelUpdate(
  oldChannel: DMChannel | GuildChannel,
  newChannel: DMChannel | GuildChannel,
) {
  const logChannel = await getChannelByEventName(
    newChannel.client,
    Events.ChannelUpdate,
  );
  if (!logChannel) return; // Don't handle event, if logChannel is not set
  if (oldChannel instanceof DMChannel || newChannel instanceof DMChannel) {
    return;
  }
  const description =
    `**Kanal <#${newChannel.id}> (${newChannel.name}) bearbeitet**`;
  const embed = new EmbedBuilder()
    .setTitle("Kanal bearbeitet")
    .setDescription(description)
    .setFooter({ text: `Kanal-ID: ${newChannel.id}` })
    .setTimestamp();
  if (
    oldChannel instanceof BaseGuildTextChannel &&
    newChannel instanceof BaseGuildTextChannel &&
    oldChannel.topic != newChannel.topic
  ) {
    if (!oldChannel.topic || oldChannel.topic.trim() == "") {
      if (newChannel.topic && newChannel.topic.trim() != "") {
        embed.setDescription(
          description +
            `\n\nVorher:\nN/A\n\nNachher:\n\`\`\`${newChannel.topic}\`\`\``,
        );
      }
    } else {
      if (!newChannel.topic || newChannel.topic.trim() == "") {
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
      value:
        `\`${oldChannel.parent?.name}\` (${oldChannel.parent?.id}) -> \`${oldChannel.parent?.name}\` (${oldChannel.parent?.id})`,
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
      value: `${getChannelTypeAsString(oldChannel.type)} -> ${
        getChannelTypeAsString(newChannel.type)
      }`,
      inline: false,
    });
  }
  if (
    checkIfCacheChanged(
      oldChannel.permissionOverwrites.cache,
      newChannel.permissionOverwrites.cache,
    )
  ) {
    let auditLogEntry;
    let printType: string;
    if (
      oldChannel.permissionOverwrites.cache.size <
        newChannel.permissionOverwrites.cache.size
    ) {
      // Added channel overwrite
      auditLogEntry = await fetchChannelOverwrite(
        newChannel,
        AuditLogEvent.ChannelOverwriteCreate,
      );
      printType = "erstellt";
    } else if (
      oldChannel.permissionOverwrites.cache.size >
        newChannel.permissionOverwrites.cache.size
    ) {
      // Removed channel overwrite
      auditLogEntry = await fetchChannelOverwrite(
        newChannel,
        AuditLogEvent.ChannelOverwriteDelete,
      );
      printType = "gelöscht";
    } else {
      // Updated channel overwrite
      auditLogEntry = await fetchChannelOverwrite(
        newChannel,
        AuditLogEvent.ChannelOverwriteUpdate,
      );
      printType = "bearbeitet";
    }
    if (auditLogEntry?.user || auditLogEntry?.role) {
      let overwriteList = `<@${
        auditLogEntry.role ? `&${auditLogEntry.role.id}` : auditLogEntry.user.id
      }> (${
        auditLogEntry.role
          ? auditLogEntry.role.name
          : (auditLogEntry.user instanceof GuildMember
            ? auditLogEntry.user.user.username
            : auditLogEntry.user instanceof User
            ? auditLogEntry.user.username
            : "N/A")
      })\n`;
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
          overwriteList += `**${change.name}**: \`${
            convertBoolToStrEmoji(change.src)
          } -> ${convertBoolToStrEmoji(change.dst)}\`\n`;
        }
      }
      embed.addFields({
        name: `Permission overwrites ${printType}`,
        value: overwriteList.length > 1024
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
      value:
        `<@${updater.id}> (\`${updater.displayName}\` - \`${updater.username}\` - \`${updater.id}\`)`,
      inline: false,
    });
  }
  await logChannel.send({
    embeds: [embed],
  });
}

async function fetchUpdater(channel: GuildChannel) {
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

function convertChangesToAssociativeArray(changes: AuditLogChange[]) {
  if (!changes) return null;
  // deno-lint-ignore no-explicit-any
  const result: { [key: string]: { old: any; new: any } } = {};
  for (const change of changes) {
    result[change.key] = {
      old: change.old,
      new: change.new,
    };
  }
  return result;
}

async function fetchChannelOverwrite(
  channel: GuildChannel,
  type:
    | AuditLogEvent.ChannelOverwriteCreate
    | AuditLogEvent.ChannelOverwriteDelete
    | AuditLogEvent.ChannelOverwriteUpdate,
) {
  const fetchedLogs = await channel.guild.fetchAuditLogs({
    limit: 1,
    type,
  });
  const channelOverwriteLog = fetchedLogs.entries.first();
  if (!channelOverwriteLog) {
    return null;
  }
  const { executor, target, extra, changes, reason } = channelOverwriteLog;
  if (target?.id == channel.id) {
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

function getPermissionNames(permissions: PermissionsBitField) {
  const result: string[] = [];
  const flags = PermissionsBitField.Flags;
  for (const perm of Object.keys(flags) as (keyof typeof flags)[]) {
    if (permissions.has(flags[perm])) {
      result.push(perm);
    }
  }
  return new Set(result);
}

function convertBoolToStrEmoji(perm: boolean | null) {
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

function checkIfCacheChanged(
  oldCache: Collection<string, PermissionOverwrites>,
  newCache: Collection<string, PermissionOverwrites>,
) {
  let permsChanged = false;
  if (oldCache.size !== newCache.size) {
    permsChanged = true;
  } else {
    oldCache.forEach((oldOverwrite, id) => {
      const newOverwrite = newCache.get(id);
      if (
        !newOverwrite ||
        oldOverwrite.allow.bitfield !== newOverwrite.allow.bitfield ||
        oldOverwrite.deny.bitfield !== newOverwrite.deny.bitfield
      ) {
        permsChanged = true;
      }
    });
  }
  return permsChanged;
}
