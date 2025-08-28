const API_BASE = 'https://localhost:8443';

export type StatsPayload = {
  player_id?: string | null;
  player_username: string;
  player_name: string;
  opponent_id?: string | null;
  opponent_username: string;
  opponent_name: string;
  player_score: number;
  opponent_score: number;
  duration: string;
  result: 'win' | 'loss' | 'draw';
  is_guest_opponent: 0 | 1;
  played_at: string;
};

export type TournamentPayload = {
  tournament_id: string;
  stage_number: number;
  match_number: number;
  player_name: string;
  opponent_name: string;
  result: 'win' | 'loss' | 'draw';
};

function authHeaders(token?: string) {
  // If token is undefined, omit Authorization
  const base: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) base['Authorization'] = `Bearer ${token}`;
  return base;
}

export async function postMatchHistoryBulk(matches: StatsPayload[], token?: string) {
  const res = await fetch(`${API_BASE}/stats/match_history/update_all`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ matches }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`POST /stats/match_history/update_all ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export async function postTournamentHistory(entries: TournamentPayload[], token?: string) {
  const res = await fetch(`${API_BASE}/tournament_history/update_all`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ entries }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`POST /tournament_history/update_all ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}
