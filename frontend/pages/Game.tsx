// pages/Game.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CloseButton } from '../components/CloseButton';

const GamePage: React.FC = () => {
    const navigate = useNavigate();
  
    return (
      <div className="flex flex-col justify-center p-8 space-y-4 max-w-sm mx-auto">
        
        <CloseButton className="ml-auto" />

        <h3 className="font-semibold text-center">Game</h3>

      </div>
    );
  };
  
  export default GamePage;
  