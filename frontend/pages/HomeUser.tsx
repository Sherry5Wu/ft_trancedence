// pages/HomeUser.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../components/GenericButton';
import { MatchHistory } from '../components/MatchHistory';
import { useUserContext } from '../context/UserContext';
import ProfileIcon from '../assets/noun-profile-7808629.svg';
import PlayIcon from '../assets/noun-ping-pong-7327427.svg';
import TournamentIcon from '../assets/noun-tournament-7157459.svg';
import RivalsIcon from '../assets/noun-battle-7526810.svg';
import LeaderboardIcon from '../assets/noun-leaderboard-7709285.svg';

const HomeUserPage = () => {
  const navigate = useNavigate(); // to access other pages
  const { user, setUser } = useUserContext();

    return (
      <div className="flex flex-col items-center p-8 space-y-6">
      
      {/* Username header */}

      <div className='profilePicBig'>
        {user?.profilePic}
      </div>

      <div className='w-56 truncate mb-12'>
        <h2 className='h2 text-center mb-3'>{user?.username} </h2>
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
            alert('Go to Rivals Page!')}  // UPDATE TO navigate('path')
        />
        <GenericButton
          className="round-icon-button"
          text={undefined}
          icon={<img src={LeaderboardIcon} alt="Leaderboard icon" />}
          hoverLabel="LEADERBOARD"
          onClick={() => 
            alert('Go to Leaderboard Page!')}  // UPDATE TO navigate('path')
        />

      {/* Arrow down button */}

      {/* Statistics */}

      {/* Arrow up button */}

      </div>
      {/* MATCH HISTORY */}
      <div>
        <h3 className='h3 text-center font-semibold mb-5'>MATCH HISTORY</h3>
        <MatchHistory player1={user?.username} />
      </div>
    </div>
  );
};


export default HomeUserPage;