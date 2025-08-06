// pages/HomeUser.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../components/GenericButton';
import { MatchHistory } from '../components/MatchHistory';
import { useUserContext } from '../context/UserContext';
import { LineGraph } from '../components/LineGraph';
import { BarGraph } from '../components/BarGraph';
import { PieGraph } from '../components/PieGraph';
import { ResponsiveContainer } from 'recharts';
import ProfileIcon from '../assets/noun-profile-7808629.svg';
import PlayIcon from '../assets/noun-ping-pong-7327427.svg';
import TournamentIcon from '../assets/noun-tournament-7157459.svg';
import RivalsIcon from '../assets/noun-battle-7526810.svg';
import LeaderboardIcon from '../assets/noun-leaderboard-7709285.svg';
import DownArrow from '../assets/noun-down-arrow-down-1144832.svg?react';

const HomeUserPage = () => {
  const navigate = useNavigate(); // to access other pages
  const { user, setUser } = useUserContext();

  //mockdata
  const playedGames = 77;
  const winStreak = 1;
  const longestWinStreak =3;
  const worstRival = 'Alice';
  const WorstRivalPic = <img src='../assets/profilepics/B2.png' className='profilePic mt-1'/>

    return (
      <div className='pageLayout'>
      
      {/* Username header */}

      <div className='profilePicBig'>
        {user?.profilePic}
      </div>

      <div className='w-56 truncate mb-12'>
        <h2 className='h2 text-center mb-3 font-semibold scale-dynamic'>{user?.username} </h2>
        <div className='flex justify-between'>
          <h4 className='h4'>Score</h4>
          <h4 className='h4 text-right font-semibold'>{user?.score}</h4>
        </div>
        <div className='flex justify-between'>
          <h4 className='h4'>Rank</h4>
          <h4 className='h4 text-right font-semibold'>#{user?.rank}</h4>
        </div>
      </div>

      {/* Round-big-button group */}
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

      {/* <DownArrow className='size-15' /> */}
      {/* Statistics */}
      
      <div className='w-200 scale-90'>
        <h3 className='h3 text-center font-semibold my-5'>STATS</h3>
        <div className='grid grid-cols-2 w-full h-200'>
          <div>
            <h4 className='h4 text-center my-5 font-semibold'>SCORE HISTORY</h4>
            <LineGraph />
          </div>
          <div>
            <h4 className='h4 text-center my-5 font-semibold'>SCORE GAINS/LOSSES</h4>
            <div className=''>
              <BarGraph />
            </div>
          </div>
          <div>
            <h4 className='h4 text-center mt-60 mb-5 font-semibold'>WIN RATE</h4>
            <PieGraph/>
          </div> 
          <div className='grid grid-cols-2 mt-60 py-10 scale-90'>

            <div className='flex flex-col items-center'>
              <div className='flex size-25 rounded-full border-4 border-black bg-[#FFCC00] items-center justify-center'>
                <div className='text-5xl font-bold text-black'>{playedGames}</div>
              </div>
              <h4 className='h4 my-2 font-semibold'>PLAYED GAMES</h4>
            </div>

            <div className='flex flex-col items-center'>
              <button className='group relative flex size-25 rounded-full border-4 border-black bg-[#FFCC00] items-center justify-center}'>
                <div className='absolute text-3xl -top-12 left-1/2 -translate-x-1/2 text-black opacity-0 
                                group-hover:opacity-100 transition-opacity ease-in-out'>{worstRival}</div>
                {WorstRivalPic}
              </button>
              <h4 className='h4 my-2 font-semibold'>WORST RIVAL</h4>
            </div>

            <div className='flex flex-col items-center'>
              <div className='flex size-25 rounded-full border-4 border-black bg-[#FFCC00] items-center justify-center'>
                <div className='text-5xl font-bold text-black'>{winStreak}</div>
              </div>
              <h4 className='h4 my-2 font-semibold'>WIN STREAK</h4>
            </div>

            <div className='flex flex-col items-center'>
              <div className='flex size-25 rounded-full border-4 border-black bg-[#FFCC00] items-center justify-center'>
                <div className='text-5xl font-bold text-black'>{longestWinStreak}</div>
              </div>
              <h4 className='h4 my-2 font-semibold text-center'>LONGEST WIN STREAK</h4>
            </div>
          
          </div>
        </div>
      </div>


      {/* MATCH HISTORY */}
      <div className=''>
        <h3 className='h3 text-center font-semibold mb-5 -mt-10 scale-90'>MATCH HISTORY</h3>
        <MatchHistory player1={user?.username} />
      </div>
    </div>
  );
};


export default HomeUserPage;


          // <div className='mt-15 ml-15 px-2 flex flex-col'>
          //   <div className='flex mb-5 justify-between items-end border-b-2 border-dashed'>
          //     <h4 className='h4 font-semibold'>PLAYED GAMES</h4><h3 className='h3 font-bold'>{playedGames}</h3>
          //   </div>
          //   <div className='flex my-5 justify-between items-end border-b-2 border-dashed'>
          //     <h4 className='h4 font-semibold'>WIN STREAK</h4><h3 className='h3 font-bold'>{winStreak}</h3>
          //   </div>
          //   <div className='flex my-5 justify-between items-end border-b-2 border-dashed'>
          //     <h4 className='h4 font-semibold'>LONGEST WIN STREAK</h4><h3 className='h3 font-bold'>{longestWinStreak}</h3>
          //   </div>
          //   <div className='flex my-5 justify-between items-end border-b-2 border-dashed'>
          //     <h4 className='h4 font-semibold'>WORST RIVAL</h4><h3 className='h3 font-bold'>{worstRival}</h3>
          //   </div>