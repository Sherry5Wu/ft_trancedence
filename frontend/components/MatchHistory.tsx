import { useEffect, ReactElement } from 'react';

interface MatchData {
    matchIndex: number,
    date: number,
    time: number,
    duration: number,
    player1: string,
    player2: string, 
    player1score: number,
    player2score: number,
    player1pic: ReactElement,
    player2pic: ReactElement,
    winner: string
}

export const MatchHistory = ( { matchIndex, player1 }:  { matchIndex: number, player1: string } ) => {

    // MOCKUP DATA
    player1 = "User";
    player2 = "Rival";
    date = 1;
    time = 2;
    duration = 3;
    player1score = 1;
    player2score = 2;
    winner = player1;

    return (
        <div className='h-10 w-100 bg-[#FFEE8C] rounded-full'>
            
        </div>
    );
};