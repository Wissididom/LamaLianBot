import { EmbedBuilder, Interaction, SlashCommandBuilder } from "discord.js";
import { DateTime, Interval } from "luxon";
import Database from "../database/sqlite.ts";

const exportObj = {
  name: "next-birthdays",
  description: "Die nächsten Geburtstage auf dem Server abrufen",
  permissions: [],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description),
  runInteraction: async (interaction: Interaction, db: Database) => {
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      await interaction.deferReply();
      const birthdays = await db.getBirthdays();
      if (birthdays) {
        if (birthdays.length < 1) {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder().setDescription(
                `Ich kenne **noch** keine Geburtstage! Es müssen erst welche mit /remember-birthday oder /set-user-birthday hinzugefügt werden!`,
              ),
            ],
            allowedMentions: { parse: [] }, // Prevent pings of other people
          });
          return;
        }
        const birthdayDates: {
          [key: string]: {
            id: number;
            userId: string;
            year: number | null;
            month: number;
            day: number;
          }[];
        } = {};
        for (const birthday of birthdays) {
          let nextYear = new Date().getFullYear();
          const birthdayDateThisYear = new Date(
            nextYear,
            birthday.month - 1,
            birthday.day,
          );
          if (birthdayDateThisYear < new Date()) {
            nextYear += 1;
          }
          const nextBirthday = new Date(
            nextYear,
            birthday.month - 1,
            birthday.day,
          );
          if (
            birthdayDates[
              `${nextBirthday.getFullYear()}-${
                birthday.month.toString().padStart(2, "0")
              }-${birthday.day.toString().padStart(2, "0")}`
            ]
          ) {
            birthdayDates[
              `${nextBirthday.getFullYear()}-${
                birthday.month.toString().padStart(2, "0")
              }-${birthday.day.toString().padStart(2, "0")}`
            ].push(birthday);
          } else {
            birthdayDates[
              `${nextBirthday.getFullYear()}-${
                birthday.month.toString().padStart(2, "0")
              }-${birthday.day.toString().padStart(2, "0")}`
            ] = [birthday];
          }
        }
        const birthdayKeys = Object.keys(birthdayDates);
        birthdayKeys.sort((a, b) => {
          //return new Date(a) - new Date(b);
          return a.localeCompare(b);
        });
        await interaction.editReply({
          embeds: [
            new EmbedBuilder().setTitle("Bevorstehende Geburtstage").addFields(
              birthdayKeys.slice(0, 10).map((birthdayKey) => {
                const currentDate = DateTime.now().setZone(
                  Deno.env.get("BIRTHDAY_TIMEZONE"),
                );
                let value = "";
                let overallBirthday = null;
                for (const birthday of birthdayDates[birthdayKey]) {
                  value += `<@${birthday.userId}>`;
                  const birthDateTime = DateTime.fromObject(
                    {
                      day: birthday.day,
                      month: birthday.month,
                      year: birthday.year ?? currentDate.year,
                      hour: 0,
                      minute: 0,
                      second: 0,
                    },
                    {
                      zone: Deno.env.get("BIRTHDAY_TIMEZONE"),
                    },
                  );
                  let birthdayThisYear = birthDateTime.set({
                    year: currentDate.year,
                  });
                  if (birthdayThisYear < currentDate) {
                    birthdayThisYear = birthdayThisYear.plus({ years: 1 });
                  }
                  if (birthday.year) {
                    const age = Math.floor(
                      Interval.fromDateTimes(birthDateTime, currentDate).length(
                        "years",
                      ) + 1,
                    );
                    value += ` (${age})\n`;
                  }
                  birthday.year = birthdayThisYear.year;
                  overallBirthday = birthday;
                }
                return {
                  name: `${
                    String(overallBirthday?.day ?? 0).padStart(2, "0")
                  }.${String(overallBirthday?.month ?? 0).padStart(2, "0")}.${
                    overallBirthday?.year ?? 1900
                  }`,
                  value,
                  inline: false,
                };
              }),
            ),
          ],
          allowedMentions: { parse: [] }, // Prevent pings of other people
        });
      } else {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder().setDescription(
              `Es konnten keine Geburtstage geladen werden!`,
            ),
          ],
          allowedMentions: { parse: [] }, // Prevent pings of other people
        });
      }
    }
  },
};

export default exportObj;
