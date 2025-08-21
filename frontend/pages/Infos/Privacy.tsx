// /src/pages/Info/Privacy.tsx

import React, { useEffect } from 'react';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useTranslation } from 'react-i18next';

const PrivacyPage: React.FC = () => {
  const { t } = useTranslation(); 

  useEffect(() => {
    document.title = t('pages.privacy.title');
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
      text={t('pages.privacy.aria.description')}
    />
      <div className="text-center">
        <h1 id="pageTitle" className="text-xl font-bold mb-4">
          {t('pages.privacy.title')}
        </h1>
        <p className="mt-2">{t('pages.privacy.text')}</p>
      </div>
    </main>
  );        
};

export default PrivacyPage;