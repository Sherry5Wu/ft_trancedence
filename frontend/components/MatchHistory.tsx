import { useEffect, useState, ReactElement } from 'react';
import { useUserContext } from '../context/UserContext';
import RivalIcon from '../assets/noun-battle-7526810.svg?react'

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

const fetchMatchData = async (userID: string | undefined): Promise<MatchData | null> => {
    // FETCH MATCH HISTORY FROM PLAYER 1

    // MOCKUP DATA FOR TESTING
    // let matchData = [
    //     {
    //         player1: user,
    //         player2: 'Rival1',
    //         date: new Date('2025-07-13 18:08').toLocaleString('en-GB'),
    //         duration: 300,
    //         player1score: 2,
    //         player2score: 1,
    //         winner: user,
    //         player1pic: '../assets/profilepics/Bluey.png',
    //         player2pic: '../assets/profilepics/B2.png'
    //     },
    //     {
    //         player1: user,
    //         player2: 'Rival2',
    //         date: new Date('2025-07-15 15:05').toLocaleString('en-GB'),
    //         duration: 300,
    //         player1score: 2,
    //         player2score: 5,
    //         winner: 'Rival2',
    //         player1pic: '../assets/profilepics/Bluey.png',
    //         player2pic: '../assets/profilepics/image.jpg'
    //     },
    // ];
    // matchData = [];
    // return matchData;

    try {
        const response = await fetch(`http://localhost:8443/stats/match_history/${userID}`);

        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);

        const matchData: MatchData = await response.json();
            return matchData;
    }

    catch (error) {
        console.error('Error: ', error);
            return null;
    }
};


export const MatchHistory = ( userID: string ) => {

    const [matchData, setMatchData] = useState<MatchData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    setLoading(true);
    fetchMatchData(userID).then((data) => {
        setMatchData(data);
        setLoading(false);
    });
    }, [userID]);

    if (loading)
        return <div className='flex justify-center my-5'>Loading...</div>

    if (!matchData)
    {
        return (
            <div aria-label='empty match history' className='bg-[#FFEE8C] rounded-full text-center'>
             -
            </div>
    )};
    

    // FETCH MATCH HISTORY FROM PLAYER 1
    // const matchData = fetchMatchData(user?.username);

    // if (matchData.length  === 0)
    //     return (
    //         <div aria-label='empty match history' className='bg-[#FFEE8C] rounded-full text-center'>
    //         -
    //         </div>
    // );

    return (
        <div aria-label='match history' className=''>
            <div aria-label='match history categories' className='grid grid-cols-5 mb-1 text-center'>
                <span className=''>Date/Time</span>
                <span className='col-span-2'>Players</span>
                <span className=''>Score</span>
                <span className=''>Duration</span>
             </div>

            <ul aria-label='match history rows' className=''>
                {matchData.map((match, index: number) => {
                    return <li key={index} className='grid grid-cols-5 h-12 w-full mb-2 bg-[#FFEE8C] rounded-xl items-center text-center'>
                        <span className='ml-3'>{match.date}</span>
                        <span className='col-span-2 truncate flex items-center justify-center gap-2'>
                            <span className=''>{match.player1} </span> 
                            <img src={match.player1pic} className={`h-11 w-11 rounded-full object-cover border-4 ${match.player1 === match.winner ? 'border-[#2E6F40]' : 'border-[#CD1C18]'}`} />
                            <span>vs</span>
                            <img src={match.player2pic} className={`h-11 w-11 rounded-full object-cover border-4 ${match.player2 === match.winner ? 'border-[#2E6F40]' : 'border-[#CD1C18]'}`} />
                            <span className=''>{match.player2}</span>
                        </span> 
                        <span className=''>{match.player1score} - {match.player2score}</span>
                        <span className=''>{match.duration}</span>
                    </li>
                })}

            </ul>
        </div>
    );
};

//  <span className={`${match.player2 === match.winner ? 'border-b-3' : ''}`}>{match.player2}</span>