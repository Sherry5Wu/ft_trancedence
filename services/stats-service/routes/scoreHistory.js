
import { db } from '../db/init.js';
import { requireAuth } from '../utils/auth.js';

export default async function scoreHistoryRoutes(fastify) {
    // /score_history
    fastify.get('/', async (request, reply) => {
        try {
            const stmt = db.prepare('SELECT * FROM score_history');
            const rows = stmt.all();
            reply.send(rows);
        }
        catch (err)
        {
            reply.status(500).send({ error: err.message });
        }
    });
  
  // /score_history/:player_id
    fastify.get('/:player_id', (request, reply) => {
        const { player_id } = request.params;
        try {
            const stmt = db.prepare('SELECT * FROM score_history WHERE player_id = ? ORDER BY played_at DESC');
            const rows = stmt.all(player_id);
            reply.send(rows);
        }
        catch (err)
        {
            reply.status(500).send({ error : err.message});
        }
    });

    // /score_history/:player_username
    fastify.get('/:player_username', (request, reply) => {
        const { player_username } = request.params;
        try {
            const stmt = db.prepare('SELECT * FROM score_history WHERE player_username = ? ORDER BY played_at DESC');
            const rows = stmt.all(player_username);
            reply.send(rows);
        }
        catch (err)
        {
            reply.status(500).send({ error : err.message});
        }
    });
}