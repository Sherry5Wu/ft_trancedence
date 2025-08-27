import { ReactElement } from "react";

export interface MenuItemProps {
    Icon?: ReactElement;
    label?: string;
    Button?: (isOn: boolean) => ReactElement;
    onClick?: () => void;
    className?: string;
    variant?: string;
}

export interface MenuProps {
    'aria-label': string;
    Icon: ReactElement;
    label?: string;
    elements?: MenuItemProps[];
    className: string;
    onClick?: () => void;
    variant?: string;
}

export interface UserProfileData {
  username: string;
  email: string;
  password: string;
  pinCode: string;
}

export interface UserGoogleProfileData {
  idToken: string;
  username: string;
  pinCode: string;
}

export interface LoginData {
  identifier: string,
  password: string
}

export interface RegisteredPlayerData {
  username: string,
  pinCode: string
}

export interface MatchData {
    played_at: string,
    player_name: string,
    player_username: string,
    opponent_name: string,
    opponent_username: string,
    opponent_id: string,
    player_score: number,
    opponent_score: number,
    result: string,
    duration: number,
}

export interface RivalData {
	rival_username: string,
	rival_elo_score?: number,
	games_played_against_rival?: number,
	wins_against_rival?: number, 
	loss_against_rival?: number,
	picture?: string,
}

export interface FetchedUserData {
    username: string;
    avatarUrl: string | null;
}

export interface SearchBarInputProps {
    type?: string;
    placeholder: string;
    value: string;
    options: FetchedUserData[];
    onFilled: (value: string) => void;
    onSelect: (value: string) => void;
    className?: string;
    isOpen?: boolean;
}

export interface LeaderboardStats {
    userInfo: FetchedUserData,
    stats: UserStats,
}

export interface UserStats {
    games_played: number;
    win_streak: number;
    longest_win_streak: number;
    // worstRival: string;
    games_draw: number;
    games_lost: number;
    games_won: number;
	elo_score: number;
	rank: number;
    // worstRivalPic: string;
}

export interface ScoreHistory {
    id: number,
    elo_score: number,
}

export interface User {
    username: string;
    id: string;
    profilePic: string;
    score: number;
    rank: number;
    rivals: RivalData[];
    accessToken: string | null;
    expiry: number;
    twoFA: boolean;
    googleUser: boolean;
}

export interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    refresh: () => Promise<string | null>;
	logOut: () => void;
	refreshDone: boolean;
	tokenReceived: boolean;
	setTokenReceived: ((value: boolean) => void);
}

export interface Players {
  id: string;
  username: string;
  photo: string;
}

export interface PlayersContextType {
  players: Players[];
  tournamentTitle?: string;
  totalPlayers?: number;

  isTournament: boolean;
  setIsTournament: (v: boolean) => void;

  setTitle: (newTitle: string) => void;
  setTotalPlayers: (n: number) => void;

  addPlayer: (player: Players) => void;
  setPlayer: (index: number, player: Players) => void;
  removePlayer: (id: string) => void;
  setPlayerUsername: (id: string, newUsername: string) => void;

  resetPlayers: () => void;
  resetPlayerListOnly: () => void;
}

export interface GoogleCompleteResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    avatarUrl: string;
  };
  TwoFAStatus: boolean;
  registerFromGoogle: boolean;
}

export interface VerifyPinResponse {
  success: boolean;
  code: "PIN_MATCHES" | "PIN_NOT_MATCH" | "USER_NOT_FOUND" | "TOO_MANY_ATTEMPTS";
  message: string;
  data?: { userId: string };
}

export type Result = 'win' | 'loss' | 'draw';

export interface TournamentHistoryRow {
  tournament_id: string;
  stage_number: number;
  match_number: number;
  player_name: string;
  opponent_name: string;
  result: Result;
  played_at: string;
}

export type UITournament = {
  id: string;
  date: string;
  totalPlayers: number;
  winner?: string | null;
  matches: TournamentHistoryRow[];
};

export interface DropDownButtonProps {
	label: string;
	options: string[];
	onSelect: (value: string) => void;
	className?: string;
	disabled?: boolean;
	selected?: string;
	onToggle?: (value: boolean) => void;
}

export interface AliasField {
	value: string;
	error: string;
	touched: boolean;
}

export interface TournamentHistoryRow {
  stage_number: number; // 1 = final, 2 = semifinal, 3 = quarterfinal...
  match_number: number;
  player_name: string | null;
  opponent_name: string | null;
  result: Result;
}

export interface ModularBracketViewerProps {
  matches: TournamentHistoryRow[];
  totalPlayers?: number;
  roundGap?: number;
  matchGap?: number;
}

export interface ProfileMeResponse {
  id: string;
  username: string;
  avatarUrl: string;
  TwoFAStatus: boolean;
  registerFromGoogle: boolean;
}