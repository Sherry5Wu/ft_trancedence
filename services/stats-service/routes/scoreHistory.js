
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
        const stmt = db.prepare('SELECT * FROM score_history WHERE player_id = ?');
        const rows = stmt.all(player_id);
        reply.send(rows);
        }
        catch (err)
        {
        reply.status(500).send({ error : err.message});
        }
    });

  // post /score_history
    fastify.post('/', { preHandler: requireAuth }, (request, reply) => {
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
        reply.send({message: 'Score history added successfully'});
        stmt.run(player_id, elo_score, player_at)
        }
        catch (err)
        {
        console.error('Error when trying to add score history', err)
        reply.status(500).send({ error: err.message });
        }
    });
}