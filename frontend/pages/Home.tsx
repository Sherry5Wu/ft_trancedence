// pages/Home.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../components/GenericButton';

const HomePage: React.FC = () => {
  const navigate = useNavigate(); // to access other pages

  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      
      {/* Page title*/}
      <div>
        <h1 className="h1 mb-30">P | N G - P · N G</h1>
      </div>

      {/* Sign in Button */}
      <div className="flex flex-wrap justify-center align-middle gap-6">
        <GenericButton
          className="generic-button"
          text="SIGN IN"
          icon={undefined}
          hoverLabel={undefined}
          disabled={false}
          onClick={() => navigate('/signin')}
        />

      {/* Arrow down button */}

      {/* About the project */}

      {/* Arrow up button */}

      </div>
    </div>
  );
};

export default HomePage;
