import { useEffect, useState, ReactElement } from 'react';
import RivalIcon from '../assets/noun-battle-7526810.svg?react'
import { useUserContext } from '../context/UserContext';

interface MatchData {
    played_at: string,
    player_name: string,
    opponent_name: string, 
    opponent_id: string,
    player_score: number,
    opponent_score: number,
    result: string,
    duration: number,
}

const postMatchData = async (accessToken: string) => {

    console.log(accessToken);
    const matchData: MatchData = 
        {
            player_name: 'User',
            opponent_name: 'Rival1',
            played_at: new Date('2025-07-13 18:08').toLocaleString('en-GB'),
            duration: 300,
            player_score: 2,
            opponent_score: 1,
            opponent_id: '1',
            result: 'win',
        }

    try {
        const response = await fetch(`http://localhost:8443/stats/match_history/`, {
        method: 'POST',
        headers: {
        "Authorization": `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(matchData)
    });

        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);

        return await response.json();
    }

    catch (error) {
        console.error('Error: ', error);
            return null;
    }
};

const getMatchData = async (userID: string): Promise<MatchData | null> => {
    try {
        const response = await fetch(`http://localhost:8443/stats/match_history/${userID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);

        const matchData = await response.json();
        return matchData;
    }

    catch (error) {
        console.error('Error: ', error);
            return null;
    }
};


export const MatchHistory = () => {
    const [matchData, setMatchData] = useState<MatchData | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUserContext();

    useEffect(() => {
        setLoading(true);
        postMatchData(user.accessToken); //FOR TESTING REMOVE LATER
        getMatchData(user.id).then((data) => {
            setMatchData(data);
            setLoading(false);
    });
    }, [user.accessToken, user.id]);

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