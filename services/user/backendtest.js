// Ladataan paketit
const Fastify = require('fastify');
require('dotenv').config();

// Luodaan Fastify-instanssi
const fastify = Fastify({ logger: true });

// Avataan SQLite-tietokanta (tiedoston polku .env:stä tai oletus)
const Database = require('better-sqlite3');

//const dbPath = process.env.DATABASE_URL || './data/pong.db';
const dbPath = "./data/pong.db";

let db;

try {
  db = new Database(dbPath);
  fastify.log.info('Tietokanta avattu: ' + dbPath);
} catch (err) {
  fastify.log.error('Virhe avattaessa tietokantaa: ' + err.message);
}
// Luodaan taulu, jos sitä ei ole
db.prepare(`
  CREATE TABLE IF NOT EXISTS match_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    player_name TEXT NOT NULL,
    opponent_name TEXT NOT NULL,
    result TEXT CHECK(result IN ('win', 'loss', 'draw')) NOT NULL,
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Luodaan score taulu 
db.prepare(`
  CREATE TABLE IF NOT EXISTS scores (
    player_id TEXT PRIMARY KEY,
    player_name TEXT NOT NULL,
    elo_score INTEGER DEFAULT 1000
  )
`).run();

// Yksinkertainen reitti, joka palauttaa kaikki pisteet
fastify.get('/scores', (request, reply) => {
  try {
    const rows = db.prepare('SELECT * FROM scores').all();
    reply.send(rows);
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});

// Retti elo scoren hakemiseen pelaajan_idn perusteella
fastify.get('/scores/:player_id', (request, reply) => {
  const { player_id } = request.params;

  try {
    const stmt = db.prepare(`SELECT * FROM scores WHERE player_id = ?`);
    const row = stmt.get(player_id);
    if (row) {
      reply.send(row);
    } else {
      reply.status(404).send({ error: 'Pelaajaa ei löytynyt' });
    }
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});

//Reitti pelaajan lisäämisen elo score taulukkoon
fastify.post('/scores', (request, reply) => {
  const { player_id, player_name, elo_score } = request.body;

  if (!player_id || !player_name || !elo_score) {
    return reply.status(400).send({ error: 'Virheellinen data' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO scores (player_id, player_name, elo_score)
      VALUES (?, ?, ?)
    `);
    stmt.run(player_id, player_name, elo_score);
    reply.send({ player_id, player_name, elo_score });
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});

// Reitti Elo scoren päivittämiseen pelaajalle ID:n perusteella
fastify.put('/scores/:player_id', (request, reply) => {
  const { player_id } = request.params;
  const { elo_score } = request.body;

  if (typeof elo_score !== 'number') {
    return reply.status(400).send({ error: 'Virheellinen pistemäärä' });
  }

  try {
    const stmt = db.prepare(`UPDATE scores SET elo_score = ? WHERE player_id = ?`);
    stmt.run(elo_score, player_id);
    reply.send({ player_id, elo_score });
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});


// Yksinkertainen reitti, joka palauttaa kaikki pisteet
fastify.get('/match_history', (request, reply) => {
  try {
    const rows = db.prepare('SELECT * FROM match_history').all();
    reply.send(rows);
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});

fastify.get('/match_history/:player_id', (request, reply) => {
  const { player_id } = request.params;

  try {
    const stmt = db.prepare(`
      SELECT * FROM match_history
      WHERE player_id = ?
      ORDER BY played_at DESC
    `);
    const rows = stmt.all(player_id);
    reply.send(rows);
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});


// Reitti uuden matchin lisäämiseen (POST JSON-bodyllä)
fastify.post('/match_history', (request, reply) => {
  const {player_id, player_name, opponent_name, result } = request.body;

  if (!player_id || !player_name || !opponent_name || !['win', 'loss', 'draw'].includes(result)) {
    return reply.status(400).send({ error: 'Virheellinen data' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO match_history (player_id, player_name, opponent_name, result)
      VALUES (?, ?, ?, ?)
    `);
    const resultDb = stmt.run(player_id, player_name, opponent_name, result);
    reply.send({ id: resultDb.lastInsertRowid, player_name, opponent_name, result });
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});


// Käynnistetään palvelin portissa 3000 (tai .env:n PORT)
const port = process.env.PORT || 3001;
fastify.listen({ port, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Palvelin käynnissä osoitteessa ${address}`);
});
