// pages/Home.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../components/GenericButton';
import { useTranslation } from 'react-i18next';
import DownArrow from '../assets/noun-down-arrow-down-1144832.svg?react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showText, setShowText] = useState(false);

  const toggleText = () => {
    setShowText(prev => !prev);
  };

  return (
    <div className="pageLayout">
      <p>{t('home.welcome')}</p>
      
      <div>
        <h1 className="h1 mb-30">P | N G - P · N G</h1>
      </div>

      <div className="flex flex-wrap justify-center align-middle gap-6">
        <GenericButton
          className="generic-button"
          // add on component    ariaLabel={t('signIn')}  
          text={t('home.signInButton')}
          icon={undefined}
          hoverLabel={undefined}
          disabled={false}
          onClick={() => navigate('/signin')}
        />
      </div>

      {/* Arrow down button */}
      <button onClick={toggleText} aria-label="Toggle About Text">
        <div
          className={`transition-transform duration-300 ${
            showText ? '-rotate-180' : 'rotate-0'
          }`}
        >
          <DownArrow className="w-20 h-20" />
        </div>
      </button>

      {/* About the project */}
      {showText && (
        <div className="mt-4 text-center px-4 max-w-xl text-black">
          <p>
            {t('home.aboutText')}
          </p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
