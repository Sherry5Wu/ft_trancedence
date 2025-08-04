// pages/Game.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CloseButton } from '../components/CloseButton';
import { useSingleMatch } from '../context/SingleMatchContext';

const GamePage: React.FC = () => {
    const navigate = useNavigate();
    const { firstPlayer, secondPlayer, reset } = useSingleMatch();


    return (
      <div className="flex flex-col justify-center p-8 space-y-4 max-w-sm mx-auto">
        
        <CloseButton className="ml-auto" />

        <h3 className="font-semibold text-center">Game</h3>


      <p className="text-lg">
        <strong>Player 1:</strong> {firstPlayer?.username ?? 'N/A'}<br />
        <img src={firstPlayer?.photo} alt="Player 1" className="profilePic" />

        <strong>Player 2:</strong> {secondPlayer?.username ?? 'N/A'}
        <img src={secondPlayer?.photo} alt="Player 2" className="profilePic" />
      </p>

      <button
        className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
        onClick={() => {
          reset();
          navigate('/choose-players');
        }}
      >
        Reset Players
      </button>
    </div>
  );
};

  export default GamePage;
  