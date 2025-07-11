import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

/**
 * SQLite database instance (initialized after `initDb()` is called).
 * @type {import('sqlite3').Database|null}
 */
let db;

/**
 * Initializes the SQLite database connection and creates the users table if it doesn't exist.
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If database initialization fails.
 * @example
 * await initDb(); // Initializes database and creates tables
 */
export async function initDb() {
  db = await open({ filename: './auth.db', driver: sqlite3.Database });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      userId INTEGER PRIMARY KEY AUTOINCREMENT,
      userEmail TEXT UNIQUE,
      password TEXT,
      is_2fa_enabled INTEGER DEFAULT 0,
      totp_secret TEXT
    );
  `);
}

/**
 * Gets the initialized database instance.
 * @returns {import('sqlite3').Database} The active database connection.
 * @throws {Error} If database hasn't been initialized (call `initDb()` first).
 * @example
 * const database = getDb();
 * const user = await database.get('SELECT * FROM users WHERE email = ?', [email]);
 */
export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}
