// pages/Leaderboard.tsx

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../components/AccessiblePageDescription';
import { useUserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import MedalIcon from '../assets/noun-medal-6680492.svg?react';
import { UserStats, LeaderboardStats, FetchedUserData } from '../utils/Interfaces';
import { fetchUsers, fetchUserStats } from '../utils/Fetch';
import { DEFAULT_AVATAR } from '../utils/constants';

const LeaderboardPage = () => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const { user } = useUserContext();
	const [loading, setLoading] = useState(true);
	const [leaderboardData, setLeaderboardData] = useState<LeaderboardStats[]>([]);

	useEffect(() => {
		const getLeaderboard = async () => {
			setLoading(true);
			try {
				if (!user)
					return ;
				const users: FetchedUserData[] = await fetchUsers();
				const leaderboard: (LeaderboardStats | null)[] = await Promise.all (
					users.map(async u => {
						const userStats = await fetchUserStats(u.username);
						if (userStats)
						{
							const leaderboardEntry: LeaderboardStats = {
								userInfo: u,
								stats: userStats,
							}
							return leaderboardEntry;
						}
						else
							return null;
					}
				))
				if (leaderboard)
				{
					const filteredLeaderboard = leaderboard.filter((entry): entry is LeaderboardStats => entry !== null);
					setLeaderboardData(filteredLeaderboard);
				}
			}
			catch(error) {
				console.error('Error: ', error);
				return null;
			}
			setLoading(false);
		}
		getLeaderboard();
	}, [])

	if (!leaderboardData || leaderboardData.length == 0)
    	return (
			<>
				<h1 id="pageTitle" className="h1 font-semibold text-center">{t('pages.leaderboard.title')}</h1>
				<div className='flex justify-center translate-y-10'>{t('pages.leaderboard.empty')}</div>
			</>);

  	leaderboardData.sort((a, b) => b.stats.elo_score - a.stats.elo_score) // sort by score descending
    	.slice(0, 10); // limit to top 10


	if (loading)
		return <div className='flex justify-center'>{t('pages.leaderboard.loadingLeaderboard')}</div>;

  return (
    <main
      className="pageLayout"
      role="main"
      aria-labelledby="pageTitle"
      aria-describedby="pageDescription"
    >
      <AccessiblePageDescription
        id="pageDescription"
        text={t('pages.leaderboard.aria.description')}
      />

      <h1 id="pageTitle" className="h1 font-semibold text-center">
        {t('pages.leaderboard.title')}
      </h1>

      {leaderboardData.length > 0 && (
        <div
          aria-label={t('pages.leaderboard.aria.table')}
          className="grid grid-cols-8 text-center font-medium min-w-md translate-y-2"
        >
          <span className='col-span-1'></span>
          <span className='col-span-1'></span>
          <span className='col-span-2' aria-label={t('pages.leaderboard.aria.columnUsername')}>
            {t('pages.leaderboard.columns.username')}
          </span>
          <span className='col-span-2' aria-label={t('pages.leaderboard.aria.columnTotalGames')}>
            {t('pages.leaderboard.columns.totalGames')}
          </span>
          <span className='col-span-2' aria-label={t('pages.leaderboard.aria.columnScore')}>
            {t('pages.leaderboard.columns.score')}
          </span>
        </div>
        )}

        <ul aria-label={t('pages.leaderboard.aria.label')}>
          {leaderboardData.length === 0 ? (
            <li
              className="grid items-center text-center rounded-xl h-12 mb-2 px-40 bg-[#FFEE8C]"
              aria-label={t('pages.leaderboard.empty')}
            >
              <span className="col-span-8">{t('pages.leaderboard.empty')}</span>
            </li>
          ) : (
            leaderboardData.map((player, idx) => {
              const isCurrentUser = player.userInfo.username === user?.username;
              return (
              <li
                key={player.userInfo.username}
                onClick={() => navigate(`/user/${player.userInfo.username}`)}
                className={`grid grid-cols-8 gap-x-2 min-w-md items-center text-center rounded-xl h-12 mb-2 ${
                  isCurrentUser ? 'bg-[#FDFBD4] border-2' : 'bg-[#FFEE8C]'
                } hover:cursor-pointer hover:scale-105 transform transition ease-in-out duration-300`}
                aria-label={`Player ${player.userInfo.username} at position ${idx + 1}`}
              >
                <span className="relative flex justify-center items-center w-8 h-8 mx-auto col-span-1">
					{(idx === 0 || idx === 1 || idx === 2) && (
						<MedalIcon className="absolute w-12 h-12" aria-hidden="true" />
					)}
					<span className="z-10">{idx + 1}</span>
                </span>
                <span className='flex justify-center col-span-1'>
					<img
						src={player.userInfo.avatarUrl || DEFAULT_AVATAR}
						alt={`${player.userInfo.username}'s profile picture`}
						className="h-11 w-11 rounded-full object-cover border-2"
					/>
				</span>
                <span className="truncate col-span-2">{player.userInfo.username}</span>
                <span className='col-span-2'>{player.stats.games_played}</span>
                <span className="font-bold col-span-2 text-lg">{player.stats.elo_score}</span>
              </li>
              );
            })
          )}

          {!leaderboardData.some((p) => p.userInfo.username === user?.username) && (() => {
            const currentUser = leaderboardData.find((p) => p.userInfo.username === user?.username);
            if (!currentUser) return null;
            const currentUserIndex = leaderboardData
              .sort((a, b) => b.stats.elo_score - a.stats.elo_score)
              .findIndex((p) => p.userInfo.username === user?.username);

            return (
              <>
                <div className="text-center text-xl text-black my-4" aria-hidden="true">
                  . . .
                </div>
                <li
                  onClick={() => navigate(`/user/${currentUser.userInfo.username}`)}
                  className="grid grid-cols-8 gap-x-2 items-center text-center rounded-xl h-12 mb-2 bg-[#FDFBD4] border-2 hover:cursor-pointer hover:scale-105 transform transition ease-in-out duration-300"
                  aria-label={`Current user ${currentUser.userInfo.username} at position ${currentUserIndex + 1}`}
                >
                  <span className='col-span-1'>{currentUserIndex + 1}</span>
                  <span className='col-span-1 flex justify-center'>
					<img
						src={currentUser.userInfo.avatarUrl || DEFAULT_AVATAR}
						alt={`${currentUser.userInfo.username}'s profile picture`}
						className="h-11 w-11 rounded-full object-cover border-2"
                  	/>
				  </span>
                  <span className="truncate col-span-2">{currentUser.userInfo.username}</span>
                  <span className='col-span-2'>{currentUser.stats.games_played}</span>
                  <span className="font-bold col-span-2 text-lg">{currentUser.stats.elo_score}</span>
                </li>
              </>
            );
          })()}
        </ul>
    </main>
  );
};

export default LeaderboardPage;