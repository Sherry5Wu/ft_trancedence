import { useEffect, useState, ReactElement } from 'react';
import { useUserContext } from '../context/UserContext';
import { fetchMatchData, fetchUsers } from '../utils/Fetch';
import { MatchData, FetchedUserData, User } from '../utils/Interfaces';
import { DEFAULT_AVATAR } from '../utils/constants';
import { useRequestNewToken } from '../utils/Hooks';
import { useTranslation } from 'react-i18next';

const MatchRows = ({match, users}: {match: MatchData, users: FetchedUserData[]}) => {
    const [avatar1, setAvatar1] = useState(DEFAULT_AVATAR);
    const [avatar2, setAvatar2] = useState(DEFAULT_AVATAR);

    useEffect(() => {
        const loadAvatarURL = async () => {
            const player1 = users.find((u: FetchedUserData) => u.username === match.player_username);
            player1 && player1.avatarUrl ? setAvatar1(player1.avatarUrl) : setAvatar1(DEFAULT_AVATAR);


			const player2 = users.find((u: FetchedUserData) => u.username === match.opponent_username);
			player2 && player2.avatarUrl && match.is_guest_opponent === 0 ? setAvatar2(player2.avatarUrl) : setAvatar2(DEFAULT_AVATAR);
			
        }    
        loadAvatarURL();
    }, [match, users]);

    const localTime = new Date(match.played_at).toLocaleString('en-GB', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'Europe/Helsinki',
    });

    return (
        <>
            <span className='ml-3'>{localTime}</span>
            <span className='col-span-2 grid grid-cols-[max-content_auto_auto_auto_max-content] items-center justify-center gap-2'>
				<span className='w-24 truncate'>{match.player_name ? match.player_name : match.player_username} </span> 
				<img src={avatar1} className={`profilePicSmall !border-4 flex-shrink-0 ${match.result === 'win' ? 'border-[#2E6F40]' : match.result === 'loss' ? 'border-[#CD1C18]' : 'border-black'}`} />
				<span className=''>vs</span>
				<img src={avatar2} className={`profilePicSmall !border-4 flex-shrink-0 ${match.result === 'loss' ? 'border-[#2E6F40]' : match.result === 'win' ? 'border-[#CD1C18]' : 'border-black'}`} />
				<span className={`w-24 truncate ${match.is_guest_opponent === 1 ? 'italic' : 'normal'}`}>{match.opponent_name ? match.opponent_name : match.opponent_username}</span>
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
    const { user, refresh } = useUserContext();
	const requestNewToken = useRequestNewToken();
	const { t } = useTranslation();

    useEffect(() => {
        if (!user) 
            refresh();
    }, [user]);

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
        const getPlayers = async () => {
			const token = await requestNewToken();
			if (!user || !token)
				return ;
            const users = await fetchUsers(token);
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
                <span className=''>{t('pages.homeUser.labels.date/time')}</span>
                <span className='col-span-2'>{t('pages.homeUser.labels.players')}</span>
                <span className=''>{t('pages.homeUser.labels.score')}</span>
                <span className=''>{t('pages.homeUser.labels.duration')}</span>
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