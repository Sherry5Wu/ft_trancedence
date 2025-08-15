import Database from 'better-sqlite3'

export let db;

export function initDB(fastify) {
    const dbPath = "./data/stats.db";

    try 
    {
        db = new Database(dbPath);
        fastify.log.info('Database opened: ' + dbPath);
    } 
        catch (err) 
    {
        fastify.log.error('Error when opening database: ' + err.message);
    }

// Create tables

db.prepare(`
    CREATE TABLE IF NOT EXISTS match_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id TEXT NOT NULL,
      opponent_id TEXT NOT NULL,
      player_name TEXT NOT NULL,
      opponent_name TEXT NOT NULL,
      player_score INTEGER NOT NULL,
      opponent_score INTEGER NOT NULL,
      duration TIME,
      result TEXT CHECK(result IN ('win', 'loss', 'draw')) NOT NULL,
      played_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

db.prepare(`
    CREATE TABLE IF NOT EXISTS score_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    elo_score INTEGER,
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    `).run();
 
db.prepare(`
    CREATE TABLE IF NOT EXISTS user_match_data (
      player_id TEXT PRIMARY KEY,
      player_name TEXT NOT NULL,
      elo_score INTEGER DEFAULT 1000,
      games_played INTEGER NOT NULL,
      games_won INTEGER NOT NULL,
      games_lost INTEGER NOT NULL,
      win_streak DEFAULT 0
    )
  `).run();
  

db.prepare(`
    CREATE TABLE IF NOT EXISTS rivals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id TEXT NOT NULL,
      rival_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(player_id, rival_id)
    )
  `).run();
}