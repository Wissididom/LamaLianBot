import {
  EmbedBuilder,
  Interaction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import Database from "../database/sqlite.ts";

function getWeekdayFromIndex(weekdayIndex: number) {
  switch (weekdayIndex) {
    case 0:
      return "Sonntag";
    case 1:
      return "Montag";
    case 2:
      return "Dienstag";
    case 3:
      return "Mittwoch";
    case 4:
      return "Donnerstag";
    case 5:
      return "Freitag";
    case 6:
      return "Samstag";
    default:
      return null;
  }
}

function dateAdd(date: Date, amount: number, unit: string) {
  const ret = new Date(date); // Don't modify original date
  const checkRollover = () => {
    if (ret.getDate() != date.getDate()) ret.setDate(0);
  };
  switch (unit.toString().toLowerCase()) {
    case "years":
      ret.setFullYear(ret.getFullYear() + amount);
      checkRollover();
      break;
    case "quarters":
      ret.setMonth(ret.getMonth() + 3 * amount);
      checkRollover();
      break;
    case "months":
      ret.setMonth(ret.getMonth() + amount);
      checkRollover();
      break;
    case "weeks":
      ret.setDate(ret.getDate() + 7 * amount);
      break;
    case "days":
      ret.setDate(ret.getDate() + amount);
      break;
    case "hours":
      ret.setTime(ret.getTime() + amount * 3600000);
      break;
    case "minutes":
      ret.setTime(ret.getTime() + amount * 60000);
      break;
    case "seconds":
      ret.setTime(ret.getTime() + amount * 1000);
      break;
    default:
      return undefined;
  }
  return ret;
}

const exportObj = {
  name: "remind",
  description: "Reminder verwalten",
  permissions: [],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description)
      .addSubcommand((subcommand) =>
        subcommand
          .setName("at")
          .setDescription("zu einem gewissen Zeitpunkt erinnern")
          .addStringOption((option) =>
            option
              .setName("topic")
              .setDescription("Der Inhalt an den erinnert werden soll")
              .setRequired(true)
          )
          .addIntegerOption((option) =>
            option
              .setName("hours")
              .setDescription("Die Stunden der Uhrzeit der Erinnerung")
              .setRequired(true)
              .setMinValue(0)
              .setMaxValue(23)
          )
          .addIntegerOption((option) =>
            option
              .setName("minutes")
              .setDescription("Die Minuten der Uhrzeit der Erinnerung")
              .setRequired(true)
              .setMinValue(0)
              .setMaxValue(59)
          )
          .addIntegerOption((option) =>
            option
              .setName("seconds")
              .setDescription("Die Sekunden der Uhrzeit der Erinnerung")
              .setRequired(false)
              .setMinValue(0)
              .setMaxValue(59)
          )
          .addIntegerOption((option) =>
            option
              .setName("year")
              .setDescription("Das Jahr des Datums der Erinnerung")
              .setRequired(false)
              .setMinValue(2000)
              .setMaxValue(3000)
          )
          .addIntegerOption((option) =>
            option
              .setName("month")
              .setDescription("Der Monat des Datums der Erinnerung")
              .setRequired(false)
              .setMinValue(1)
              .setMaxValue(12)
          )
          .addIntegerOption((option) =>
            option
              .setName("day")
              .setDescription("Der Tag des Datums der Erinnerung")
              .setRequired(false)
              .setMinValue(1)
              .setMaxValue(31)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("in")
          .setDescription("in einer gewissen Zeit erinnern")
          .addStringOption((option) =>
            option
              .setName("topic")
              .setDescription("Der Inhalt an den erinnert werden soll")
              .setRequired(true)
          )
          .addIntegerOption((option) =>
            option
              .setName("amount")
              .setDescription(
                "In welcher Menge an Einheiten soll eine Erinnerung gesendet werden",
              )
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("unit")
              .setDescription(
                "Die Einheit für die Zeit in der erinnert werden soll",
              )
              .setRequired(false)
              .addChoices(
                { name: "Wochen", value: "weeks" },
                { name: "Tage", value: "days" },
                { name: "Stunden", value: "hours" },
                { name: "Minuten", value: "minutes" },
                { name: "Sekunden", value: "seconds" },
              )
          )
      ),
  runInteraction: async (interaction: Interaction, db: Database) => {
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const subcommand = interaction.options.getSubcommand();
      const topic = interaction.options.getString("topic") ??
        "Kein Thema angegeben";
      switch (subcommand) {
        case "in": {
          const amount = interaction.options.getInteger("amount") ?? 1;
          const unit = interaction.options.getString("unit") ?? "minutes";
          const targetTime = dateAdd(new Date(), amount, unit);
          if (!targetTime) {
            await interaction.editReply({
              embeds: [
                new EmbedBuilder().setDescription(
                  `Ungültige Einheit angegeben (${unit})!`,
                ),
              ],
              allowedMentions: { parse: [] }, // Prevent pings of other people
            });
            return;
          }
          const weekday = getWeekdayFromIndex(targetTime.getDay());
          try {
            await db.addReminder(
              interaction.user.id,
              targetTime.getDate(),
              targetTime.getMonth() + 1,
              targetTime.getFullYear(),
              targetTime.getHours(),
              targetTime.getMinutes(),
              targetTime.getSeconds(),
              topic,
            );
            await interaction.editReply({
              embeds: [
                new EmbedBuilder().setDescription(
                  `Notiert! Ich werde dich am ${weekday}, den ${
                    targetTime.getDate().toString().padStart(2, "0")
                  }.${
                    (targetTime.getMonth() + 1).toString().padStart(2, "0")
                  }.${
                    targetTime.getFullYear().toString().padStart(4, "0")
                  } um ${targetTime.getHours().toString().padStart(2, "0")}:${
                    targetTime.getMinutes().toString().padStart(2, "0")
                  } Uhr an "${topic}" erinnern (vorrausgesetzt DMs sind offen)`,
                ),
              ],
              allowedMentions: { parse: [] }, // Prevent pings of other people
            });
          } catch (err) {
            await interaction.editReply({
              embeds: [
                new EmbedBuilder().setDescription(
                  `Konnte den Reminder nicht speichern: ${
                    (err as Error).message
                  }!`,
                ),
              ],
              allowedMentions: { parse: [] }, // Prevent pings of other people
            });
          }
          break;
        }
        case "at": {
          const hours = interaction.options.getInteger("hours");
          const minutes = interaction.options.getInteger("minutes");
          const seconds = interaction.options.getInteger("seconds") ?? 0;
          let year = interaction.options.getInteger("year");
          let month = interaction.options.getInteger("month");
          let day = interaction.options.getInteger("day");
          let targetTime = null;
          if (day == null || month == null || year == null) {
            targetTime = new Date();
            targetTime.setHours(
              hours ?? targetTime.getHours(),
              minutes ?? targetTime.getMinutes(),
              seconds,
              0,
            );
            if (targetTime > new Date()) {
              day = targetTime.getDate();
              month = targetTime.getMonth() + 1;
              year = targetTime.getFullYear();
            } else {
              targetTime.setDate(targetTime.getDate() + 1);
              day = targetTime.getDate();
              month = targetTime.getMonth() + 1;
              year = targetTime.getFullYear();
            }
          } else {
            targetTime = new Date(
              year,
              month - 1,
              day,
              hours ?? new Date().getHours(),
              minutes ?? new Date().getMinutes(),
              seconds,
            );
          }
          const weekday = getWeekdayFromIndex(targetTime.getDay());
          try {
            await db.addReminder(
              interaction.user.id,
              day,
              month,
              year,
              targetTime.getHours(),
              targetTime.getMinutes(),
              seconds,
              topic,
            );
            console.log(
              interaction.user.id,
              day,
              month,
              year,
              targetTime.getHours(),
              targetTime.getMinutes(),
              seconds,
              topic,
            );
            await interaction.editReply({
              embeds: [
                new EmbedBuilder().setDescription(
                  `Notiert! Ich werde dich am ${weekday}, den ${
                    day.toString().padStart(2, "0")
                  }.${month.toString().padStart(2, "0")}.${
                    year.toString().padStart(4, "0")
                  } um ${targetTime.getHours().toString().padStart(2, "0")}:${
                    targetTime.getMinutes().toString().padStart(2, "0")
                  } Uhr an "${topic}" erinnern (vorrausgesetzt DMs sind offen)`,
                ),
              ],
              allowedMentions: { parse: [] }, // Prevent pings of other people
            });
          } catch (err) {
            await interaction.editReply({
              embeds: [
                new EmbedBuilder().setDescription(
                  `Konnte den Reminder nicht speichern: ${
                    (err as Error).message
                  }!`,
                ),
              ],
              allowedMentions: { parse: [] }, // Prevent pings of other people
            });
          }
          break;
        }
      }
    }
  },
};

export default exportObj;
