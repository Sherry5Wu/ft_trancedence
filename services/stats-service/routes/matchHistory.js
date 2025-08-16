import { calculateEloScore, calculateGamesLost, calculateGamesPlayed, calculateGamesWon, calculateLongestWinStreak, calculateGamesDraw, checkIfRivals, calculateGamesPlayedAgainstRival, calculateWinsAgainstRival, calculateLossAgainstRival} from '../utils/calculations.js'
import { updateUserMatchDataTable, updateScoreHistoryTable, updateRivalsDataTable } from '../utils/updateFunctions.js';
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
        const { player_id } = request.params
        try {
            const stmt = db.prepare(`
                SELECT * FROM match_history
                WHERE player_id = ? OR opponent_id = ?
                ORDER BY played_at DESC
            `);
            const rows = stmt.all(player_id, player_id);
            if (rows)
            {
                reply.send(rows);
            } 
            else 
            {
                reply.status(404).send({ error: 'Player id was not found' });
            }
        } catch (err) {
            reply.status(500).send({ error: err.message });
        }
    });

     // /match_history/username/:player_username
    fastify.get('/username/:player_username', (request, reply) => {
        const { player_username } = request.params
        try {
            const stmt = db.prepare(`
                SELECT * FROM match_history
                WHERE player_username = ? OR opponent_username = ?
                ORDER BY played_at DESC
            `);
            const rows = stmt.all(player_username, player_username);
            if (rows)
            {
                reply.send(rows);
            } 
            else 
            {
                reply.status(404).send({ error: 'Player id was not found' });
            }
        } catch (err) {
            reply.status(500).send({ error: err.message });
        }
    });


    // post /match_history
    fastify.post('/', { preHandler: requireAuth }, (request, reply) => {
        // TURVALLISUUS: player_id vain tokenista
        const player_id = request.id;  // Uniikki ID tokenista - EI VOI HUIJATA
        const player_username = request.username;
        const {opponent_username, opponent_id, player_score, opponent_score, duration, player_name, opponent_name, result, played_at} = request.body;  // Display name voi vaihtua
    

        /// add type checking for the values before updating
        if (!opponent_username || !played_at || !player_score || !opponent_score || !duration || !player_id || !opponent_id || !player_name || !opponent_name || !['win', 'loss', 'draw'].includes(result)) {
        return reply.status(400).send({ error: 'Opponent_username, Played_at, Player_id, opponent_id, player_name, opponent_name, result(win, loss, draw) is required' });
        }
    
        try {
        const stmt = db.prepare(`
            INSERT INTO match_history (player_username, opponent_username, played_at, duration, player_score, opponent_score, opponent_id, player_id, player_name, opponent_name, result)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const resultDb = stmt.run(player_username, opponent_username, played_at, duration, player_score, opponent_score, opponent_id, player_id, player_name, opponent_name, result);

        let outcome;
        if (result === 'win')
            outcome = 1;
        else if (result === 'loss')
            outcome = 0;
        else
            outcome = 0.5;

        const updateWin = db.prepare(`
                UPDATE user_match_data
                SET
                    win_streak = win_streak + 1
                WHERE player_id = ?
            `);
         const resetStreak = db.prepare(`
                UPDATE user_match_data
                SET
                    win_streak = 0
                WHERE player_id = ?
            `);
        if (outcome === 1)
        {
            updateWin.run(player_id);
            if (player_id !== opponent_id)
                resetStreak.run(opponent_id);   
        }
        else
        {
            updateWin.run(opponent_id);
            if (player_id !== opponent_id)
                resetStreak.run(player_id);
        }
    
        const gamesPlayed = calculateGamesPlayed(player_id);
        const gamesLost = calculateGamesLost(player_id);
        const gamesWon = calculateGamesWon(player_id);
        const longestWinStreak = calculateLongestWinStreak(player_id);
        const gamesDraw = calculateGamesDraw(player_id);
        const eloChanges = calculateEloScore(player_id, opponent_id, outcome, player_name, opponent_name);
        const opponentGamesPlayed = calculateGamesPlayed(opponent_id);
        const opponentGamesLost = calculateGamesLost(opponent_id);
        const opponentGamesWon = calculateGamesWon(opponent_id);
        const opponentlongestWinStreak = calculateLongestWinStreak(opponent_id);
        const opponentGamesDraw = calculateGamesDraw(opponent_id);

        if (checkIfRivals(player_username, opponent_username)) {
            const playedagainstRival1 = calculateGamesPlayedAgainstRival(player_username, opponent_username);
            const gamesWonRival1 = calculateWinsAgainstRival(player_username, opponent_username);
            const gamesLostRival1 = calculateLossAgainstRival(player_username, opponent_username);
            updateRivalsDataTable(player_username, opponent_username, playedagainstRival, gamesWonRival, gamesLostRival, eloChanges.player1.new);
            const playedagainstRival2 = calculateGamesPlayedAgainstRival(opponent_username, player_username);
            const gamesWonRival2 = calculateWinsAgainstRival(opponent_username, player_username);
            const gamesLostRival2 = calculateLossAgainstRival(opponent_username, player_username);
            updateRivalsDataTable(opponent_username, player_username, playedagainstRival, gamesWonRival, gamesLostRival, eloChanges.player2.new);
        }
        
        updateUserMatchDataTable(player_id, eloChanges.player1.new, player_name, gamesPlayed, gamesLost, gamesWon, longestWinStreak, gamesDraw, player_username);
        updateUserMatchDataTable(opponent_id, eloChanges.player2.new, opponent_name, opponentGamesPlayed, opponentGamesLost, opponentGamesWon, opponentlongestWinStreak, opponentGamesDraw, opponent_username);
        updateScoreHistoryTable(player_id, eloChanges.player1.new, played_at, player_username);
        updateScoreHistoryTable(opponent_id, eloChanges.player2.new, played_at, opponent_username);
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
  