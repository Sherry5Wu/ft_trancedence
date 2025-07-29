// pages/Play/ChoosePlayers.tsx
// user choose player 2 as Registed or Guest, if register the player should 'log in a player'

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { GenericInput} from "../../components/GenericInput";


const ChoosePlayersPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <div>
        {/* Page title */}
        <h3 className="font-semibold text-center">
          Choose players</h3>

        {/* User input: Player 1 alreday set, available to change player name */}


        {/* Choose player 2 from option buttons */}

        {/* User input: Player 2 set if registered or blank for guest player */}

        {/* Cancel and Play Button */}
        
      </div>
    </div>
  );
};

export default ChoosePlayersPage;
