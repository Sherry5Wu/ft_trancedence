// pages/Home.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../components/AccessiblePageDescription';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../components/GenericButton';
import DownArrow from '../assets/noun-down-arrow-down-1144832.svg?react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showText, setShowText] = useState(false);

  const toggleText = () => {
    setShowText(prev => !prev);
  };

  return (
    <main
      className="pageLayout"
      role="main"
      aria-labelledby="pageTitle"
      aria-describedby="pageDescription"
    >
    <AccessiblePageDescription
      id="pageDescription"
      text={t('pages.home.aria.description')}
    />

      <div className="text-center mt-6">
        <h1 id="pageTitle" className="font-bold text-3xl mb-4">
          P | N G - P · N G
        </h1>

        <p id="home-description" className="text-lg mb-6">
          {t('pages.home.welcome')}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 mb-6">
        <GenericButton
          className="generic-button"
          text={t('common.buttons.signIn')}
          aria-label={t('common.aria.buttons.signIn')}
          onClick={() => navigate('/signin')}
        />
      </div>

      <div className="flex justify-center mb-4">
        <button
          onClick={toggleText}
          aria-expanded={showText}
          aria-controls="home-about-section"
          aria-label={t('pages.home.welcome')}
        >
          <div
            className={`transition-transform duration-300 ${
              showText ? 'rotate-180' : 'rotate-0'
            }`}
          >
            <DownArrow className="w-12 h-12" />
          </div>
        </button>
      </div>

      <section
        id="home-about-section"
        className={`mt-4 text-center px-4 max-w-xl text-black transition-all duration-300 ${
          showText ? 'block' : 'hidden'
        }`}
        aria-hidden={!showText}
      >
        <p aria-live="polite">{t('pages.home.aboutText')}</p>
      </section>
    </main>
  );
};

export default HomePage;