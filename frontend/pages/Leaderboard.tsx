// pages/Leaderboard.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../components/AccessiblePageDescription';
import { useUserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import MedalIcon from '../assets/noun-medal-6680492.svg?react';

const LeaderboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserContext();

  // Mocked leaderboard data
  interface PlayerStats {
    username: string;
    profilePic: string;
    totalGames: number;
    totalScore: number;
    isRival?: 'y' | 'n';
  }
  const mockLeaderboard: PlayerStats[] = [
  {
      username: 'Rival0',
      profilePic: '../assets/profilepics/Bluey.png',
      totalGames: 10,
      totalScore: 25,
      isRival: 'n',
    },
    {
      username: 'Rival1',
      profilePic: '../assets/profilepics/B2.png',
      totalGames: 12,
      totalScore: 30,
      isRival: 'y',
    },
    {
      username: 'Rival2',
      profilePic: '../assets/profilepics/image.jpg',
      totalGames: 9,
      totalScore: 22,
      isRival: 'y',
    },
    {
      username: 'Rival3',
      profilePic: '../assets/profilepics/Bandit.png',
      totalGames: 15,
      totalScore: 18,
      isRival: 'y',
    },
    {
      username: 'Rival4',
      profilePic: '../assets/profilepics/image.jpg',
      totalGames: 8,
      totalScore: 155,
      isRival: 'y',
    },
    {
      username: 'Rival5',
      profilePic: '../assets/profilepics/image.jpg',
      totalGames: 8,
      totalScore: 15,
      isRival: 'y',
    },
    {
      username: 'Rival6',
      profilePic: '../assets/profilepics/image.jpg',
      totalGames: 8,
      totalScore: 15,
      isRival: 'y',
    },
    {
      username: 'Rival7',
      profilePic: '../assets/profilepics/image.jpg',
      totalGames: 8,
      totalScore: 155,
      isRival: 'y',
    },
    {
      username: 'Rival8',
      profilePic: '../assets/profilepics/image.jpg',
      totalGames: 8,
      totalScore: 55,
      isRival: 'y',
    },
    {
      username: 'Rival9',
      profilePic: '../assets/profilepics/image.jpg',
      totalGames: 8,
      totalScore: 15,
      isRival: 'y',
    },
    {
      username: 'Rival10',
      profilePic: '../assets/profilepics/image.jpg',
      totalGames: 8,
      totalScore: 15,
      isRival: 'y',
    },    
    {
      username: 'Rival11',
      profilePic: '../assets/profilepics/image.jpg',
      totalGames: 8,
      totalScore: 15,
      isRival: 'y',
    },    
    {
      username: 'Paddington',
      profilePic: '../assets/profilepics/Bluey.png',
      totalGames: 1,
      totalScore: 2,
    },
  ];

  const leaderboardData = mockLeaderboard
    .sort((a, b) => b.totalScore - a.totalScore) // sort by score descending
    .slice(0, 10); // limit to top 10

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

      <div className="">
        {leaderboardData.length > 0 && (
          <>
        <div
          aria-label={t('pages.leaderboard.aria.table')}
          className="grid grid-cols-6 mb-1 text-center font-medium"
        >
          <span></span>
          <span></span>
          <span aria-label={t('pages.leaderboard.aria.columnUsername')}>
            {t('pages.leaderboard.columns.username')}
          </span>
          <span aria-label={t('pages.leaderboard.aria.columnRival')}>
            {t('pages.leaderboard.columns.rival')}
          </span>
          <span aria-label={t('pages.leaderboard.aria.columnTotalGames')}>
            {t('pages.leaderboard.columns.totalGames')}
          </span>
          <span aria-label={t('pages.leaderboard.aria.columnScore')}>
            {t('pages.leaderboard.columns.score')}
          </span>
        </div>
          </>
        )}
      </div>

        <ul aria-label={t('pages.leaderboard.aria.label')}>
          {leaderboardData.length === 0 ? (
            <li
              className="grid items-center text-center rounded-xl h-12 mb-2 px-40 bg-[#FFEE8C]"
              aria-label={t('pages.leaderboard.empty')}
            >
              <span className="col-span-6">{t('pages.leaderboard.empty')}</span>
            </li>
          ) : (
            leaderboardData.map((player, idx) => {
              const isCurrentUser = player.username === user?.username;
              return (
              <li
                key={player.username}
                onClick={() => navigate(`/profile/${player.username}`)}
                className={`grid grid-cols-6 gap-x-2 items-center text-center rounded-xl h-12 mb-2 ${
                  isCurrentUser ? 'bg-[#FDFBD4] border-2' : 'bg-[#FFEE8C]'
                } hover:cursor-pointer hover:scale-105 transform transition ease-in-out duration-300`}
                aria-label={`Player ${player.username} at position ${idx + 1}`}
              >
                <span className="relative flex justify-center items-center w-8 h-8 mx-auto">
                  {(idx === 0 || idx === 1 || idx === 2) && (
                    <MedalIcon className="absolute w-12 h-12" aria-hidden="true" />
                  )}
                  <span className="z-10">{idx + 1}</span>
                </span>
                <img
                  src={player.profilePic}
                  alt={`${player.username}'s profile picture`}
                  className="h-11 w-11 rounded-full object-cover border-2"
                />
                <span className="truncate">{player.username}</span>
                <span>{player.isRival}</span>
                <span>{player.totalGames}</span>
                <span className="font-semibold">{player.totalScore}</span>
              </li>
              );
            })
          )}

          {!leaderboardData.some((p) => p.username === user?.username) && (() => {
            const currentUser = mockLeaderboard.find((p) => p.username === user?.username);
            if (!currentUser) return null;
            const currentUserIndex = mockLeaderboard
              .sort((a, b) => b.totalScore - a.totalScore)
              .findIndex((p) => p.username === user?.username);

            return (
              <>
                <div className="text-center text-xl text-black my-4" aria-hidden="true">
                  . . .
                </div>
                <li
                  onClick={() => navigate(`/profile/${currentUser.username}`)}
                  className="grid grid-cols-6 gap-x-2 items-center text-center rounded-xl h-12 mb-2 bg-[#FDFBD4] border-2 hover:cursor-pointer hover:scale-105 transform transition ease-in-out duration-300"
                  aria-label={`Current user ${currentUser.username} at position ${currentUserIndex + 1}`}
                >
                  <span>{currentUserIndex + 1}</span>
                  <img
                    src={currentUser.profilePic}
                    alt={`${currentUser.username}'s profile picture`}
                    className="h-11 w-11 rounded-full object-cover border-2"
                  />
                  <span className="truncate">{currentUser.username}</span>
                  <span>{currentUser.isRival}</span>
                  <span>{currentUser.totalGames}</span>
                  <span className="font-semibold">{currentUser.totalScore}</span>
                </li>
              </>
            );
          })()}
        </ul>
    </main>
  );
};

export default LeaderboardPage;