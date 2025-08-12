// src/pages/NotFoundPage.tsx
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import NotFoundIcon from '../assets/noun-404-error-7412843.svg?react'

const NotFoundPage = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('pages.notFound.title');
  }, [t]);

  return (
    <main className="pageLayout" role="main" aria-labelledby="notFoundTitle">
      <div className="text-center">
        <NotFoundIcon
          className="mx-auto h-48 w-48 mb-6"
          aria-label={t('pages.notFound.aria.errorIcon')}
          role="img"
        />
        <h2 id="notFoundTitle" className="text-2xl font-bold mb-4">
          {t('pages.notFound.title')}
        </h2>
        <p className="text-lg">{t('pages.notFound.message')}</p>
      </div>
    </main>
  );
};

export default NotFoundPage;

// aria-labelledby refers to the ID of an element containing the translated text