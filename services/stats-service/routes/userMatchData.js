import { db } from '../db/init.js';
export default async function userMatchDataRoutes(fastify) {
// /user_match_data
fastify.get('/', (request, reply) => {
    try {
      const rows = db.prepare('SELECT * FROM user_match_data').all();
      reply.send(rows);
    } catch (err) {
      reply.status(500).send({ error: err.message });
    }
  });
// /user_match_data/:player_id
fastify.get('/scores/:player_id', (request, reply) => {
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
}
