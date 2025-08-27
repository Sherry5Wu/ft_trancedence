import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { GenericButton } from '../../components/GenericButton';
import { useUserContext } from '../../context/UserContext';
import { verifyBackupCode } from '../../utils/Fetch';
import { GenericInput } from '../../components/GenericInput';

const Verify2faBackupCodePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const [code, setCode] = useState('');
  const formFilled = code.trim().length > 0;
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessToken = user?.accessToken;

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!accessToken) {
      alert(t("common.errors.unauthorized"));
      navigate("/signin");
      return;
    }

    setIsVerifying(true);
    setError(null);

    const result = await verifyBackupCode(code, accessToken);

    setIsVerifying(false);

    if (result?.used) {
      navigate(`/user/${user?.username}`);
    } else {
      setError(
        result?.message ||
          t('pages.twoFactorAuth.verifyBackupCode.invalidCode')
      );
    }
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
        text={t('pages.twoFactorAuth.verifyBackupCode.aria.description')}
      />

      <div className="max-w-md mx-auto space-y-6 text-center">
        <h1 id="pageTitle" className="text-2xl font-bold">
          {t('pages.twoFactorAuth.verifyBackupCode.title')}
        </h1>

        <h2 className="font-semibold">
          {t('pages.twoFactorAuth.verifyBackupCode.subtitle')}
        </h2>

        <p>
          {t('pages.twoFactorAuth.verifyBackupCode.instructions')}
        </p>

        <h2 className="font-semibold">
          {t('pages.twoFactorAuth.verifyBackupCode.verifyCodeTitle')}
        </h2>

        <form onSubmit={handleVerify} className="flex flex-col">
            <GenericInput
                type="text"
                placeholder={t('pages.twoFactorAuth.verifyBackupCode.placeholder')}
                aria-label={t('pages.twoFactorAuth.verifyBackupCode.aria.codeInput')}
                value={code}
                onFilled={(val: string) => {
                    setCode(val);
                    if (error) setError(null); // clears the error <p> as well
                }}
                onFocus={() => {
                    if (error) setError(null); // clears the error <p> as well
                }}
                //   errorMessage={error || undefined}
            />

          {isVerifying &&
            <p>{t('pages.twoFactorAuth.verify.checking')}</p>}

          {error &&
            <p className="text-red-600">{error}</p>}

          <div className="flex justify-center mt-6">
            <GenericButton
              type="submit"
              className="generic-button"
              text={t('common.buttons.verify')}
              disabled={!formFilled || isVerifying}
            />
          </div>
        </form>

      </div>
    </main>
  );
};

export default Verify2faBackupCodePage;
