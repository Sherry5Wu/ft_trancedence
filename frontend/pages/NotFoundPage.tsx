// src/pages/NotFoundPage.tsx

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../components/AccessiblePageDescription';
import NotFoundIcon from '../assets/noun-404-error-7412843.svg?react';

const NotFoundPage = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('pages.notFound.title');
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
      text={t('pages.notFound.aria.description')}
    />

      <div className="text-center">
        <NotFoundIcon
          className="mx-auto h-48 w-48 mb-6"
          role="img"
          aria-hidden="true" // icon is decorative
          // aria-label={t('pages.notFound.aria.errorIcon')}
          focusable="false"
        />
        <h1 id="pageTitle" className="text-2xl font-bold mb-4">
          {t('pages.notFound.title')}
        </h1>
        <p className="mt-2">{t('pages.notFound.message')}</p>
      </div>
    </main>
  );
};

export default NotFoundPage;
