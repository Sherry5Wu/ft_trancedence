import { useEffect, useState, ReactElement } from 'react';
import RivalIcon from '../assets/noun-battle-7526810.svg?react'
import { useUserContext } from '../context/UserContext';
import { fetchMatchData, fetchUsers } from '../utils/Fetch';
import { MatchData, FetchedUserData, User } from '../utils/Interfaces';
import { DEFAULT_AVATAR } from '../utils/constants';

const MatchRows = ({match, users}: {match: MatchData, users: FetchedUserData[]}) => {
    const [avatar1, setAvatar1] = useState('');
    const [avatar2, setAvatar2] = useState('');

    useEffect(() => {
        const loadAvatarURL = async () => {
            const player1 = users.find((u: FetchedUserData) => u.username === match.player_username);
            player1 && player1.avatarUrl ? setAvatar1(player1.avatarUrl) : setAvatar1(DEFAULT_AVATAR);

            const player2 = users.find((u: FetchedUserData) => u.username === match.opponent_username);
            player2 && player2.avatarUrl ? setAvatar2(player2.avatarUrl) : setAvatar2(DEFAULT_AVATAR);
        }    
        loadAvatarURL();
    }, []);

    console.log("AVATARS:");
    console.log(avatar1);
    console.log(avatar2);

    const localTime = new Date(match.played_at).toLocaleString('en-GB', {
                dateStyle: 'short',
                timeStyle: 'short',
                timeZone: 'Europe/Helsinki',
            });

    return (
        <>
            <span className='ml-3'>{localTime}</span>
            <span className='col-span-2 grid grid-cols-[max-content_auto_auto_auto_max-content] truncate items-center justify-center gap-2'>
            <span className='max-w-[50px]'>{match.player_username ? match.player_username : match.player_name} </span> 
                <img src={avatar1} className={` h-11 w-11 rounded-full object-cover border-4 flex-shrink-0 ${match.result === 'win' ? 'border-[#2E6F40]' : match.result === 'loss' ? 'border-[#CD1C18]' : 'border-black'}`} />
                <span className=''>vs</span>
                <img src={avatar2} className={` h-11 w-11 rounded-full object-cover border-4 flex-shrink-0 ${match.result === 'loss' ? 'border-[#2E6F40]' : match.result === 'win' ? 'border-[#CD1C18]' : 'border-black'}`} />
                <span className={`max-w-[50px] ${match.opponent_id.includes('guest-') === true ? 'italic' : 'normal'}`}>{match.opponent_username ? match.opponent_username : match.opponent_name}</span>
            </span> 
            <span className=''>{match.player_score} - {match.opponent_score}</span>
            <span className=''>{match.duration}</span>
        </>
    );
}

export const MatchHistory = ({ player }: { player: string }) => {
    const [matchData, setMatchData] = useState<MatchData[] | null>(null);
    const [allUsers, setAllUsers] = useState<FetchedUserData[]>([]);
    const [loading, setLoading] = useState(true);
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
    }, []);

    useEffect(() => {
        if (!user)
            return ;

        const getPlayers = async () => {
            const users = await fetchUsers(user?.accessToken);
            setAllUsers(users);
        }
        getPlayers();
    }, [])
    
    if (loading)
        return <div className='flex justify-center my-5'>Loading...</div>

    if (!matchData || matchData.length === 0) {
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
                    return (
                    <li key={index} className='grid grid-cols-5 h-12 w-full mb-2 bg-[#FFEE8C] rounded-xl items-center text-center min-w-200'>
                        <MatchRows match={match} users={allUsers}/>
                    </li>
                    )
                })}

            </ul>
        </div>
    );
};