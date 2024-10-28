import sqlite3 from "sqlite3";

export default new (class Database {
  #db;

  constructor() {
    this.connect("./database/sqlite.db")
      .then(async () => {
        console.log("Connected to the sqlite3 database.");
        this.initDb();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async initDb() {
    if (this.#db) {
      this.#db.run(
        "CREATE TABLE IF NOT EXISTS birthdays (id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT UNIQUE, year INT, month INT, day INT);",
        (err) => {
          if (err) {
            console.log(
              `Could not make sure the birthdays table exists: ${err}`,
            );
          } else {
            console.log("Successfully made sure the birthdays table exists");
          }
        },
      );
      this.#db.run(
        "CREATE TABLE IF NOT EXISTS levelling (id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT UNIQUE, xp BIGINT, lvl BIGINT, nextLvlXp BIGINT);",
        (err) => {
          if (err) {
            console.log(
              `Could not make sure the levelling table exists: ${err}`,
            );
          } else {
            console.log("Successfully made sure the levelling table exists");
          }
        },
      );
    }
  }

  async connect(host) {
    await this.close();
    return new Promise((resolve, reject) => {
      this.#db = new sqlite3.Database(host, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getBirthday(userId) {
    return new Promise((resolve, reject) => {
      this.#db.get(
        "SELECT * FROM birthdays WHERE userId = ?;",
        [userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        },
      );
    });
  }

  async getBirthdays() {
    return new Promise((resolve, reject) => {
      this.#db.all("SELECT * FROM birthdays;", [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async setBirthday(userId, year, month, day) {
    return new Promise((resolve, reject) => {
      this.#db.run(
        "INSERT INTO birthdays (userId, year, month, day) VALUES (?, ?, ?, ?) ON CONFLICT (userId) DO UPDATE SET year = ?, month = ?, day = ? WHERE userId = ?;",
        [userId, year, month, day, year, month, day, userId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  }

  async deleteBirthday(userId) {
    return new Promise((resolve, reject) => {
      this.#db.run(
        "DELETE FROM birthdays WHERE userId = ?",
        [userId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  }

  async getLevelling(userId) {
    return new Promise((resolve, reject) => {
      if (userId) {
        this.#db.all(
          "SELECT * FROM levelling WHERE userId = ?",
          [userId],
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          },
        );
      } else {
        this.#db.all("SELECT * FROM levelling", [], (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      }
    });
  }

  async updateLevelling(userId, lastMessageTimestamp, xp, lvl, nextLvlXp) {
    return new Promise((resolve, reject) => {
      this.#db.run(
        "INSERT INTO levelling (userId, lastMessageTimestamp, xp, lvl, nextLvlXp) VALUES (?, ?, ?, ?, ?) ON CONFLICT(userId) DO UPDATE SET lastMessageTimestamp = excluded.lastMessageTimestamp, xp = excluded.xp, lvl = excluded.lvl, nextLvlXp = excluded.nextLvlXp",
        [userId, lastMessageTimestamp, xp, lvl, nextLvlXp],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  }

  async close() {
    if (this.#db) {
      new Promise((resolve, reject) => {
        this.#db.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  }
})();
