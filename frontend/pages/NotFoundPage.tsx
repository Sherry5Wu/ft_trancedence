// src/pages/NotFoundPage.tsx
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import NotFoundIcon from '../assets/noun-404-error-7412843.svg?react'

const NotFoundPage = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('notFound.title');
  }, [t]);

  return (
    <main className="pageLayout" role="main" aria-labelledby="notFoundTitle">
      <div className="text-center">
        <NotFoundIcon
          className="mx-auto h-48 w-48 mb-6"
          aria-label={t('notFound.aria.errorIcon')}
          role="img"
        />
        <h1 id="notFoundTitle" className="text-2xl font-bold mb-4">
          {t('notFound.title')}
        </h1>
        <p className="text-lg">{t('notFound.message')}</p>
      </div>
    </main>
  );
};

export default NotFoundPage;