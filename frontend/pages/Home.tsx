import React from 'react';
import { GenericButton } from '../components/GenericButton';

const HomePage: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-screen h-screen p-8">
        <GenericButton
          className="generic-button"
          text="SIGN IN"
          icon={undefined}
          hoverLabel={undefined}
          disabled={false}
          onClick={()  => alert("Text-only button")}
        />
    </div>
  );
};

export default HomePage;
