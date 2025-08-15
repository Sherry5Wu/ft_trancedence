import { db } from '../db/init.js';

function getEloScore(player_id) {
    try {
      const stmt = db.prepare(`SELECT elo_score FROM user_match_data WHERE player_id = ?`);
      const row = stmt.get(player_id);
      return row ? row.elo_score : 1000;
    } 
    catch (err) 
    {
      console.error('Error getting elo score:', err);
      return 1000;
    }
  }

function eloProbability(rating1, rating2)
{
  return 1 / (1 + Math.pow(10, (rating1 - rating2) / 400));
}

export function calculateEloScore(player_id1, player_id2, outcome, player1_name, player2_name)
{
  let rating1 = getEloScore(player_id1);
  let rating2 = getEloScore(player_id2);
  let P1;
  let P2;
  let K = 30;
  //outcome = 1 for player_id1 win, outcome = 0 player_id2 win, outcome = 0.5 means draw
  //P1 = (1.0 / (1.0 + pow(10, ((rating1 - rating2) / 400)))); 
  //P2 = (1.0 / (1.0 + pow(10, ((rating2 - rating1) / 400)))); 
  P1 = eloProbability(rating1, rating2);
  P2 = eloProbability(rating2, rating1);

  let newRating1 = rating1 + K * (outcome - P1);
  let newRating2 = rating2 + K * ((1 - outcome) - P2);
  return {
      player1: { name: player1_name, old: rating1, new: Math.round(newRating1) },
      player2: { name: player2_name, old: rating2, new: Math.round(newRating2) }
  }
}

function getMatchHistoryForPlayer(identifier)
{
    try {
        const stmt = db.prepare(`
            SELECT * FROM match_history
            WHERE player_id = ? OR opponent_id = ? OR player_username = ? OR opponent_username = ?
            ORDER BY played_at DESC
          `);
        return stmt.all(identifier, identifier, identifier, identifier);
    }
    catch (err)
    {
        console.error('Error fetching matches:', err)
        return [];
    }
}

function getMatchHistoryForAgainstRival(player_identifier, rival_identifier) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM match_history
      WHERE (
        player_id = ? OR opponent_id = ? OR player_username = ? OR opponent_username = ?
      ) AND (
        player_id = ? OR opponent_id = ? OR player_username = ? OR opponent_username = ?
      )
      ORDER BY played_at DESC
    `);

    return stmt.all(
      player_identifier, player_identifier, player_identifier, player_identifier,
      rival_identifier, rival_identifier, rival_identifier, rival_identifier
    );
  } catch (err) {
    console.error('Error fetching matches against rival:', err);
    return [];
  }
}


export function calculateLongestWinStreak(player_id) {
  console.log("Calculating longest winstreak");
  const rows = getMatchHistoryForPlayer(player_id);
  let currentStreak = 0;
  let longestStreak = 0;
  rows.forEach((item) => {
    currentStreak = 0;
    if (item.result === 'win')
    {
      currentStreak += 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    }
    else
      currentStreak = 0;
  });
  return longestStreak;
}

export function calculateWinsAgainstRival(player_username, rival_username) {
  return getMatchHistoryForAgainstRival().filter(row => row.result === 'win').length;
}

export function calculateLossAgainstRival(player_username, rival_username) {
  return getMatchHistoryForAgainstRival().filter(row => row.result === 'loss').length;
}

export function calculateGamesPlayedAgainstRival(player_username, rival_username) {
  return getMatchHistoryForAgainstRival().length;
}

export function calculateGamesPlayed(player_id) {
    return getMatchHistoryForPlayer(player_id).length;
  }
  
export function calculateGamesWon(player_id) {
    return getMatchHistoryForPlayer(player_id).filter(row => row.result === 'win').length;
}

export function calculateGamesDraw(player_id) {
  return getMatchHistoryForPlayer(player_id).filter(row => row.result === 'draw').length;
}
  
export function calculateGamesLost(player_id) {
    return getMatchHistoryForPlayer(player_id).filter(row => row.result === 'loss').length;
}