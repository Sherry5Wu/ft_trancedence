// API Types for Frontend
// Generated from backend tournament service

export interface TournamentMatch {
  id?: number;
  tournament_id: string;
  stage_number: number;
  match_number: number;
  player_name: string;
  opponent_name: string;
  result: 'win' | 'loss' | 'draw';
  played_at?: string;
}

export interface ApiError {
  error: string;
}

// API Client example
export class TournamentAPI {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://localhost:8443/stats') {
    this.baseUrl = baseUrl;
  }

  async getAllTournamentHistory(): Promise<TournamentMatch[]> {
    const response = await fetch(`${this.baseUrl}/tournament_history`);
    if (!response.ok) throw new Error('Failed to fetch tournament history');
    return response.json();
  }

  async getTournamentHistory(tournamentId: string): Promise<TournamentMatch[]> {
    const response = await fetch(`${this.baseUrl}/tournament_history/${tournamentId}`);
    if (!response.ok) throw new Error('Tournament not found');
    return response.json();
  }

  async addMatch(match: Omit<TournamentMatch, 'id' | 'played_at'>): Promise<TournamentMatch> {
    const response = await fetch(`${this.baseUrl}/tournament_history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(match)
    });
    if (!response.ok) throw new Error('Failed to add match');
    return response.json();
  }
}
