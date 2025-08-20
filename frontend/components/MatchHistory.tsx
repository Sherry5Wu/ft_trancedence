import { useEffect, useState, ReactElement } from 'react';
import RivalIcon from '../assets/noun-battle-7526810.svg?react'
import { useUserContext } from '../context/UserContext';
import { getMatchData, postMatchData } from '../utils/Fetch';
import { MatchData } from '../utils/Interfaces';

export const MatchHistory = (player: string) => {
    const [matchData, setMatchData] = useState<MatchData[] | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUserContext();

    if (!user)
        return ;

    useEffect(() => {
        setLoading(true);
        // postMatchData(user.accessToken); //FOR TESTING REMOVE LATER
        getMatchData(player).then((data) => {
            setMatchData(data);
            setLoading(false);
    });
    }, [user.accessToken, player]);

    if (loading)
        return <div className='flex justify-center my-5'>Loading...</div>

    if (matchData?.length === 0)
    {
        return (
            <div aria-label='empty match history' className='bg-[#FFEE8C] rounded-full text-center'>
             -
            </div>
    )};

    return (
        <div aria-label='match history' className=''>
            <div aria-label='match history categories' className='grid grid-cols-5 mb-1 text-center'>
                <span className=''>Date/Time</span>
                <span className='col-span-2'>Players</span>
                <span className=''>Score</span>
                <span className=''>Duration</span>
             </div>

            <ul aria-label='match history rows' className=''>
                {matchData.map((match: MatchData, index: number) => {
                    const localTime = new Date(match.played_at).toLocaleString('fi-FI', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone: 'Europe/Helsinki',
                    });
                    return <li key={index} className='grid grid-cols-5 h-12 w-full mb-2 bg-[#FFEE8C] rounded-xl items-center text-center'>
                        <span className='ml-3'>{localTime}</span>
                        <span className='col-span-2 truncate flex items-center justify-center gap-2'>
                            <span className=''>{match.player_username ? match.player_username : match.player_name} </span> 
                            <img src={match.player1pic} className={`h-11 w-11 rounded-full object-cover border-4 ${match.result === 'win' ? 'border-[#2E6F40]' : match.result === 'loss' ? 'border-[#CD1C18]' : 'border-black'}`} />
                            <span>vs</span>
                            <img src={match.player2pic} className={`h-11 w-11 rounded-full object-cover border-4 ${match.result === 'loss' ? 'border-[#2E6F40]' : match.result === 'win' ? 'border-[#CD1C18]' : 'border-black'}`} />
                            <span className=''>{match.opponent_username ? match.opponent_username : match.opponent_name}</span>
                        </span> 
                        <span className=''>{match.player_score} - {match.opponent_score}</span>
                        <span className=''>{match.duration}</span>
                    </li>
                })}

            </ul>
        </div>
    );
};

//  <span className={`${match.player2 === match.winner ? 'border-b-3' : ''}`}>{match.player2}</span>