import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GenericButton } from '../components/GenericButton';
import { MatchHistory } from '../components/MatchHistory';
import { useUserContext } from '../context/UserContext';
import { Stats } from '../components/Stats';
import { fetchUserStats, fetchScoreHistory, addRival, removeRival, fetchUsers } from '../utils/Fetch';
import { UserStats, ScoreHistory, FetchedUserData } from '../utils/Interfaces';
import PlayIcon from '../assets/noun-ping-pong-7327427.svg';
import TournamentIcon from '../assets/noun-tournament-7157459.svg';
import RivalsIcon from '../assets/noun-battle-7526810.svg';
import LeaderboardIcon from '../assets/noun-leaderboard-7709285.svg';
import DownArrow from '../assets/noun-down-arrow-down-1144832.svg?react';

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

	useEffect(() => {
		const loadStats = async () => {
			if (!user) navigate('/signin');
			if (!param.username) return ;

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
		loadStats();
	}, [user, param.username]);

	useEffect(() => {
		const loadProfilePicURL = async () => {
			const allUsers = await fetchUsers(user?.accessToken);
			if (!allUsers)
				return ;
			const pageOwner = allUsers.filter((u: FetchedUserData) => u.username === param.username);
			setProfilePicURL(pageOwner.avatarUrl);
		}
		console.log('PROFILE PIC URL:');
		console.log(profilePicURL);
		loadProfilePicURL();
	}, [param.username, user?.profilePic])

	if (loading)
		return <div className='flex justify-center'>Loading page...</div>;

	// console.log("ACCESS TOKEN");
	// console.log(user?.accessToken);
	// console.log("RIVALS in user page");
	// console.log(user?.rivals);

	return (
		<div className='pageLayout'>
		
		{/* User header */}

		<div className='profilePicBig'>
			{profilePicURL ? 
				<img src={profilePicURL} className='w-full h-full object-cover'/> : <img src='../assets/noun-profile-7808629.svg' className='w-full h-full object-cover'/>}
		</div>

		<div className='w-56 truncate mb-12'>
			<h2 className='h2 text-center mb-3 font-semibold scale-dynamic'>{param.username} </h2>
			<div className='flex justify-between'>
				<h4 className='h4 ml-2 scale-dynamic'>Score</h4>
				<h4 className='h4 mr-2 scale-dynamic text-right font-semibold'>{userStats ? userStats.elo_score : 0}</h4>
			</div>
			<div className='flex justify-between'>
				<h4 className='h4 ml-2 scale-dynamic'>Rank</h4>
				<h4 className='h4 mr-2 scale-dynamic ext-right font-semibold'>#{userStats ? userStats.rank : '?'}</h4>
			</div>
		</div>

		{/* Buttons */}

		{param.username === user?.username ? 

		<div className="flex flex-wrap justify-center gap-6">
			<GenericButton
			className="round-icon-button"
			text={undefined}
			icon={<img src={PlayIcon} alt="Play icon" />}
			hoverLabel="PLAY"
			onClick={() => 
				navigate('/choose-players')}
			/>
			<GenericButton
			className="round-icon-button"
			text={undefined}
			icon={<img src={TournamentIcon} alt="Tournament icon" />}
			hoverLabel="TOURNAMENT"
			onClick={() => 
				navigate('/tournaments')}
			/>
			<GenericButton
			className="round-icon-button"
			text={undefined}
			icon={<img src={RivalsIcon} alt="Rivals icon" />}
			hoverLabel="RIVALS"
			onClick={() => 
				navigate('/rivals')}
			/>
			<GenericButton
			className="round-icon-button"
			text={undefined}
			icon={<img src={LeaderboardIcon} alt="Leaderboard icon" />}
			hoverLabel="LEADERBOARD"
			onClick={() => 
				navigate('/leaderboard')}
			/>
		</div>

		:
		
		user.rivals.includes(param.userName) ?

		<GenericButton
		className="round-icon-button"
		text={undefined}
		icon={<img src={RivalsIcon} alt="Rivals icon" />}
		hoverLabel='REMOVE FROM RIVALS'
		onClick={() => removeRival(param.username, user?.accessToken)} />
	
		:

		<GenericButton
		className="transparent-round-icon-button"
		text={undefined}
		icon={<img src={RivalsIcon} alt="Rivals icon" />}
		hoverLabel='ADD TO RIVALS'
		onClick={() => addRival(param.username, user?.accessToken)} />
		}

		{/* Statistics */}
		
			<div aria-label='statistics' className='w-200'>
			<div className='flex justify-center items-center ml-5'>
				<button onClick={showStats} className='flex scale-90 group hover:cursor-pointer transition-all ease-in-out hover:scale-93'>
				<h3 className='h3 border-b-3 border-transparent pt-5 text-center font-semibold group-hover:border-black transition ease-in-out duration-100'>STATS</h3>
				<div className={`size-12 translate-y-[12px] transition ease-in-out duration-300 ${stats ? '-rotate-180' : 'rotate-0'}`}>
					<DownArrow className='' />
				</div>
				</button>
			</div>

			{stats && (<Stats userStats={userStats} scoreHistory={scoreHistory} />)}
			</div>

			<div aria-label='match history' className=''>
				<div className='flex justify-center items-center ml-5 mb-5'>
				<button onClick={showHistory} className='flex scale-90 group hover:cursor-pointer transition-all ease-in-out hover:scale-93'>
					<h3 className='h3 border-b-3 border-transparent pt-5 text-center font-semibold group-hover:border-black transition ease-in-out duration-100'>MATCH HISTORY</h3>
					<div className={`size-12 translate-y-[12px] transition ease-in-out duration-300 ${history ? '-rotate-180' : 'rotate-0'}`}>
					<DownArrow className='' />
					</div>
				</button>
				</div>
				<div className={`transition-all ease-in-out duration-300 ${history ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
				{history && <MatchHistory player1={param.username} />}
				</div>
			</div>
			</div>)
}
    
export default UserPage;