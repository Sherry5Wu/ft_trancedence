// pages/HomeUser.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../components/GenericButton';
import { MatchHistory } from '../components/MatchHistory';
import ProfileIcon from '../assets/noun-profile-7808629.svg';
import PlayIcon from '../assets/noun-ping-pong-7327427.svg';
import TournamentIcon from '../assets/noun-tournament-7157459.svg';
import RivalsIcon from '../assets/noun-battle-7526810.svg';
import LeaderboardIcon from '../assets/noun-leaderboard-7709285.svg';

const HomeUserPage: React.FC = () => {
  const navigate = useNavigate(); // to access other pages

    return (
      <div className="flex flex-col items-center p-8 space-y-6">
      
      {/* Username header */}
      <div>
        <h3 className="font-semibold text-center">get username 'Bob' here</h3>
      </div>

      {/* Round-big-button group */}
      <div className="flex flex-wrap justify-center gap-6">
        <GenericButton
          className="round-icon-button"
          text={undefined}
          icon={<img src={PlayIcon} alt="Play icon" />}
          hoverLabel="PLAY"
          onClick={() => 
            alert('Go to Play Page!')} // UPDATE TO vavigate('path')
        />
        <GenericButton
          className="round-icon-button"
          text={undefined}
          icon={<img src={TournamentIcon} alt="Tournament icon" />}
          hoverLabel="TOURNAMENT"
          onClick={() => 
            alert('Go to Tournament Page!')} // UPDATE TO vavigate('path')
        />
        <GenericButton
          className="round-icon-button"
          text={undefined}
          icon={<img src={RivalsIcon} alt="Rivals icon" />}
          hoverLabel="RIVALS"
          onClick={() => 
            alert('Go to Rivals Page!')}  // UPDATE TO vavigate('path')
        />
        <GenericButton
          className="round-icon-button"
          text={undefined}
          icon={<img src={LeaderboardIcon} alt="Leaderboard icon" />}
          hoverLabel="LEADERBOARD"
          onClick={() => 
            alert('Go to Leaderboard Page!')}  // UPDATE TO vavigate('path')
        />

      {/* Arrow down button */}

      {/* Statistics */}

      {/* Arrow up button */}

      </div>
      {/* MATCH HISTORY */}
      <div>
        <MatchHistory player1='user' matchIndex={1} />
      </div>
    </div>
  );
};


export default HomeUserPage;