import { EmbedBuilder, SlashCommandBuilder, User } from "discord.js";
import { DateTime, Interval } from "luxon";

let exportObj = {
  name: "next-birthdays",
  description: "Die nächsten Geburtstage auf dem Server abrufen",
  permissions: [],
  registerObject: () =>
    new SlashCommandBuilder()
      .setName(exportObj.name)
      .setDescription(exportObj.description),
  runInteraction: async (interaction, db) => {
    await interaction.deferReply();
    if (interaction.guild?.available && interaction.isChatInputCommand()) {
      let birthdays = await db.getBirthdays();
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
        let birthdayDates = [];
        for (let birthday of birthdays) {
          let nextYear = new Date().getFullYear();
          let birthdayDateThisYear = new Date(
            nextYear,
            birthday.month - 1,
            birthday.day,
          );
          if (birthdayDateThisYear < new Date()) {
            nextYear += 1;
          }
          let nextBirthday = new Date(
            nextYear,
            birthday.month - 1,
            birthday.day,
          );
          if (
            birthdayDates[
              `${nextBirthday.getFullYear()}-${birthday.month.toString().padStart(2, "0")}-${birthday.day.toString().padStart(2, "0")}`
            ]
          ) {
            birthdayDates[
              `${nextBirthday.getFullYear()}-${birthday.month.toString().padStart(2, "0")}-${birthday.day.toString().padStart(2, "0")}`
            ].push(birthday);
          } else {
            birthdayDates[
              `${nextBirthday.getFullYear()}-${birthday.month.toString().padStart(2, "0")}-${birthday.day.toString().padStart(2, "0")}`
            ] = [birthday];
          }
        }
        let birthdayKeys = Object.keys(birthdayDates);
        birthdayKeys.sort((a, b) => {
          let dateA = new Date(a);
          let dateB = new Date(b);
          return dateA - dateB;
        });
        await interaction.editReply({
          embeds: [
            new EmbedBuilder().setTitle("Bevorstehende Geburtstage").addFields(
              birthdayKeys.slice(0, 10).map((birthdayKey) => {
                let currentDate = DateTime.now().setZone(
                  process.env.BIRTHDAY_TIMEZONE,
                );
                let value = "";
                let overallBirthday = null;
                for (let birthday of birthdayDates[birthdayKey]) {
                  value += `<@${birthday.userId}>`;
                  let birthDateTime = DateTime.fromObject(
                    {
                      day: birthday.day,
                      month: birthday.month,
                      year: birthday.year ?? currentDate.year,
                      hour: 0,
                      minute: 0,
                      second: 0,
                    },
                    {
                      zone: process.env.BIRTHDAY_TIMEZONE,
                    },
                  );
                  let birthdayThisYear = birthDateTime.set({
                    year: currentDate.year,
                  });
                  if (birthdayThisYear < currentDate) {
                    birthdayThisYear = birthdayThisYear.plus({ years: 1 });
                  }
                  if (birthday.year) {
                    let age = Math.floor(
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
                  name: `${String(overallBirthday.day).padStart(2, "0")}.${String(overallBirthday.month).padStart(2, "0")}.${overallBirthday.year}`,
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
              `Ich konnte keine Geburtstage laden!`,
            ),
          ],
          allowedMentions: { parse: [] }, // Prevent pings of other people
        });
      }
    }
  },
};

export default exportObj;
