// Ladataan paketit ES module -syntaksilla
import Fastify from 'fastify';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
//import jwt from '@fastify/jwt';

// Ladataan ympäristömuuttujat
dotenv.config();

// Luodaan Fastify-instanssi
const fastify = Fastify({ logger: true });

// JWT-tuki
// await fastify.register(jwt, {
//  secret: process.env.JWT_SECRET
//});

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

// Luodaan elo score taulu 
db.prepare(`
  CREATE TABLE IF NOT EXISTS scores (
    player_id TEXT PRIMARY KEY,
    player_name TEXT NOT NULL,
    elo_score INTEGER DEFAULT 1000
  )
`).run();


// JWT verification middleware - SIMPLE MOCK
const requireAuth = async (request, reply) => {
  // 🧪 MOCK AUTH - Kovakoodattu käyttäjä
  console.log('🎭 MOCK AUTH: Using test user');
  
  request.id = 'test-user-123';
  request.email = 'testuser@example.com';
  
  // Optio: Lue käyttäjä headerista testausta varten
  if (request.headers['x-test-user-id']) {
    request.id = request.headers['x-test-user-id'];
  }
};

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
fastify.post('/scores', { preHandler: requireAuth }, (request, reply) => {
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

function getEloScore(player_id) {
  try {
    const stmt = db.prepare(`SELECT elo_score FROM scores WHERE player_id = ?`);
    const row = stmt.get(player_id);
    return row ? row.elo_score : 1000; // Palautaa numeron, ei Response objektia
  } 
  catch (err) 
  {
    console.error('Error getting elo score:', err);
    return 1000; // Default elo
  }
}

function eloProbability(rating1, rating2)
{
  return 1 / (1 + Math.pow(10, (rating1 - rating2) / 400));
}

function updatePlayerElo(playerId, newScore, playerName) {
  try 
  {
    const stmt = db.prepare(`UPDATE scores SET elo_score = ? WHERE player_id = ?`);
    const result = stmt.run(Math.round(newScore), playerId);
    if (result.changes === 0) 
    {
      const insertStmt = db.prepare(`
        INSERT INTO scores (player_id, player_name, elo_score)
        VALUES (?, ?, ?)
      `);
      insertStmt.run(playerId, playerName, Math.round(newScore));
      console.log(`✅ Created new player: ${playerId} (${playerName}) with elo ${Math.round(newScore)}`);
    } 
    else 
    {
      console.log(`✅ Updated player: ${playerId} to elo ${Math.round(newScore)}`);
    }
  } catch(err) {
    console.log('Error updating elo score:', err);
  }
}

function calculateEloScore(player_id1, player_id2, outcome, player1_name, player2_name)
{
  let rating1 = getEloScore(player_id1);
  let rating2 = getEloScore(player_id2);
  let P1;
  let P2;
  let K = 30;
  //outcome = 1 for player_id1 win, outcome = 0 player_id2 win, outcome = 0.5 means draw
  //P1 = (1.0 / (1.0 + pow(10, ((rating1 - rating2) / 400)))); 
  //P2 = (1.0 / (1.0 + pow(10, ((rating2 - rating1) / 400)))); 
  P1 = eloProbability(rating1, rating2);
  P2 = eloProbability(rating2, rating1);

  let newRating1 = rating1 + K * (outcome - P1);
  let newRating2 = rating2 + K * ((1 - outcome) - P2);
  // updates the player elo scores
  updatePlayerElo(player_id1, newRating1, player1_name);
  updatePlayerElo(player_id2, newRating2, player2_name);
  return {
      player1: { name: player1_name, old: rating1, new: Math.round(newRating1) },
      player2: { name: player2_name, old: rating2, new: Math.round(newRating2) }
  }
}
// Reitti Elo scoren päivittämiseen pelaajalle ID:n perusteella
fastify.put('/scores/:player_id', { preHandler: requireAuth }, (request, reply) => {
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
fastify.post('/match_history', { preHandler: requireAuth }, (request, reply) => {
  // TURVALLISUUS: player_id vain tokenista
  const player_id = request.id;  // Uniikki ID tokenista - EI VOI HUIJATA
  const {opponent_id, player_score, opponent_score, duration, player_name, opponent_name, result } = request.body;  // Display name voi vaihtua

  if (!player_score || !opponent_score || !duration || !player_id || !opponent_id || !player_name || !opponent_name || !['win', 'loss', 'draw'].includes(result)) {
    return reply.status(400).send({ error: 'Player_id, opponent_id, player_name, opponent_name, result(win, loss, draw) is required' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO match_history (duration, player_score, opponent_score, opponent_id, player_id, player_name, opponent_name, result)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const resultDb = stmt.run(duration, player_score, opponent_score, opponent_id, player_id, player_name, opponent_name, result);
    
    let outcome;
    if (result === 'win')
      outcome = 1;
    else if (result === 'loss')
      outcome = 0;
    else
      outcome = 0.5;

    const eloChanges = calculateEloScore(player_id, opponent_id, outcome, player_name, opponent_name);
    reply.send({ 
      id: resultDb.lastInsertRowid, 
      player_id, 
      player_name, 
      opponent_name, 
      result,
      eloChanges});
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