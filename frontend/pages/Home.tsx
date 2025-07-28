//pages/Home.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../components/GenericButton';

const HomePage: React.FC = () => {
  const navigate = useNavigate(); // to access other pages

  return (
    <div className="flex justify-center p-8">
        <GenericButton
          className="generic-button"
          text="SIGN IN"
          icon={undefined}
          hoverLabel={undefined}
          disabled={false}
          onClick={() => navigate('/signin')}
        />
    </div>
  );
};

export default HomePage;
