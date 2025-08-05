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
  fastify.log.info('Database opened: ' + dbPath);
} catch (err) {
  fastify.log.error('Error when opening database: ' + err.message);
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

// Create elo score history table

db.prepare(`
  CREATE TABLE IF NOT EXISTS score_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  elo_score INTEGER,
  played_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
  `).run();

// Luodaan elo score taulu 
db.prepare(`
  CREATE TABLE IF NOT EXISTS scores (
    player_id TEXT PRIMARY KEY,
    player_name TEXT NOT NULL,
    elo_score INTEGER DEFAULT 1000,
    games_played INTEGER NOT NULL,
    games_won INTEGER NOT NULL,
    games_lost INTEGER NOT NULL
  )
`).run();

// Creating rivals table
db.prepare(`
  CREATE TABLE IF NOT EXISTS rivals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    rival_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, rival_id)
  )
`).run();

// JWT verification middleware - MICROSERVICES AUTH
const requireAuth = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Missing or invalid authorization header' });
    }

    const response = await fetch('http://auth-service:3001/auth/verify-token', {
      method: 'POST',
      headers: {
        'Authorization': authHeader
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Authentication failed' }));
      return reply.status(response.status).send(errorData);
    }

    const userData = await response.json();
    
    request.id = userData.id;
    request.email = userData.email;
    request.username = userData.username;
    
    console.log(`✅ Authenticated user: ${userData.username} (${userData.id})`);
    
  } catch (error) {
    console.error('🚨 Auth service connection error:', error.message);
    return reply.status(503).send({ 
      error: 'Authentication service unavailable',
      details: error.message 
    });
  }
};

fastify.get('/score_history/:player_id', (request, reply) => {
  const { player_id } = request.params;
  try {
    const stmt = db.prepare('SELECT * FROM score_history WHERE player_id = ?');
    const rows = stmt.all(player_id);
    reply.send(rows);
  }
  catch (err)
  {
    reply.status(500).send({ error : err.message});
  }
});

fastify.post('/score_history/', { preHandler: requireAuth }, (request, reply) => {
  const player_id = request.id;
  const { elo_score, player_at } = request.body;
  if (!elo_score || !player_at) {
    return reply.status(400).send({ error: 'Player at and elo score is required' });
  }
  try {
    const stmt = db.prepare(`
      INSERT INTO score_history (player_id, )
      VALUES (?, ?)
    `);
    stmt.run(player_id, elo_score, player_at)
  }
  catch (err)
  {
    console.error('Error when trying to add score history', err)
    reply.status(500).send({ error: err.message });
  }
});

fastify.get('/rivals/:player_id', (request, reply) => {
  const { player_id } = request.params;
  try {
    const stmt = db.prepare('SELECT * FROM rivals WHERE player_id = ?');
    const rows = stmt.all(player_id);
    reply.send(rows);
  }
  catch (err)
  {
     reply.status(500).send({ error: err.message });
  }
});

fastify.post('/rivals', { preHandler: requireAuth }, (request, reply) => {
  const player_id = request.id;
  const { rival_id } = request.body;
  
  if (!rival_id) {
    return reply.status(400).send({ error: 'Rival id is required' });
  }
  if (player_id === rival_id) {
    return reply.status(400).send({ error: 'Cannot add yourself as rival' });
  }
  
  try {
    const stmt = db.prepare(`
      INSERT INTO rivals (player_id, rival_id)
      VALUES (?, ?)
    `);
    const result = stmt.run(player_id, rival_id);
    reply.send({ 
      id: result.lastInsertRowid,
      player_id, 
      rival_id,
      message: 'Rival added successfully'
    });
  }
  catch (err) {
    // UNIQUE constraint violation
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      reply.status(409).send({ error: 'This rival already exists' });
    } else {
      reply.status(500).send({ error: err.message });
    }
  }
});

// DELETE rival
fastify.delete('/rivals/:rival_id', { preHandler: requireAuth }, (request, reply) => {
  const player_id = request.id;
  const { rival_id } = request.params;
  
  try {
    const stmt = db.prepare(`
      DELETE FROM rivals 
      WHERE player_id = ? AND rival_id = ?
    `);
    const result = stmt.run(player_id, rival_id);
    if (result.changes === 0) {
      reply.status(404).send({ error: 'Rival not found' });
    } else {
      reply.send({ message: 'Rival removed successfully' });
    }
  }
  catch (err) {
    reply.status(500).send({ error: err.message });
  }
});

