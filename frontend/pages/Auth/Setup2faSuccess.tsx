// /src/pages/Auth/Setup2faSuccess.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import ProgressBar from '../../components/ProgressBar';
import SecurityIcon from '../../assets/noun-security-6758282.svg?react';

const Setup2faSuccessPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <main
      className="pageLayout"
      role="main"
      aria-labelledby="pageTitle"
      aria-describedby="pageDescription"
    >
      <AccessiblePageDescription
        id="pageDescription"
        text={t('pages.twoFactorAuth.success.aria.description')}
      />

      <h1 id="pageTitle" className="font-semibold text-center text-xl">
        {t('pages.twoFactorAuth.success.title')}
      </h1>

      <ProgressBar
        currentStep={3}
        stepCompletion={{ 1: true, 2: true, 3: true }}
        />

      <section className="max-w-md text-center space-y-4">
        <h2 className="font-semibold text-center text-lg">
          {t('pages.twoFactorAuth.success.subtitle')}
        </h2>

        <p>
          {t('pages.twoFactorAuth.success.successInfo')}
        </p>

        <SecurityIcon
          className="mx-auto h-40 w-40 mb-4"
          role="img"
          aria-label={t('pages.twoFactorAuth.success.aria.securityIcon')}
          focusable="false"
        />

        <p>
          {t('pages.twoFactorAuth.success.successMessage')}
        </p>
      </section>

      <div className="flex flex-wrap justify-center gap-6 mt-6">
        <GenericButton
          className="generic-button"
          text={t('common.buttons.done')}
          onClick={() => navigate('/homeuser')}
          aria-label={t('common.aria.buttons.done')}
        />
      </div>
    </main>
  );
};

export default Setup2faSuccessPage;