import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GenericButton } from '../components/GenericButton';
import { MatchHistory } from '../components/MatchHistory';
import { useUserContext } from '../context/UserContext';
import { Stats } from '../components/Stats';
import { fetchUserStats, fetchScoreHistory, addRival, removeRival, fetchUsers } from '../utils/Fetch';
import { UserStats, ScoreHistory, FetchedUserData } from '../utils/Interfaces';
import { useRequestNewToken } from '../utils/Hooks';
import PlayIcon from '../assets/icons/ping-pong-icon.svg';
import TournamentIcon from '../assets/icons/tournament-icon.svg';
import RivalsIcon from '../assets/icons/rivals-icon.svg';
import LeaderboardIcon from '../assets/icons/leaderboard-icon-v2.svg';
import DownArrow from '../assets/icons/symbols/arrow-down-icon.svg?react';
import { DEFAULT_AVATAR } from '../utils/constants';
import { useTranslation } from 'react-i18next';

const UserPage = () => {
	const { user, setUser } = useUserContext();
	const [stats, setStats] = useState(false);
	const [history, setHistory] = useState(false);
	const [userStats, setUserStats] = useState<UserStats | null>(null);
	const [scoreHistory, setScoreHistory] = useState<ScoreHistory[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [profilePicURL, setProfilePicURL] = useState('');
	const param = useParams();
	const navigate = useNavigate();
	const showStats = () => setStats(!stats);
	const showHistory = () => setHistory(!history);
	const requestNewToken = useRequestNewToken();
	const { t } = useTranslation();
	let token = user?.accessToken;

	useEffect(() => {
		if (!user)
			navigate('/signin');

		const loadProfilePicURL = async () => {
			try {
        		token = await requestNewToken();
				if (!token)
					return ;
				const allUsers = await fetchUsers(token);
				if (!allUsers)
					return ;
				const pageOwner = allUsers.find((u: FetchedUserData) => u.username === param.username);
				if (pageOwner)
					setProfilePicURL(pageOwner.avatarUrl ?? '');
				else
                    navigate('./notfound');
			}
			catch(error) {
				console.error('Error: ' + error);
				return null;
			}
		}
		loadProfilePicURL();
	}, [param.username, user?.profilePic, user])

	useEffect(() => {
		const loadStats = async () => {
			try {
				if (!param.username)
					return ;

				setLoading(true);

				const statPromise = fetchUserStats(param.username);
				const scorePromise = fetchScoreHistory(param.username);

				const stats = await statPromise;
				const score = await scorePromise;

				setUserStats(stats);
				setScoreHistory(score);
				setLoading(false);
				setStats(false);
				setHistory(false);
			}
			catch(error) {
				console.error('Error: ', error);
				return null;
			}
		}
		loadStats();
	}, [user, param.username]);

	if (loading)
		return <div className='flex justify-center'>{t('common.loading')}</div>;

	const isRival = user?.rivals.some(r => r.rival_username === param.username);

	return (
		<div className='pageLayout'>
		
		{/* User header */}

		<div className='profilePicBig'>
			{profilePicURL ? 
				<img src={profilePicURL} className='profilePic'/> : <img src={DEFAULT_AVATAR} className='w-full h-full object-cover'/>}
		</div>

		<div className='w-80 truncate'>
			<h2 className='h2 text-center mb-3 font-semibold scale-dynamic'>{param.username} </h2>
		</div>
		{userStats && userStats.games_played > 0 && (
			<div className='w-50 mb-12'>
				<div className='flex justify-between'>
					<h4 className='h4 ml-2 scale-dynamic'>{t('pages.homeUser.labels.score')}</h4>
					<h4 className='h4 mr-2 scale-dynamic text-right font-semibold'>{userStats ? userStats.elo_score : 0}</h4>
				</div>
				<div className='flex justify-between'>
					<h4 className='h4 ml-2 scale-dynamic'>{t('pages.homeUser.labels.rank')}</h4>
					<h4 className='h4 mr-2 scale-dynamic text-right font-semibold'>#{userStats ? userStats.rank : '-'}</h4>
				</div>
			</div>)}

		{/* Buttons */}

		{param.username === user?.username ? 

		<div className="flex flex-wrap justify-center gap-6">
			<GenericButton
			className="round-icon-button"
			text={undefined}
			icon={<img src={PlayIcon} alt="Play icon" />}
			hoverLabel={t('common.buttons.play')}
			onClick={() => 
				navigate('/choose-players')}
			/>
			<GenericButton
			className="round-icon-button"
			text={undefined}
			icon={<img src={TournamentIcon} alt="Tournament icon" />}
			hoverLabel={t('common.buttons.tournament')}
			onClick={() => 
				navigate('/tournaments')}
			/>
			<GenericButton
			className="round-icon-button"
			text={undefined}
			icon={<img src={RivalsIcon} alt="Rivals icon" />}
			hoverLabel={t('common.buttons.rivals')}
			onClick={() => 
				navigate('/rivals')}
			/>
			<GenericButton
			className="round-icon-button"
			text={undefined}
			icon={<img src={LeaderboardIcon} alt="Leaderboard icon" />}
			hoverLabel={t('common.buttons.leaderboard')}
			onClick={() => 
				navigate('/leaderboard')}
			/>
		</div>

		:
		
		isRival ?

		<GenericButton
		className="round-icon-button"
		text={undefined}
		icon={<img src={RivalsIcon} alt="Rivals icon" />}
		hoverLabel={t('pages.homeUser.labels.removeFromRivals')}
		onClick={() => {
			if (user && param.username)
			{
				removeRival(param.username, token);
				setUser({
					...user, 
					rivals: user?.rivals.filter(r => r.rival_username !== param.username)});
			}}} />
	
		:

		<GenericButton
		className="transparent-round-icon-button"
		text={undefined}
		icon={<img src={RivalsIcon} alt="Rivals icon" />}
		hoverLabel={t('pages.homeUser.labels.addToRivals')}
		onClick={() => {
			if (user && param.username)
			{
				addRival(param.username, token);
				setUser({
					...user, 
					rivals: [...user.rivals, 
						{rival_username: param.username}]});
			};
		}} />
		}

		{/* Statistics */}
		
			<div aria-label='statistics' className='w-200'>
			<div className='flex justify-center items-center ml-5'>
				<button onClick={showStats} className='flex scale-90 group hover:cursor-pointer transition-all ease-in-out hover:scale-93'>
				<h3 className='h3 border-b-3 border-transparent pt-5 text-center font-semibold group-hover:border-black transition ease-in-out duration-100'>{t('pages.homeUser.labels.stats')}</h3>
				<div className={`size-6 translate-y-6 translate-x-2 transition ease-in-out duration-300 ${stats ? '-rotate-180' : 'rotate-0'}`}>
					<DownArrow className='' />
				</div>
				</button>
			</div>
			{stats && (<Stats userStats={userStats} scoreHistory={scoreHistory} />)}
			</div>

			<div aria-label='match history' className=''>
				<div className='flex justify-center items-center ml-5 mb-5'>
				<button onClick={showHistory} className='flex scale-90 group hover:cursor-pointer transition-all ease-in-out hover:scale-93'>
					<h3 className='h3 border-b-3 border-transparent pt-5 text-center font-semibold group-hover:border-black transition ease-in-out duration-100'>{t('pages.homeUser.labels.matchHistory')}</h3>
					<div className={`size-6 translate-y-6 translate-x-2 transition ease-in-out duration-300 ${history ? '-rotate-180' : 'rotate-0'}`}>
					<DownArrow className='' />
					</div>
				</button>
				</div>
					<div className={`transition-all ease-in-out duration-300 ${history ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
						{history && <MatchHistory player={param.username} />}
				</div>
			</div>
			</div>)
}
    
export default UserPage;