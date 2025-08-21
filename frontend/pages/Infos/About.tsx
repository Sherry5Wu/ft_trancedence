// /src/pages/Info/About.tsx

import React, { useEffect } from 'react';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useTranslation } from 'react-i18next';
import TeamMember from '../../components/TeamMember';

const AboutPage: React.FC = () => {
  const { t } = useTranslation(); 

  useEffect(() => {
    document.title = t('pages.about.title');
  }, [t]);

  return (
    <main
      className="pageLayout"
      role="main"
      aria-labelledby="pageTitle"
      aria-describedby="pageDescription"
    >
    <AccessiblePageDescription
      id="pageDescription"
      text={t('pages.about.aria.description')}
    />
      <div className="text-center">
        <h1 id="pageTitle" className="text-xl font-bold mb-4">
          {t('pages.about.title')}
        </h1>

        <div className="mt-8 mx-auto max-w-2xl">
        <p className="mt-2">{t('pages.about.text')}</p>
        </div>

      </div>
    </main>
  );        
};

export default AboutPage;