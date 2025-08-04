// pages/Leaderboard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

const LeaderboardPage: React.FC = () => {
    const navigate = useNavigate();
  
    return (
      <div className="flex flex-col justify-center p-8 space-y-4 max-w-sm mx-auto">

        <h3 className="font-semibold text-center">Leaderboard</h3>

      </div>
    );
  };
  
  export default LeaderboardPage;
  