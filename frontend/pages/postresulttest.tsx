const API_BASE = 'https://localhost:8443';

type StatsPayload = {
  player_score: number;
  opponent_score: number;
  duration: string;              // "HH:MM:SS"
  opponent_id: string;           // "guest" or user id
  player_name: string;           // logged-in user’s username
  opponent_name: string;         // opponent display name
  result: 'win' | 'loss' | 'draw';
  opponent_username: string;     // keep both name+username
  played_at: string;             // ISO start timestamp
};

type TournamentPayload = {
  tournament_id: string;         // PlayersContext.tournamentTitle
  stage_number: number;          // roundNum
  match_number: number;          // matchIdx + 1
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

export async function postMatchHistory(payload: StatsPayload, token?: string) {
  const res = await fetch(`${API_BASE}/stats/match_history`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
    // in browser you cannot bypass TLS warnings, accept the cert in the UI
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`POST /stats/match_history ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export async function postTournamentHistory(payload: TournamentPayload, token?: string) {
  const res = await fetch(`${API_BASE}/tournament/tournament_history`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`POST /tournament/tournament_history ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export function formatHMS(totalMs: number) {
  const totalSec = Math.max(0, Math.floor(totalMs / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
