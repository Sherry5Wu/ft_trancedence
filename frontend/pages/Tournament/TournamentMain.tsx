// pages/Tornament/TournamentMain.tsx
// tournament list history in a dropdown layout
// user can create a new tournament or go back

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';

const TournamentsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <div>
        <h2 className="font-semibold text-center">TOURNAMENT LIST</h2>
      </div>

      <div>
        <h3 className="font-semibold text-center">Dropdown history of tournaments here!</h3>
      </div>

      {/* Bottom buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-12">
        <GenericButton
          className="generic-button"
          text="BACK"
          onClick={() => navigate('/homeuser')}
        />
        <GenericButton
          className="generic-button"
          text="CREATE"
          onClick={() => navigate('/tournaments/new')}
        />
      </div>
    </div>
  );
};

export default TournamentsPage;
