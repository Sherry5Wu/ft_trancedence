// /src/pages/User/UserSettings.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { GenericInput } from "../../components/GenericInput";
import { GenericButton } from '../../components/GenericButton';
import { ToggleButton } from "../../components/ToggleButton";
import { UserProfileBadge } from '../../components/UserProfileBadge';
import { updateProfilePic } from '../../utils/Fetch';
import { disable2FA } from '../../utils/Fetch';
import { useRequestNewToken } from '../../utils/Hooks';

const SettingsPage = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { user, setUser } = useUserContext();
	const requestNewToken = useRequestNewToken();

	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!user) navigate('/signin');
		// if (user) {
		//   setFirstName(user?.firstname ?? '');
		//   setLastName(user?.lastname ?? '');
		// }
	}, [user]);

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			try {
				const token = await requestNewToken();
				const avatarUrl = await updateProfilePic(file, token);
				console.log('avatarurl = ' + avatarUrl);
				if (!user)
					return ;
				if (avatarUrl)
				{
					setUser({
						...user, 
						profilePic: avatarUrl});
				}
				else
					alert('Updating avatar failed, please try another picture.');
			}
			catch(error) {
				console.error('Avatar upload failed', error);
		}}
	};

	return (
		<main
		className="pageLayout"
		role="main"
		aria-labelledby="pageTitle"
		aria-describedby="pageDescription"
		> 
		<p id="pageTitle" className="sr-only">
			{t('pages.userSettings.aria.label')}
		</p>
		<AccessiblePageDescription
		id="pageDescription"
		text={t('pages.userSettings.aria.description')}
		/>

		<div className="text-center">
			<UserProfileBadge
			size="lg"
			user={{
				username: user?.username,
				// photo: (user?.profilePic as React.ReactElement)?.props?.src,
				photo: user?.profilePic
				// (user?.profilePic as React.ReactElement)?.props?.src // extract the image URL from JSX
				// photo: user?.profilePic ? user.profilePic.props?.src : undefined // if user.profilePic isn't present yet 
			}}
			onClick={() => fileInputRef.current?.click()}
			alwaysShowPlus
			aria-label={t('pages.userSettings.aria.uploadProfile')}
			/>
			<input
			type="file"
			accept="image/*"
			ref={fileInputRef}
			style={{ display: 'none' }}
			onChange={handleImageUpload}
			aria-label={t('pages.userSettings.aria.uploadProfile')}
			/>
		</div>

     <div className='w-56 truncate mb-8'>
        <h2 className='h2 text-center font-semibold scale-dynamic'>
          {user?.username}
        </h2>
      </div>
           
      <div className="flex flex-col items-center text-center w-full mx-auto">
        <div className="">
          <h3 className="text-lg font-semibold mb-4">
            {t('pages.userSettings.accountSettings.title')}
          </h3>
          
          <GenericInput
            placeholder={t('common.placeholders.username')}
            aria-label={t('common.aria.inputs.username')}
            value={user?.username || ''}
            onFilled={() => {}}
            disabled
          />
          
          <GenericInput
            placeholder={t('common.placeholders.email')}
            aria-label={t('common.aria.inputs.email')}
            value={user?.email || ''}
            onFilled={() => {}}
            disabled
          />
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">
            {t('pages.userSettings.security.title')}
          </h3>
          
          {/** Disable this button if it's a user registered with GoogleSignIn */}
          <GenericButton
            className="generic-button"
            text={t('pages.changePassword.title')}
            aria-label={t('pages.userSettings.aria.changePassword')}
            onClick={() => navigate('/change-password')}
          />

			<GenericButton
				className="generic-button"
				text={t('pages.changePIN.title')}
				aria-label={t('pages.userSettings.aria.changePIN')}
				onClick={() => navigate('/change-pin')}
			/>
			</div>

			<div className="p-4">
			<h3 className="text-lg font-semibold">
				{t('pages.userSettings.twoFactor.title')}
			</h3>
			<div className="max-w-sm text-center p-4">
				{t('pages.userSettings.twoFactor.description')}

			<ToggleButton
				// label={t('pages.userSettings.twoFactor.title')}
				labelOn={t('pages.userSettings.twoFactor.labelOn')}
				labelOff={t('pages.userSettings.twoFactor.labelOff')}
				aria-label={t('pages.userSettings.aria.2faToggle')}
				checked={!!user?.twoFA} 
				onClick={async () => {
				if (user?.twoFA) {
					const success = await disable2FA(user.accessToken);
					if (success) {
						setUser({ ...user, twoFA: false });
						alert(t('pages.userSettings.twoFactor.disabled'));
					} else {
						alert(t('pages.userSettings.twoFactor.disableFailed'));
					}
				} else {
					navigate('/setup2fa');
				}
				}}
			/>
			</div>
			</div>

			<GenericButton
			className="generic-button"
			text={t('common.buttons.save')}
			aria-label={t('pages.userSettings.aria.saveChanges')}
			onClick={() => {
				alert(t('common.alerts.success'));
				setUser({
				...user!,
				});
				navigate(`/user/${user?.username}`);
			}}
			/>
		</div>
		</main>
  	);
};

export default SettingsPage;