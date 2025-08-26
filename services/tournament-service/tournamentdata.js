import Fastify from 'fastify';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
dotenv.config();

const fastify = Fastify({ logger: true });

const dbPath = process.env.DATABASE_URL || './data/tournament.db';
let db;

try {
  db = new Database(dbPath);
  fastify.log.info('Database opened: ' + dbPath);
} catch (err) {
  fastify.log.error('Error when opening the database: ' + err.message);
}

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

fastify.get('/tournament_history', (request, reply) => {
  try {
    const rows = db.prepare('SELECT * FROM tournament_history').all();
    reply.send(rows);
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});

fastify.get('/tournament_history/:tournament_id', (request, reply) => {
  const { tournament_id } = request.params;
  try {
    const stmt = db.prepare(`
      SELECT * FROM tournament_history
      WHERE tournament_id = ?
      ORDER BY stage_number ASC, match_number ASC, played_at ASC
    `);
    const rows = stmt.all(tournament_id);
    rows.length ? reply.send(rows) : reply.status(404).send({ error: 'Tournament not found' });
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});

const requireAuth = async (request, reply) => {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return reply.status(401).send({ error: 'Missing or invalid authorization header' });
        }
        console.log("Authenticating...")
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
        console.log("loggin userData");
        console.log(userData);
        
        console.log(`✅ Authenticated user: ${userData.username} (${userData.id})`);
        
      } catch (error) {
        console.error('🚨 Auth service connection error:', error.message);
        return reply.status(503).send({ 
          error: 'Authentication service unavailable',
          details: error.message 
        });
    }
};


fastify.post('/tournament_history/update_all', { preHandler: requireAuth }, (request, reply) => {
  const { entries } = request.body ?? {};
  if (!Array.isArray(entries) || entries.length === 0) {
    return reply.status(400).send({ error: 'entries (array) required' });
  }

  const validResults = ['win', 'loss', 'draw'];
  const errors = [];
  const insertData = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const hasId = typeof e.tournament_id === 'string' && e.tournament_id.trim().length > 0;
    const hasStage = Number.isInteger(e.stage_number);
    const hasMatch = Number.isInteger(e.match_number);
    const hasPName = typeof e.player_name === 'string' && e.player_name.trim().length > 0;
    const hasOName = typeof e.opponent_name === 'string' && e.opponent_name.trim().length > 0;
    const validResult = e.result && validResults.includes(e.result);
    if (!hasId || !hasStage || !hasMatch || !hasPName || !hasOName || !validResult) {
      errors.push({ index: i, error: 'Invalid or missing fields' });
    } else {
      insertData.push([
        e.tournament_id,
        e.stage_number,
        e.match_number,
        e.player_name,
        e.opponent_name,
        e.result
      ]);
    }
  }
  if (insertData.length === 0) {
    return reply.status(400).send({ error: 'No valid entries', details: errors });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO tournament_history (tournament_id, stage_number, match_number, player_name, opponent_name, result)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const results = [];
    const insertMany = db.transaction((rows) => {
      for (const row of rows) {
        const res = stmt.run(...row);
        results.push({ id: res.lastInsertRowid });
      }
    });
    insertMany(insertData);
    reply.send({ inserted: results.length, ids: results.map(r => r.id), errors });
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});

fastify.post('/tournament_history', { preHandler: requireAuth }, (request, reply) => {
  const { tournament_id, stage_number, match_number, player_name, opponent_name, result } = request.body ?? {};

  const validResult = result && ['win', 'loss', 'draw'].includes(result);
  const hasId = typeof tournament_id === 'string' && tournament_id.trim().length > 0;
  const hasStage = Number.isInteger(stage_number);
  const hasMatch = Number.isInteger(match_number);
  const hasPName = typeof player_name === 'string' && player_name.trim().length > 0;
  const hasOName = typeof opponent_name === 'string' && opponent_name.trim().length > 0;

  if (!hasId || !hasStage || !hasMatch || !hasPName || !hasOName || !validResult) {
    return reply.status(400).send({
      error: 'tournament_id, stage_number (int), match_number (int), player_name, opponent_name and result (win/loss/draw) are required'
    });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO tournament_history (tournament_id, stage_number, match_number, player_name, opponent_name, result)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const resultDb = stmt.run(tournament_id, stage_number, match_number, player_name, opponent_name, result);

    reply.send({
      id: resultDb.lastInsertRowid,
      tournament_id, stage_number, match_number, player_name, opponent_name, result
    });
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});

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