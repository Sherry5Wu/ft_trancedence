//pages/SignUp.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GenericButton } from '../components/GenericButton';
import { GenericInput } from "../components/GenericInput";
import { Toggle } from "../components/Toggle"
import { Menu } from '../components/Menu';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isOn, setIsOn] = useState(false);

  const formFilled =
    email.trim() !== '' &&
    username.trim() !== '' &&
    password !== '' &&
    confirmPassword !== '' &&
    pin !== '' &&
    confirmPin !== '' &&
    password === confirmPassword &&
    pin === confirmPin;

    const TWOFAMenuItems = [
    {label: '2FA', Button: (isOn: boolean) => <Toggle isOn={isOn} />, onClick: () => {setIsOn(!isOn)}}
    ]

  return (
    <div className="flex flex-col justify-center p-8 space-y-4 max-w-sm mx-auto">
      
      {/* Page title*/}
      <h3 className="font-semibold text-center">Sign Up</h3>
      
      {/* User inputs */}
      <GenericInput
        type="username"
        placeholder="Username"
        onFilled={setUsername}
      />
            <GenericInput
        type="email"
        placeholder="Email"
        onFilled={setEmail}
      />
      <GenericInput
        type="password"
        placeholder="Password"
        onFilled={setPassword}
      />
      <GenericInput
        type="password"
        placeholder="Confirm Password"
        onFilled={setConfirmPassword}
      />
      <GenericInput
        type="password"
        placeholder="Player PIN"
        onFilled={setPin}
      />
      <GenericInput
        type="password"
        placeholder="Confirm Player PIN"
        onFilled={setConfirmPin}
      /> 

      {/* Toggle 2FA with Google Authenticator */}  
      {/* <Menu aria-label='2fa button' elements={TWOFAMenuItems} className='menuIcon' /> */}
      <Toggle />

      {/* Sign up Button */}  
      <GenericButton
        className="generic-button"
        text="SIGN UP"
        disabled={!formFilled}
        onClick={() => {
          // Submit logic here
          alert('Registered successfully!');
          navigate('/homeuser');
        }}
      />

      {/* Sign in link */}
      <p className="text-center text-sm">
        Already have an account?{' '}
        <Link to="/signin" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignUpPage;
