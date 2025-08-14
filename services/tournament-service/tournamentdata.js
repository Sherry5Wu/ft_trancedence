// Ladataan paketit
import Fastify from 'fastify';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
dotenv.config();

// Luodaan Fastify-instanssi
const fastify = Fastify({ logger: true });

// Avataan SQLite-tietokanta (tiedoston polku .env:stä tai oletus)
const dbPath = process.env.DATABASE_URL || './data/tournament.db';
let db;

try {
  db = new Database(dbPath);
  fastify.log.info('Database opened: ' + dbPath);
} catch (err) {
  fastify.log.error('Error when opening the database: ' + err.message);
}
// Luodaan taulu, jos sitä ei ole

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

// ✅ JULKINEN REITTI - ei vaadi JWT:tä
// Yksinkertainen reitti, joka palauttaa kaikki turnaushistoriat
fastify.get('/tournament_history', (request, reply) => {
  try {
    const rows = db.prepare('SELECT * FROM tournament_history').all();
    reply.send(rows);
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});

// ✅ JULKINEN REITTI - ei vaadi JWT:tä  
// Hakee tietyn turnauksen kaikki matsit
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
// ⚠️ VAIN AUTENTIKOIDUT KÄYTTÄJÄT!
fastify.post('/tournament_history', (request, reply) => {
  // TURVALLISUUS: player_id vain tokenista
  const { tournament_id, stage_number, match_number, player_name, opponent_name, result } = request.body;

  if (!tournament_id || !stage_number || !match_number || !player_name || !opponent_name || !['win', 'loss', 'draw'].includes(result)) {
    return reply.status(400).send({ error: 'Tournament_id, stage_number, match_number, player_name, opponent_name ja result (win/loss/draw) vaaditaan' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO tournament_history (tournament_id, stage_number, match_number, player_name, opponent_name, result)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const resultDb = stmt.run(tournament_id, stage_number, match_number, player_name, opponent_name, result);
    reply.send({ 
      id: resultDb.lastInsertRowid, 
      tournament_id, 
      stage_number, 
      match_number, 
      player_name, 
      opponent_name, 
      result 
    });
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});


// Käynnistetään palvelin portissa 3001 (yhtenäisyys muiden kanssa)
const port = process.env.PORT || 3001;
fastify.listen({ port, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server is running at address ${address}`);
});

const gracefullShutdown = async (signal) => {
  fastify.log.info(`Received ${signal}, shutting down gracefully...`);
  try {
    await fastify.close();
    db.close();
    fastify.log.info('Server and database closed successfully');
  } catch (err) {
    fastify.log.error('Error during shutdown:', err);
    process.exit(1);
  }
  process.exit(0);
};

process.on('SIGINT', gracefullShutdown);
process.on('SIGTERM', gracefullShutdown);