import { useEffect, useState, ReactElement } from 'react';
import RivalIcon from '../assets/noun-battle-7526810.svg?react'
import { useUserContext } from '../context/UserContext';
import { fetchMatchData, fetchUsers } from '../utils/Fetch';
import { MatchData, FetchedUserData } from '../utils/Interfaces';
import { DEFAULT_AVATAR } from '../utils/constants';

export const MatchHistory = ({ player }: { player: string }) => {
    const [matchData, setMatchData] = useState<MatchData[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [profilePic1, setProfilePic1] = useState(null);
    const [profilePic2, setProfilePic2] = useState(null);
    const { user } = useUserContext();

    if (!user)
        return ;

    useEffect(() => {
        const loadMatchData = async () => {
            setLoading(true);
            const data = await fetchMatchData(player);
            setMatchData(data);
            setLoading(false);
        }
        loadMatchData();
    }, [player]);

    useEffect(() => {
        if (!user || !matchData)
            return ;

        const loadProfilePicURL = async () => {
            const allUsers = await fetchUsers(user?.accessToken);
            if (!allUsers)
                return ;

            matchData.map((match: MatchData) => {
                const player1 = allUsers.find((u: FetchedUserData) => u.username === match.player_username);
                if (player1)
                    setProfilePic1(player1.avatarUrl || DEFAULT_AVATAR);
				else
					setProfilePic1(DEFAULT_AVATAR);

                const player2 = allUsers.find((u: FetchedUserData) => u.username === match.opponent_username);
                if (player2)
                    setProfilePic2(player2.avatarUrl || DEFAULT_AVATAR);
				else
					setProfilePic2(DEFAULT_AVATAR);
            })
        }
        loadProfilePicURL();
    }, [matchData])
    

    if (loading)
        return <div className='flex justify-center my-5'>Loading...</div>

    if (!matchData || matchData.length === 0)
    {
        return (
            <div aria-label='empty match history' className='bg-[#FFEE8C] rounded-full text-center'>
             -
            </div>
    )};

    console.log(profilePic1);
    console.log(profilePic2);
    console.log('MATCH DATA');
    console.log(matchData);

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
                    const localTime = new Date(match.played_at).toLocaleString('en-GB', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                      timeZone: 'Europe/Helsinki',
                    });
                    return <li key={index} className='grid grid-cols-5 h-12 w-full mb-2 bg-[#FFEE8C] rounded-xl items-center text-center min-w-200'>
                        <span className='ml-3'>{localTime}</span>
                        <span className='col-span-2 grid grid-cols-[max-content_auto_auto_auto_max-content] truncate items-center justify-center gap-2'>
                            <span className='max-w-[50px]'>{match.player_username ? match.player_username : match.player_name} </span> 
                            <img src={profilePic1} className={` h-11 w-11 rounded-full object-cover border-4 flex-shrink-0 ${match.result === 'win' ? 'border-[#2E6F40]' : match.result === 'loss' ? 'border-[#CD1C18]' : 'border-black'}`} />
                            <span className='span-1'>vs</span>
                            <img src={profilePic2} className={` h-11 w-11 rounded-full object-cover border-4 flex-shrink-0 ${match.result === 'loss' ? 'border-[#2E6F40]' : match.result === 'win' ? 'border-[#CD1C18]' : 'border-black'}`} />
                            <span className={`max-w-[50px] ${match.opponent_id.includes('guest-') === true ? 'italic' : 'normal'}`}>{match.opponent_username ? match.opponent_username : match.opponent_name}</span>
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