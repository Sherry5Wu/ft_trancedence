import { db } from '../db/init.js';
export function updateScoreHistoryTable(player_id, elo_score, played_at)
{
  try
  {
    console.log("Inserting into score_history:", player_id, elo_score, played_at); 
    const stmt = db.prepare(`
        INSERT INTO score_history (player_id, elo_score, played_at)
        VALUES (?, ?, ?)
      `);
    stmt.run(player_id, elo_score, played_at);
  }
  catch(err)
  {
    console.log('Error updating score history table:', err);
  }
}

export function updateUserMatchDataTable(playerId, newScore, playerName, gamesPlayed, gamesLost, gamesWon, longestWinStreak, gamesDraw) {
  try 
  {
    const insertStmt = db.prepare(`
        INSERT INTO user_match_data (player_id, player_name, elo_score, games_played, games_lost, games_won, longest_win_streak, games_draw)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(player_id) DO UPDATE SET
        player_name = excluded.player_name,
        elo_score = excluded.elo_score,
        games_played = excluded.games_played,
        games_lost = excluded.games_lost,
        games_won = excluded.games_won,
        games_draw = excluded.games_draw,
        longest_win_streak = excluded.longest_win_streak
      `);
      insertStmt.run(playerId, playerName, Math.round(newScore), gamesPlayed, gamesLost, gamesWon, longestWinStreak, gamesDraw);
      console.log(`✅ Updated or created player: ${playerId} (${playerName})`);
  } 
  catch(err) {
    console.log('Error updating user match data table:', err);
  }
}