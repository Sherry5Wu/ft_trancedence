import { useEffect, ReactElement } from 'react';
import { useUserContext } from '../context/UserContext';
import { RivalIcon } from '../assets/noun-battle-7526810.svg?react'

interface MatchData {
    matchIndex: number,
    date: number,
    duration: number,
    player1: string,
    player2: string, 
    player1score: number,
    player2score: number,
    winner: string,
}


export const MatchHistory = ( { player1 }:  { player1: string | undefined } ) => {

    const { user } = useUserContext();
    // FETCH MATCH HISTORY FROM PLAYER 1

    // MOCKUP DATA
        player1 = user?.username;
        const player2 = "Rival";
        const rawDate = new Date('2025-07-13 18:08');
        const formatDate = rawDate.toLocaleString('en-GB');
        const duration = 3;
        const player1score = 2;
        const player2score = 1;
        const winner = player1;
        const player1pic = <img src='../assets/profilepics/Bluey.png' className='profilePicSmall' />;
        const player2pic = <img src='../assets/profilepics/B2.png' className='profilePicSmall' />;

    return (
        <div aria-label='match history' className=''>
            <div aria-label='match history categories' className='grid grid-cols-4 text-center'>
                <span className=''>Date/Time</span>
                <span className='col-span-[1.5]'>Players</span>
                <span className=''>Score</span>
                <span className=''>Duration</span>
             </div>

            <ul aria-label='match history rows' className='grid grid-cols-4 h-12 w-full bg-[#FFEE8C] rounded-full items-center text-center'>


            </ul>
            <div className='grid grid-cols-4 h-12 w-full bg-[#FFEE8C] rounded-full items-center text-center'>
               <span className='flex-1'>{formatDate}</span>
               <span className='flex-1'>{player1} {player1pic} vs {player2pic} {player2} </span>
               <span className='flex-1'>{player1score} - {player2score}</span>
               <span className='flex-1'>{duration}</span>
            </div>

        </div>
    );
};


            // <div className='grid grid-cols-4 h-12 w-full bg-[#FFEE8C] rounded-full items-center text-center'>
            //    <span className='flex-1'>{formatDate}</span>
            //    <span className='flex-1'>{player1} {player1pic} vs {player2pic} {player2} </span>
            //    <span className='flex-1'>{player1score} - {player2score}</span>
            //    <span className='flex-1'>{duration}</span>
            // </div>