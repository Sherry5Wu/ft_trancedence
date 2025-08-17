import { ReactElement } from "react";

export interface RivalData {
	rival_username: string,
	rival_elo_score?: number,
	games_played_against_rival?: number,
	wins_against_rival?: number, 
	losses_against_rival?: number,
	//picture: '../assets/profilepics/B2.png'
}

export interface SearchBarInputProps {
    type?: string;
    placeholder: string;
    value: string;
    options: string[];
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
    profilePic: ReactElement;
    email: string;
    score: number;
    rank: number;
    // firstName: string;
    // lastName: string;
    rivals: string[];
    accessToken: string;
    refreshToken: string;
};

export interface UserType {
    user: User | null;
    setUser: (user: User | null) => void;
};
