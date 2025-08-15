import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GenericButton } from '../components/GenericButton';
import { MatchHistory } from '../components/MatchHistory';
import { useUserContext } from '../context/UserContext';
import { Stats } from '../components/Stats';
import PlayIcon from '../assets/noun-ping-pong-7327427.svg';
import TournamentIcon from '../assets/noun-tournament-7157459.svg';
import RivalsIcon from '../assets/noun-battle-7526810.svg';
import LeaderboardIcon from '../assets/noun-leaderboard-7709285.svg';
import DownArrow from '../assets/noun-down-arrow-down-1144832.svg?react';

export interface UserStats {
    games_played: number;
    win_streak: number;
    longest_win_streak: number;
    worstRival: string;
    games_draw: number;
    games_lost: number;
    games_won: number;
	elo_score: number;
	rank: number;
    // worstRivalPic: string;
}

export interface ScoreHistory {
    id: number,
    elo_score: number,
}

const addRival = async (userID: string) => {
	try {
		const response = await fetch(`https://localhost:8443/stats/rivals/${userID}`, { //FIX PATH
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok)
			throw new Error(`HTTP error! Status: ${response.status}`);

		return response.json();

	}
	catch (error) {
		console.error('Error: ', error);
		return null;
	}
}

const removeRival = async (userID: string) => {
	try {
		const response = await fetch(`https://localhost:8443/stats/rivals/${userID}`, { //FIX PATH
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok)
			throw new Error(`HTTP error! Status: ${response.status}`);

		return response.json();
	}
	catch (error) {
		console.error('Error: ', error);
		return null;
	}
	
}

const fetchScoreHistory = async (userID: string): Promise<ScoreHistory[] | null>  => {
	try {
		const response = await fetch(`https://localhost:8443/stats/score_history/username/${userID}`, {
			method: 'GET'
		});

		if (!response.ok)
			throw new Error(`HTTP error! Status: ${response.status}`);

		const data = await response.json();

		const filteredData: ScoreHistory[] = data.map((item: ScoreHistory) => ({
			id: item.id,
			elo_score: item.elo_score,
		}));
		console.log('from fetchScoreHistory ');
		console.log(filteredData);
		return filteredData;
	}

	catch (error) {
		console.error('Error: ', error);
		return null;
	}
};

const fetchUserStats = async (userID: string): Promise<UserStats | null> => {
	try {
		const response = await fetch(`https://localhost:8443/stats/user_match_data/username/${userID}`, {
		method: 'GET'
		});

		console.log(userID);
		if (!response.ok)
			throw new Error(`HTTP error! Status: ${response.status}`);

		const userStats: UserStats = await response.json();
		console.log(userStats);
		return userStats;
	}

	catch (error) {
		console.error('Error: ', error);
		return null;
	}
}

const UserPage = () => {
	const navigate = useNavigate();
	const { user, setUser } = useUserContext();
	const [stats, setStats] = useState(false);
	const [history, setHistory] = useState(false);
	const [userStats, setUserStats] = useState<UserStats | null>(null);
	const [scoreHistory, setScoreHistory] = useState<ScoreHistory[] | null>(null);
	const [loading, setLoading] = useState(true);
	const param = useParams();
	const pageOwner = param.username;

	const showStats = () => setStats(!stats);
	const showHistory = () => setHistory(!history);

	useEffect(() => {
		const loadStats = async () => {
			if (!user) navigate('/signin');
			if (!pageOwner) return ;

			setLoading(true);

			const statPromise = fetchUserStats(pageOwner);
			const scorePromise = fetchScoreHistory(pageOwner);

			const stats = await statPromise;
			const score = await scorePromise;

			setUserStats(stats);
			setScoreHistory(score);

			console.log('stats and score: ');
			console.log(stats);
			console.log(score);

			setLoading(false);
		}
		loadStats();
		}, [user]);

	if (loading)
		return <div className='flex justify-center'>Loading page...</div>;

	// if (!userStats || !scoreHistory)
    // 	return <div className='flex justify-center my-5'>Unable to load player</div>

	return (
		<div className='pageLayout'>
		
		{/* User header */}

		<div className='profilePicBig'>
			{user?.profilePic}
		</div>

		<div className='w-56 truncate mb-12'>
			<h2 className='h2 text-center mb-3 font-semibold scale-dynamic'>{pageOwner} </h2>
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
			className="transparent-round-icon-button"
			text={undefined}
			icon={<img src={RivalsIcon} alt="Rivals icon" />}
			hoverLabel='ADD TO RIVALS'
			onClick={() => 
				addRival(user.id);
			}
			/>
		
			:

			  <GenericButton
			  className="round-icon-button"
			  text={undefined}
			  icon={<img src={RivalsIcon} alt="Rivals icon" />}
			  hoverLabel='REMOVE FROM RIVALS'
			  onClick={() => 
			    removeRival(user.id);
			  }
			/>
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
				{history && <MatchHistory player1={user} />}
				</div>
			</div>
			</div>)
}
    
export default UserPage;