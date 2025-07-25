// Ladataan paketit
const Fastify = require('fastify');
require('dotenv').config();

// Luodaan Fastify-instanssi
const fastify = Fastify({ logger: true });

// Avataan SQLite-tietokanta (tiedoston polku .env:stä tai oletus)
const Database = require('better-sqlite3');

//const dbPath = process.env.DATABASE_URL || './data/pong.db';
const dbPath = "./data/pong.db"

let db;

try {
  db = new Database(dbPath);
  fastify.log.info('Database opened: ' + dbPath);
} catch (err) {
  fastify.log.error('Error when opening the database: ' + err.message);
}
// Luodaan taulu, jos sitä ei ole

// add tournament start time and finish time

db.prepare(`
  CREATE TABLE IF NOT EXISTS tournament_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id TEXT NOT NULL,
    stage_number INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    opponent_name TEXT NOT NULL,
    result TEXT CHECK(result IN ('win', 'loss', 'draw')) NOT NULL,
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Yksinkertainen reitti, joka palauttaa kaikki pisteet
fastify.get('/tournament_history', (request, reply) => {
  try {
    const rows = db.prepare('SELECT * FROM tournament_history').all();
    reply.send(rows);
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});

// Retti elo scoren hakemiseen pelaajan_idn perusteella
fastify.get('/tournament_history/:tournament_id', (request, reply) => {
  const { tournament_id } = request.params;

  try {
    const stmt = db.prepare(`SELECT * FROM tournament_history WHERE tournament_id = ?`);
    const rows = stmt.all(tournament_id);
    if (rows) {
      reply.send(rows);
    } else {
      reply.status(404).send({ error: 'Tournament not found' });
    }
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});


// Reitti uuden matchin lisäämiseen (POST JSON-bodyllä)
fastify.post('/tournament_history', (request, reply) => {
  const {tournament_id, stage_number, match_number, player_name, opponent_name, result } = request.body;

  if (!tournament_id || !stage_number || !match_number || !player_name || !opponent_name || !['win', 'loss', 'draw'].includes(result)) {
    return reply.status(400).send({ error: 'Errors in data' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO tournament_history (tournament_id, stage_number, match_number, player_name, opponent_name, result)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const resultDb = stmt.run(tournament_id, stage_number, match_number, player_name, opponent_name, result);
    reply.send({ id: resultDb.lastInsertRowid, tournament_id, stage_number, match_number, player_name, opponent_name, result });
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});


// Käynnistetään palvelin portissa 3000 (tai .env:n PORT)
const port = process.env.PORT || 3002;
fastify.listen({ port, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server is running at address ${address}`);
});