fastify.get('/scores', (request, reply) => {
  try {
    const rows = db.prepare('SELECT * FROM scores').all();
    reply.send(rows);
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});

fastify.get('/scores/:player_id', (request, reply) => {
  const { player_id } = request.params;

  try {
    const stmt = db.prepare(`SELECT * FROM scores WHERE player_id = ?`);
    const row = stmt.get(player_id);
    if (row) {
      reply.send(row);
    } else {
      reply.status(404).send({ error: 'Player was not found' });
    }
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});

//Reitti pelaajan lisäämisen elo score taulukkoon
fastify.post('/scores', { preHandler: requireAuth }, (request, reply) => {
  // TURVALLISUUS: player_id vain tokenista, player_name voi tulla frontendistä
  const player_id = request.id;  // Uniikki ID tokenista - EI VOI HUIJATA
  const { player_name, elo_score, games_played = 0, games_won = 0, games_lost = 0 } = request.body;  // Display name voi vaihtua

  if (!player_name || !elo_score) {
    return reply.status(400).send({ error: 'Player name and elo score is required' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO scores (player_id, player_name, elo_score, games_played, games_won, games_lost)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(player_id, player_name, elo_score, games_played, games_won, games_lost);
    reply.send({ player_id, player_name, elo_score, games_played, games_won, games_lost });
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

function updateScoreHistoryTable(player_id, elo_score, played_at)
{
  try
  {
    const stmt = db.prepare(`
        INSERT INTO scores (player_id, elo_score, played_at)
        VALUES (?, ?, ?,)
      `);
  }
  catch(err)
  {
    console.log('Error updating score history table:', err);
  }
}

function updatePlayerScoreTable(playerId, newScore, playerName, gamesPlayed, gamesLost, gamesWon) {
  try 
  {
    const insertStmt = db.prepare(`
        INSERT INTO scores (player_id, player_name, elo_score, games_played, games_lost, games_won)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(player_id) DO UPDATE SET
        player_name = excluded.player_name,
        elo_score = excluded.elo_score,
        games_played = excluded.games_played,
        games_lost = excluded.games_lost,
        games_won = excluded.games_won
      `);
      insertStmt.run(playerId, playerName, Math.round(newScore), gamesPlayed, gamesLost, gamesWon);
      console.log(`✅ Updated or created player: ${playerId} (${playerName})`);
  } 
  catch(err) {
    console.log('Error updating player score table:', err);
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

function calculateGamesPlayed(player_id) {
  try {
     const stmt = db.prepare(`
      SELECT * FROM match_history
      WHERE player_id = ?
      ORDER BY played_at DESC
    `);
    const rows = stmt.all(player_id);
    return rows.length;
  }
  catch(err) {
    console.error('Error calculating gamesplayed:', err);
    return 0;
  }
}

function calculateGamesWon(player_id) {
  try {
     const stmt = db.prepare(`
      SELECT * FROM match_history
      WHERE player_id = ?
      ORDER BY played_at DESC
    `);
    const rows = stmt.all(player_id);
    const gamesWon = rows.filter(row => row.result === 'win');
    return gamesWon.length;
  }
  catch(err) {
    console.error('Error calculating gamesWon:', err);
    return 0;
  }
}

function calculateGamesLost(player_id) {
  try {
     const stmt = db.prepare(`
      SELECT * FROM match_history
      WHERE player_id = ?
      ORDER BY played_at DESC
    `);
    const rows = stmt.all(player_id);
    const gamesLost = rows.filter(row => row.result === 'loss');
    return gamesLost.length;
  }
  catch(err) {
    console.error('Error calculating gamesLost:', err);
    return 0;
  }
}



// Reitti uuden matchin lisäämiseen (POST JSON-bodyllä)
fastify.post('/match_history', { preHandler: requireAuth }, (request, reply) => {
  // TURVALLISUUS: player_id vain tokenista
  const player_id = request.id;  // Uniikki ID tokenista - EI VOI HUIJATA
  const {opponent_id, player_score, opponent_score, duration, player_name, opponent_name, result, played_at} = request.body;  // Display name voi vaihtua

  if (!played_at || !player_score || !opponent_score || !duration || !player_id || !opponent_id || !player_name || !opponent_name || !['win', 'loss', 'draw'].includes(result)) {
    return reply.status(400).send({ error: 'Played_at, Player_id, opponent_id, player_name, opponent_name, result(win, loss, draw) is required' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO match_history (duration, player_score, opponent_score, opponent_id, player_id, player_name, opponent_name, result)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const resultDb = stmt.run(played_at, duration, player_score, opponent_score, opponent_id, player_id, player_name, opponent_name, result);
    
    let outcome;
    if (result === 'win')
      outcome = 1;
    else if (result === 'loss')
      outcome = 0;
    else
      outcome = 0.5;

    const gamesPlayed = calculateGamesPlayed(player_id);
    const gamesLost = calculateGamesLost(player_id);
    const gamesWon = calculateGamesWon(player_id);
    const eloChanges = calculateEloScore(player_id, opponent_id, outcome, player_name, opponent_name);
    const opponentGamesPlayed = calculateGamesPlayed(opponent_id);
    const opponentGamesLost = calculateGamesLost(opponent_id);
    const opponentGamesWon = calculateGamesWon(opponent_id);
    updatePlayerScoreTable(player_id, eloChanges.player1.new, player_name, gamesPlayed, gamesLost, gamesWon);
    updatePlayerScoreTable(opponent_id, eloChanges.player2.new, opponent_name, opponentGamesPlayed, opponentGamesLost, opponentGamesWon);
    updateScoreHistoryTable(player_id, eloChanges.player1.new, played_at);
    updateScoreHistoryTable(opponent_id, eloChanges.player2.new, played_at);
    reply.send({ 
      id: resultDb.lastInsertRowid, 
      player_id, 
      player_name, 
      opponent_name, 
      result,
      gamesPlayed,
      gamesLost,
      gamesWon,
      opponentGamesPlayed,
      opponentGamesLost,
      opponentGamesWon,
      eloChanges,
      message: 'Match added to history successfully'
    });
  } catch (err) {
    console.error('Error when trying to add match history', err)
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
  fastify.log.info(`Server running on address ${address}`);
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