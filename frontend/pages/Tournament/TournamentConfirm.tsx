// pages/Tornament/TournamenConfirm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';


const TournamentPlayersPage: React.FC = () => {
  const navigate = useNavigate();


   return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <h3 className="font-semibold text-center">Choose players alias</h3>

   

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        <GenericButton
          className="generic-button"
          text="BACK"
          onClick={() => navigate('/tournaments/new')}
        />
        <GenericButton
          className="generic-button"
          text="START"
          disabled={false}
          onClick={() => {
            navigate('/ping-pong');
          }}
        />
      </div>
      </div>
  );
};

export default TournamentPlayersPage;