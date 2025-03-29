import { default as DatabaseImpl} from "better-sqlite3";

export default class Database {
  #db;

  constructor() {
    this.connect("./database/sqlite.db")
      .then(async () => {
        console.log("Connected to the SQLite database.");
        await this.initDb();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async initDb() {
    if (this.#db) {
      return await new Promise((resolve, reject) => {
        try { // birthdays
          const stmt = this.#db.prepare('CREATE TABLE IF NOT EXISTS birthdays (id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT UNIQUE, year INT, month INT, day INT);');
          stmt.run(); // Do not care about the changes made as long as it is successful
          console.log("Successfully made sure the birthdays table exists");
          resolve();
        } catch (err) {
          console.error(`Could not make sure the birthdays table exists: ${err}`);
          reject(err);
        }
        try { // levelling
          const stmt = this.#db.prepare('CREATE TABLE IF NOT EXISTS levelling (id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT UNIQUE, lastMessageTimestamp BIGINT, xp BIGINT, lvl BIGINT, nextLvlXp BIGINT);');
          stmt.run(); // Do not care about the changes made as long as it is successful
          console.log("Successfully made sure the levelling table exists");
          resolve();
        } catch (err) {
          console.error(`Could not make sure the levelling table exists: ${err}`);
          reject(err);
        }
        try { // reminder
          const stmt = this.#db.prepare('CREATE TABLE IF NOT EXISTS reminder (id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT, day INT, month INT, year INT, hour INT, minute INT, second INT, topic TEXT);');
          stmt.run(); // Do not care about the changes made as long as it is successful
          console.log("Successfully made sure the reminder table exists");
          resolve();
        } catch (err) {
          console.error(`Could not make sure the reminder table exists: ${err}`);
          reject(err);
        }
      });
    }
  }

  async connect(host) {
    await this.close();
    return await new Promise((resolve, reject) => {
      try {
        this.#db = new DatabaseImpl(host);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  async getBirthday(userId) {
    return await new Promise((resolve, reject) => {
      try {
        const stmt = this.#db.prepare('SELECT * FROM birthdays WHERE userId = ?;');
        const row = stmt.get(userId);
        resolve(row);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getBirthdays() {
    return await new Promise((resolve, reject) => {
      try {
        const stmt = this.#db.prepare('SELECT * FROM birthdays;');
        const rows = stmt.all();
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    });
  }

  async setBirthday(userId, year, month, day) {
    return await new Promise((resolve, reject) => {
      try {
        const stmt = this.#db.prepare('INSERT INTO birthdays (userId, year, month, day) VALUES (?, ?, ?, ?) ON CONFLICT (userId) DO UPDATE SET year = ?, month = ?, day = ? WHERE userId = ?;');
        stmt.run(userId, year, month, day, year, month, day, userId); // Do not care about the changes made as long as it is successful
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteBirthday(userId) {
    return await new Promise((resolve, reject) => {
      try {
        const stmt = this.#db.prepare('DELETE FROM birthdays WHERE userId = ?;');
        stmt.run(userId); // Do not care about the changes made as long as it is successful
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  async getLevelling(userId) {
    return await new Promise((resolve, reject) => {
      if (userId) {
        try {
          const stmt = this.#db.prepare('SELECT * FROM levelling WHERE userId = ? ORDER BY xp DESC;');
          const rows = stmt.all(userId);
          resolve(rows);
        } catch (err) {
          reject(err);
        }
      } else {
        try {
          const stmt = this.#db.prepare('SELECT * FROM levelling ORDER BY xp DESC;');
          const rows = stmt.all();
          resolve(rows);
        } catch (err) {
          reject(err);
        }
      }
    });
  }

  async deleteLevelling(userId) {
    return new Promise((resolve, reject) => {
      if (userId) {
        try {
          const stmt = this.#db.prepare('DELETE FROM levelling WHERE userId = ?;');
          stmt.run(userId); // Do not care about the changes made as long as it is successful
          resolve();
        } catch (err) {
          reject(err);
        }
      } else {
        try {
          const stmt = this.#db.prepare('DELETE FROM levelling;');
          stmt.run(); // Do not care about the changes made as long as it is successful
          resolve();
        } catch (err) {
          reject(err);
        }
      }
    });
  }

  async updateLevelling(userId, lastMessageTimestamp, xp, lvl, nextLvlXp) {
    return await new Promise((resolve, reject) => {
      try {
        const stmt = this.#db.prepare('INSERT INTO levelling (userId, lastMessageTimestamp, xp, lvl, nextLvlXp) VALUES (?, ?, ?, ?, ?) ON CONFLICT(userId) DO UPDATE SET lastMessageTimestamp = excluded.lastMessageTimestamp, xp = excluded.xp, lvl = excluded.lvl, nextLvlXp = excluded.nextLvlXp;');
        stmt.run(userId, lastMessageTimestamp, xp, lvl, nextLvlXp); // Do not care about the changes made as long as it is successful
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  async getUpcomingReminder() {
    return await new Promise((resolve, reject) => {
      try {
        const stmt = this.#db.prepare("SELECT * FROM reminder WHERE strftime('%s', printf('%04d-%02d-%02d %02d:%02d:%02d', year, month, day, hour, minute, second), 'localtime') >= strftime('%s', 'now', 'localtime') ORDER BY year, month, day, hour, minute, second;");
        const rows = stmt.all();
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    });
  }

  async addReminder(userId, day, month, year, hour, minute, second, topic) {
    return await new Promise((resolve, reject) => {
      try {
        const stmt = this.#db.prepare('INSERT INTO reminder (userId, day, month, year, hour, minute, second, topic) VALUES (?, ?, ?, ?, ?, ?, ?, ?);');
        stmt.run(userId, day, month, year, hour, minute, second, topic); // Do not care about the changes made as long as it is successful
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteReminder(id) {
    return await new Promise((resolve, reject) => {
      try {
        const stmt = this.#db.prepare('DELETE FROM reminder WHERE id = ?;');
        stmt.run(id); // Do not care about the changes made as long as it is successful
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteOldReminders() {
    return await new Promise((resolve, reject) => {
      try {
        const stmt = this.#db.prepare("DELETE FROM reminder WHERE strftime('%s', printf('%04d-%02d-%02d %02d:%02d:%02d', year, month, day, hour, minute, second), 'localtime') < strftime('%s', 'now', 'localtime');");
        stmt.run(); // Do not care about the changes made as long as it is successful
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  async close() {
    if (this.#db) {
      return await new Promise((resolve, reject) => {
        try {
          this.#db.close();
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    }
  }
};
