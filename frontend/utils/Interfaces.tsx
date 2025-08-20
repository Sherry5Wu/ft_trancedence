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

export interface LoginData {
  identifier: string,
  password: string
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
	//picture: '../assets/profilepics/B2.png'
}

export interface FetchedUserData {
    username: string;
    avatar: string | null;
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

export interface UserStats {
    games_played: number;
    win_streak: number;
    longest_win_streak: number;
    worstRival: string;
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
    email: string;
    score: number;
    rank: number;
    // firstName: string;
    // lastName: string;
    rivals: RivalData[];
    // playedGames: boolean;
    accessToken: string;
    refreshToken: string;
    googleIdToken?: string;
}

export interface UserType {
    user: User | null;
    setUser: (user: User | null) => void;
}