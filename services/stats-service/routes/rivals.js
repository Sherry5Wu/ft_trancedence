import { db } from '../db/init.js';
import { requireAuth } from '../utils/auth.js';

export default async function rivalsRoutes(fastify) {
    // /rivals/:player_id
    fastify.get('/:player_id', (request, reply) => {
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

    // get /rivals
    fastify.get('/', (request, reply) => {
        try {
        const stmt = db.prepare('SELECT * FROM rivals');
        const rows = stmt.all();
        reply.send(rows);
        }
        catch (err)
        {
        reply.status(500).send({ error: err.message });
        }
    });

    // post /rivals
    fastify.post('/', { preHandler: requireAuth }, (request, reply) => {
        console.log("Inserting into rivals..")
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
    // /rivals/:rival_id
    fastify.delete('/:rival_id', { preHandler: requireAuth }, (request, reply) => {
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
}