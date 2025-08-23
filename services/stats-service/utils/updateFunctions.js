// Päivitä kaikkien käyttäjien rank elo_score:n mukaan
export function updateAllUserRanks() {
  try {
    // Hae kaikki käyttäjät järjestyksessä elo_score DESC
    const rows = db.prepare('SELECT player_id FROM user_match_data ORDER BY elo_score DESC').all();
    let rank = 1;
    for (const row of rows) {
      db.prepare('UPDATE user_match_data SET rank = ? WHERE player_id = ?').run(rank, row.player_id);
      rank++;
    }
    console.log('✅ Kaikkien käyttäjien rankit päivitetty.');
  } catch (err) {
    console.error('Error updating user ranks:', err);
  }
}
import { db } from '../db/init.js';
export function updateScoreHistoryTable(player_id, elo_score, played_at, username)
{
  try
  {
    console.log("Inserting into score_history:", player_id, elo_score, played_at, username); 
    const stmt = db.prepare(`
        INSERT INTO score_history (player_username, player_id, elo_score, played_at)
        VALUES (?, ?, ?, ?)
      `);
    stmt.run(username, player_id, elo_score, played_at);
  }
  catch(err)
  {
    console.log('Error updating score history table:', err);
  }
}

export function updateRivalsDataTable(player_username, rival_username, games_played_against_rival, wins_against_rival, loss_against_rival, rival_elo_score) {
  try {
    const updateStmt = db.prepare(`
      UPDATE rivals
      SET games_played_against_rival = ?,
          wins_against_rival = ?,
          loss_against_rival = ?,
          rival_elo_score = ?,
      WHERE player_username = ? AND rival_username = ?
    `);
    updateStmt.run(games_played_against_rival, wins_against_rival, loss_against_rival, rival_elo_score, player_username, rival_username);
    console.log(`✅ Updated rivals for player: ${player_username}`);
  }
  catch (err) {
    console.log('Error updating rivals table:', err);
  }
}

export function updateUserMatchDataTable(playerId, newScore, playerName, gamesPlayed, gamesLost, gamesWon, longestWinStreak, gamesDraw, username, winstreak) {
  try 
  {
    const insertStmt = db.prepare(`
        INSERT INTO user_match_data (player_username, player_id, player_name, elo_score, games_played, games_lost, games_won, longest_win_streak, games_draw, win_streak)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(player_id) DO UPDATE SET
        player_name = excluded.player_name,
        elo_score = excluded.elo_score,
        games_played = excluded.games_played,
        games_lost = excluded.games_lost,
        games_won = excluded.games_won,
        games_draw = excluded.games_draw,
        longest_win_streak = excluded.longest_win_streak,
        player_username = excluded.player_username,
        win_streak = excluded.win_streak
      `);
      insertStmt.run(username, playerId, playerName, Math.round(newScore), gamesPlayed, gamesLost, gamesWon, longestWinStreak, gamesDraw, winstreak);
      // Päivitä kaikkien käyttäjien rankit aina kun joku muuttuu
      updateAllUserRanks();
      console.log(`\u2705 Updated or created player: ${playerId} (${playerName})`);
  } 
  catch(err) {
    console.log('Error updating user match data table:', err);
  }
}