import { calculateEloScore, calculateGamesLost, calculateGamesPlayed, calculateGamesWon, calculateCurrentWinStreak, calculateLongestWinStreak, calculateGamesDraw, checkIfRivals, calculateGamesPlayedAgainstRival, calculateWinsAgainstRival, calculateLossAgainstRival} from '../utils/calculations.js'
import { updateUserMatchDataTable, updateScoreHistoryTable, updateRivalsDataTable } from '../utils/updateFunctions.js';
import { db } from '../db/init.js';
import { requireAuth } from '../utils/auth.js';

function handleSingleMatch(match, request) {
    const {
        player_username, opponent_username, played_at, duration, player_score, opponent_score,
        opponent_id, player_id, player_name, opponent_name, result, is_guest_opponent = 0
    } = match;

    const missing =
        opponent_username == null ||
        played_at == null ||
        duration == null ||
        player_id == null ||
        opponent_id == null ||
        player_name == null ||
        opponent_name == null ||
        result == null ||
        !['win', 'loss', 'draw'].includes(result) ||
        typeof player_score !== 'number' ||
        typeof opponent_score !== 'number';

    if (missing) {
        throw new Error('player/opponent names, ids, duration, played_at, result, and numeric scores are required');
    }

    const stmt = db.prepare(`
        INSERT INTO match_history (
            player_username, opponent_username, played_at, duration, player_score, opponent_score, opponent_id, player_id, player_name, opponent_name, result, is_guest_opponent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(player_username, opponent_username, played_at, duration, player_score, opponent_score, opponent_id, player_id, player_name, opponent_name, result, is_guest_opponent);

    let outcome;
    if (result === 'win')
        outcome = 1;
    else if (result === 'loss')
        outcome = 0;
    else
        outcome = 0.5;

    let eloChanges = null;
    let playerElo = 0;
    if (!is_guest_opponent) {
        eloChanges = calculateEloScore(player_id, opponent_id, outcome, player_name, opponent_name);
        playerElo = eloChanges.player1.new;
    } else {
        const userData = db.prepare('SELECT elo_score FROM user_match_data WHERE player_id = ?').get(player_id);
        playerElo = userData ? userData.elo_score : 1000;
    }

    const gamesPlayed = calculateGamesPlayed(player_id);
    const gamesLost = calculateGamesLost(player_id);
    const gamesWon = calculateGamesWon(player_id);
    const longestWinStreak = calculateLongestWinStreak(player_id);
    const currentWinStreak = calculateCurrentWinStreak(player_id);
    const gamesDraw = calculateGamesDraw(player_id);

    if (!is_guest_opponent) {
        const opponentGamesPlayed = calculateGamesPlayed(opponent_id);
        const opponentGamesLost = calculateGamesLost(opponent_id);
        const opponentGamesWon = calculateGamesWon(opponent_id);
        const opponentlongestWinStreak = calculateLongestWinStreak(opponent_id);
        const opponentGamesDraw = calculateGamesDraw(opponent_id);
        const opponentWinStreak = calculateCurrentWinStreak(opponent_id);
        updateUserMatchDataTable(opponent_id, eloChanges.player2.new, opponent_name, opponentGamesPlayed, opponentGamesLost, opponentGamesWon, opponentlongestWinStreak, opponentGamesDraw, opponent_username, opponentWinStreak);
        updateScoreHistoryTable(opponent_id, eloChanges.player2.new, played_at, opponent_username);
    }

    console.log("Updating rivals.. checkIfRivals was false");
    if (checkIfRivals(player_username, opponent_username) && !is_guest_opponent) {
        console.log("Updating rivals.. checkIfRivals was true");
        const playedagainstRival1 = calculateGamesPlayedAgainstRival(player_username, opponent_username);
        const gamesWonRival1 = calculateWinsAgainstRival(player_username, opponent_username);
        const gamesLostRival1 = calculateLossAgainstRival(player_username, opponent_username);
        updateRivalsDataTable(player_username, opponent_username, playedagainstRival1, gamesWonRival1, gamesLostRival1, eloChanges.player1.new);
        const playedagainstRival2 = calculateGamesPlayedAgainstRival(opponent_username, player_username);
        const gamesWonRival2 = calculateWinsAgainstRival(opponent_username, player_username);
        const gamesLostRival2 = calculateLossAgainstRival(opponent_username, player_username);
        updateRivalsDataTable(opponent_username, player_username, playedagainstRival2, gamesWonRival2, gamesLostRival2, eloChanges.player2.new);
    }

    updateUserMatchDataTable(player_id, playerElo, player_name, gamesPlayed, gamesLost, gamesWon, longestWinStreak, gamesDraw, player_username, currentWinStreak);
    updateScoreHistoryTable(player_id, playerElo, played_at, player_username);
}

export default async function matchHistoryRoutes(fastify) {
    fastify.get('/', (request, reply) => {
        try {
            const rows = db.prepare('SELECT * FROM match_history').all();
            reply.send(rows);
        } catch (err) {
            reply.status(500).send({ error: err.message });
        }
    });
    
    fastify.get('/:player_id', (request, reply) => {
        const { player_id } = request.params
        try {
            const stmt = db.prepare(`
                SELECT * FROM match_history
                WHERE player_id = ?
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

    fastify.get('/username/:player_username', (request, reply) => {
        const { player_username } = request.params
        try {
            const stmt = db.prepare(`
                SELECT * FROM match_history
                WHERE player_username = ?
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


    fastify.post('/', { 
        preHandler: requireAuth,
        schema: {
            tags: ['MatchHistory'],
            summary: 'Add a match to history',
            body: {
                type: 'object',
                required: [
                    'opponent_username', 'player_score', 'opponent_score', 'duration',
                    'player_name', 'opponent_name', 'result', 'played_at'
                ],
                properties: {
                    opponent_username: { type: 'string'},
                    opponent_id: { type: 'string' },
                    player_score: { type: 'integer' },
                    opponent_score: { type: 'integer'},
                    duration: { type: 'string', pattern: '^\\d{2}:\\d{2}:\\d{2}$'},
                    player_name: { type: 'string'},
                    opponent_name: {type: 'string'},
                    result: {type: 'string', enum: ['win', 'draw', 'loss']},
                    played_at: { type: 'string' },
                    is_guest_opponent: { type: 'integer', enum: [0, 1], default: 0}
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                },
                400: {type: 'object', properties: { error: {type: 'string'} } },
                500: {type: 'object', properties: { error: {type: 'string' } } }
            }
        }
     }, (request, reply) => {
        const player_id = request.id;
        const player_username = request.username;
        const { opponent_username, opponent_id, player_score, opponent_score, duration, player_name, opponent_name, result, played_at, is_guest_opponent = 0 } = request.body;  // Display name voi vaihtua
    
        const missing =
          opponent_username == null ||
          played_at == null ||
          duration == null ||
          player_id == null ||
          opponent_id == null ||
          player_name == null ||
          opponent_name == null ||
          result == null ||
          !['win', 'loss', 'draw'].includes(result) ||
          typeof player_score !== 'number' ||
          typeof opponent_score !== 'number';

        if (missing) {
          return reply.status(400).send({
            error:
              'player/opponent names, ids, duration, played_at, result, and numeric scores are required',
          });
        }
    
        try {
            handleSingleMatch({
                player_username, opponent_username, played_at, duration, player_score, opponent_score,
                opponent_id, player_id, player_name, opponent_name, result, is_guest_opponent
            }, request);
            reply.send({ message: 'Match added to history successfully' });
        } catch (err) {
            console.error('Error when trying to add match history', err)
            reply.status(500).send({ error: err.message });
        }
    });

    fastify.post('/update_all', { 
        preHandler: requireAuth,
        schema: {
            tags: ['MatchHistory'],
            summary: 'Bulk add matches to history',
            body: {
                type: 'object',
                required: ['matches'],
                properties: {
                    matches: {
                        type: 'array',
                        minItems: 1,
                        items: {
                            type: 'object',
                            required: [
                                'opponent_username', 'player_score', 'opponent_score', 'duration',
                                'player_name', 'opponent_name', 'result', 'played_at'
                            ],
                            properties: {
                                opponent_username: { type: 'string'},
                                opponent_id: { type: 'string' },
                                player_score: { type: 'integer' },
                                opponent_score: { type: 'integer'},
                                duration: { type: 'string', pattern: '^\\d{2}:\\d{2}:\\d{2}$'},
                                player_name: { type: 'string'},
                                opponent_name: {type: 'string'},
                                result: {type: 'string', enum: ['win', 'draw', 'loss']},
                                played_at: { type: 'string' },
                                is_guest_opponent: { type: 'integer', enum: [0, 1], default: 0}
                            }
                        }
                    }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        inserted: {type: 'number'},
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    index: { type: 'number' },
                                    error: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                400: { type: 'object', properties: { error: { type: 'string' } } },
                500: { type: 'object', properties: { error: { type: 'string' } } }
            }
        }
     }, (request, reply) => {
        const { matches } = request.body ?? {};
        if (!Array.isArray(matches) || matches.length === 0) {
            return reply.status(400).send({ error: 'matches (array) required' });
        }

        const errors = [];
        for (let i = 0; i < matches.length; i++) {
            try {
                handleSingleMatch(matches[i], request);
            } catch (err) {
                errors.push({ index: i, error: err.message });
            }
        }

        reply.send({ inserted: matches.length - errors.length, errors });
    });
}
