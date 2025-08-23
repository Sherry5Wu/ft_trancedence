import { db } from '../db/init.js';
export default async function userMatchDataRoutes(fastify) {
  // /user_match_data
  fastify.get('/', (request, reply) => {
      try {
        const rows = db.prepare('SELECT * FROM user_match_data').all();
        // Optionally, you could sort by rank or elo_score here
        reply.send(rows);
      } catch (err) {
        reply.status(500).send({ error: err.message });
      }
    });
  // /user_match_data/:player_id
  fastify.get('/:player_id', (request, reply) => {
      const { player_id } = request.params;
      try {
        const stmt = db.prepare(`SELECT * FROM user_match_data WHERE player_id = ?`);
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

    // /user_match_data/:player_username
  fastify.get('/username/:player_username', (request, reply) => {
    const { player_username } = request.params;
    try {
        const stmt = db.prepare(`SELECT * FROM user_match_data WHERE player_username = ?`);
        const row = stmt.get(player_username);
      if (row) {
        reply.send(row);
      } else {
        reply.status(404).send({ error: 'Player was not found' });
      }
    } catch (err) {
      reply.status(500).send({ error: err.message });
    }
  });

}
