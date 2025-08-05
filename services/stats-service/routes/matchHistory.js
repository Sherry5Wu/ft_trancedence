import { calculateEloScore, calculateGamesLost, calculateGamesPlayed, calculateGamesWon} from '../utils/calculations.js'
import { updateUserMatchDataTable, updateScoreHistoryTable } from '../utils/updateFunctions.js';
import { db } from '../db/init.js';
import { requireAuth } from '../utils/auth.js';

export default async function matchHistoryRoutes(fastify) {
    // /match_history
    fastify.get('/', (request, reply) => {
        try {
        const rows = db.prepare('SELECT * FROM match_history').all();
        reply.send(rows);
        } catch (err) {
        reply.status(500).send({ error: err.message });
        }
    });
    
    // /match_history/:player_id
    fastify.get('/:player_id', (request, reply) => {
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


    // post /match_history
    fastify.post('/', { preHandler: requireAuth }, (request, reply) => {
        // TURVALLISUUS: player_id vain tokenista
        const player_id = request.id;  // Uniikki ID tokenista - EI VOI HUIJATA
        const {opponent_id, player_score, opponent_score, duration, player_name, opponent_name, result, played_at} = request.body;  // Display name voi vaihtua
    

        /// add type checking for the values before updating
        if (!played_at || !player_score || !opponent_score || !duration || !player_id || !opponent_id || !player_name || !opponent_name || !['win', 'loss', 'draw'].includes(result)) {
        return reply.status(400).send({ error: 'Played_at, Player_id, opponent_id, player_name, opponent_name, result(win, loss, draw) is required' });
        }
    
        try {
        const stmt = db.prepare(`
            INSERT INTO match_history (played_at, duration, player_score, opponent_score, opponent_id, player_id, player_name, opponent_name, result)
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

        // Add type checking for the values before updating
        updateUserMatchDataTable(player_id, eloChanges.player1.new, player_name, gamesPlayed, gamesLost, gamesWon);
        updateUserMatchDataTable(opponent_id, eloChanges.player2.new, opponent_name, opponentGamesPlayed, opponentGamesLost, opponentGamesWon);
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

}
  