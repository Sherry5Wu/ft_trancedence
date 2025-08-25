// /src/pages/SignUp.tsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../components/AccessiblePageDescription';
import { GenericButton } from '../components/GenericButton';
import { GenericInput } from '../components/GenericInput';
import { ToggleButton } from '../components/ToggleButton';
import { useValidationField } from '../utils/Hooks';
import { isValidUsername, isValidEmail, isValidPassword, isValidPin } from '../utils/Validation';
import { Tooltip } from '../components/Tooltip';
import { createUser } from '../utils/Fetch';
import { UserProfileData } from '../utils/Interfaces';

const SignUpPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const usernameField = useValidationField('', isValidUsername, t('common.errors.invalidUsername'));
  const emailField = useValidationField('', isValidEmail, t('common.errors.invalidEmail'));
  const passwordField = useValidationField('', isValidPassword, t('common.errors.invalidPassword'));
  const pinField = useValidationField('', isValidPin, t('common.errors.invalidPIN'));

  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const passwordMismatch =
    passwordField.value &&
    confirmPassword &&
    passwordField.value !== confirmPassword;

  const pinMismatch =
    pinField.value &&
    confirmPin &&
    pinField.value !== confirmPin;

  const formFilled =
    usernameField.value !== '' &&
    emailField.value !== '' &&
    passwordField.value !== '' &&
    confirmPassword !== '' &&
    pinField.value !== '' &&
    confirmPin !== '' &&
    !usernameField.error &&
    !emailField.error &&
    !passwordField.error &&
    !pinField.error &&
    !passwordMismatch &&
    !pinMismatch;


	return (
		<main
		className="pageLayout"
		role="main"
		aria-labelledby="pageTitle"
		aria-describedby="pageDescription"
		>
		<AccessiblePageDescription
		id="pageDescription"
		text={t('pages.signUp.aria.description')}
		/>

		<div className="flex flex-col justify-center p-8">
			<h2 id="pageTitle" className="font-semibold text-center">
			{t('pages.signUp.title')}
			</h2>

			<GenericInput
			type="text"
			placeholder={t('common.placeholders.username')}
			aria-label={t('common.aria.inputs.username')}
			value={usernameField.value}
			onFilled={usernameField.onFilled}
			onBlur={usernameField.onBlur}
			errorMessage={usernameField.error}
			/>

			<GenericInput
			type="email"
			placeholder={t('common.placeholders.email')}
			aria-label={t('common.aria.inputs.email')}
			value={emailField.value}
			onFilled={emailField.onFilled}
			onBlur={emailField.onBlur}
			errorMessage={emailField.error}
			/>

			<GenericInput
			type="password"
			placeholder={t('common.placeholders.password')}
			aria-label={t('common.aria.inputs.password')}
			value={passwordField.value}
			onFilled={passwordField.onFilled}
			onBlur={passwordField.onBlur}
			errorMessage={passwordField.error}
			allowVisibility
			/>
			
			<GenericInput
			type="password"
			placeholder={t('common.placeholders.confirmPassword')}
			aria-label={t('common.aria.inputs.confirmPassword')}
			value={confirmPassword}
			onFilled={setConfirmPassword}
			errorMessage={
				passwordMismatch ? t('common.errors.passwordMismatch') : ''
			}
			allowVisibility
			/>

			<div className="relative inline-flex items-center">
			<GenericInput 
				type="password"
				placeholder={t('common.placeholders.pin')}
				aria-label={t('common.aria.inputs.pin')}
				value={pinField.value}
				onFilled={pinField.onFilled}
				onBlur={pinField.onBlur}
				errorMessage={pinField.error}
				allowVisibility
			/> 
			<div className="absolute right-[-30px]">
				<Tooltip text={t('common.tooltips.PINcode')} />
			</div>
			</div>

			<GenericInput
			type="password"
			placeholder={t('common.placeholders.confirmPin')}
			aria-label={t('common.aria.inputs.confirmPin')}
			value={confirmPin}
			onFilled={setConfirmPin}
			errorMessage={pinMismatch ? t('common.errors.pinMismatch') : ''}
			allowVisibility
			/>

			<GenericButton
			className="generic-button"
			text={t('common.buttons.signUp')}
			aria-label={t('common.aria.buttons.signUp')}
			disabled={!formFilled}
			onClick={async () => {
				const newUser: UserProfileData = {
				username: usernameField.value,
				email: emailField.value,
				password: passwordField.value,
				pinCode: pinField.value
				};
				const signUpData = await createUser(newUser);
				if (signUpData) {
				alert('Registered successfully!');
				console.log(signUpData);
				navigate('/signin');
				}
				else
				alert('Registration failed. Please try again.'); // what went wrong? 
			}}
			/>

			<p className="text-center text-sm translate-y-2">
			{t('pages.signUp.alreadyHaveAccount')}{' '}
			<Link
				to="/signin"
				className="underline hover:bg-black hover:text-white rounded-xl px-1 py-0.5 hover:no-underline"
				aria-label={t('pages.signUp.aria.signInLink')}
			>
				{t('pages.signUp.signInLink')}
			</Link>
			</p>
		</div>
		</main>
	);
};

export default SignUpPage; 