import { db } from '../db/init.js';
import { requireAuth } from '../utils/auth.js';
import { calculateLossAgainstRival, calculateGamesPlayedAgainstRival, calculateWinsAgainstRival, getEloScoreByUsername } from '../utils/calculations.js';

export default async function rivalsRoutes(fastify) {
    // /rivals/:player_id
    fastify.get('/:player_id', (request, reply) => {
        const { player_id } = request.params;
        try {
            const stmt = db.prepare('SELECT * FROM rivals WHERE player_id = ?');
            const rows = stmt.all(player_id);
            if (rows)
            {
                reply.send(rows);
            } 
            else 
            {
                reply.status(404).send({ error: 'Player_id was not found' });
            }
        }
        catch (err)
        {
            reply.status(500).send({ error: err.message });
        }
    });
    // /rivals/:player_username
    fastify.get('/username/:player_username', (request, reply) => {
        const { player_username } = request.params;
        try {
            const stmt = db.prepare('SELECT * FROM rivals WHERE player_username = ?');
            const rows = stmt.all(player_username);
            if (rows)
            {
                reply.send(rows);
            } 
            else 
            {
                reply.status(404).send({ error: 'Player username was not found' });
            }
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
        const player_username = request.username;
        const { rival_username } = request.body;
        const { rival_id } = request.body;
        
        if (!rival_id || !rival_username) {
            return reply.status(400).send({ error: 'Rival id and rival username is required' });
        }
        if (player_id === rival_id) {
            return reply.status(400).send({ error: 'Cannot add yourself as rival' });
        }
        const LossAgainstRival1 = calculateLossAgainstRival(player_username, rival_username);
        const GamesPlayedAgainstRival1 = calculateGamesPlayedAgainstRival(player_username, rival_username);
        const WinsAgainstRival1 = calculateWinsAgainstRival(player_username, rival_username);
        const rivalEloScore1 = getEloScoreByUsername(rival_username);
        const LossAgainstRival2 = calculateLossAgainstRival(rival_username, player_username);
        const GamesPlayedAgainstRival2 = calculateGamesPlayedAgainstRival(rival_username, player_username);
        const WinsAgainstRival2 = calculateWinsAgainstRival(rival_username, player_username);
        const rivalEloScore2 = getEloScoreByUsername(player_username);


        try {
        const stmt = db.prepare(`
            INSERT INTO rivals (player_id, rival_id, player_username, rival_username, games_played_against_rival, wins_against_rival, loss_against_rival, rival_elo_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(player_id, rival_id, player_username, rival_username, GamesPlayedAgainstRival1, WinsAgainstRival1, LossAgainstRival1, rivalEloScore1);
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

        try {
        const stmt = db.prepare(`
            INSERT INTO rivals (player_id, rival_id, player_username, rival_username, games_played_against_rival, wins_against_rival, loss_against_rival, rival_elo_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(rival_id, player_id, rival_username, player_username, GamesPlayedAgainstRival2, WinsAgainstRival2, LossAgainstRival2, rivalEloScore2);
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
                reply.send({
                id: result.lastInsertRowid, 
                message: 'Rival removed successfully' });
            }
        }
        catch (err) {
            reply.status(500).send({ error: err.message });
        }
    });
}