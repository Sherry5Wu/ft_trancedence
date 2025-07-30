// Ladataan paketit ES module -syntaksilla
import Fastify from 'fastify';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import jwt from '@fastify/jwt';

// Ladataan ympäristömuuttujat
dotenv.config();

// Luodaan Fastify-instanssi
const fastify = Fastify({ logger: true });

// JWT-tuki
await fastify.register(jwt, {
  secret: process.env.JWT_SECRET
});

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

fastify.addHook('preHandler', async (request, reply) => {

  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = fastify.jwt.verify(token);
    request.id = decoded.id; // Tallennetaan käyttäjän ID pyyntöön
    request.email = decoded.email; // Tallennetaan käyttäjän sähköposti pyyntöön
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});

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
  // TURVALLISUUS: player_id vain tokenista, player_name voi tulla frontendistä
  const player_id = request.id;  // Uniikki ID tokenista - EI VOI HUIJATA
  const { player_name, elo_score } = request.body;  // Display name voi vaihtua

  if (!player_name || !elo_score) {
    return reply.status(400).send({ error: 'Player name ja elo score vaaditaan' });
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
  const { elo_score, player_name } = request.body;
  
  // TURVALLISUUS: vain oma score voidaan päivittää
  if (player_id !== request.id) {
    return reply.status(403).send({ error: 'Voit päivittää vain omaa scoreasi' });
  }

  if (typeof elo_score !== 'number') {
    return reply.status(400).send({ error: 'Virheellinen pistemäärä' });
  }

  try {
    // Päivitetään sekä elo_score että player_name (jos annettu)
    if (player_name) {
      const stmt = db.prepare(`UPDATE scores SET elo_score = ?, player_name = ? WHERE player_id = ?`);
      stmt.run(elo_score, player_name, player_id);
      reply.send({ player_id, elo_score, player_name });
    } else {
      const stmt = db.prepare(`UPDATE scores SET elo_score = ? WHERE player_id = ?`);
      stmt.run(elo_score, player_id);
      reply.send({ player_id, elo_score });
    }
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
  // TURVALLISUUS: player_id vain tokenista
  const player_id = request.id;  // Uniikki ID tokenista - EI VOI HUIJATA
  const { player_name, opponent_name, result } = request.body;  // Display name voi vaihtua

  if (!player_name || !opponent_name || !['win', 'loss', 'draw'].includes(result)) {
    return reply.status(400).send({ error: 'Player name, vastustajan nimi ja tulos (win/loss/draw) vaaditaan' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO match_history (player_id, player_name, opponent_name, result)
      VALUES (?, ?, ?, ?)
    `);
    const resultDb = stmt.run(player_id, player_name, opponent_name, result);
    reply.send({ id: resultDb.lastInsertRowid, player_id, player_name, opponent_name, result });
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
