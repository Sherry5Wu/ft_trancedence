// pages/SignIn.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useState } from "react";
import { GenericButton } from '../components/GenericButton';
import { GenericInput} from "../components/GenericInput";

const SignInPage: React.FC = () => {
  const navigate = useNavigate(); // to access other pages

  const [name, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const formFilled = name.trim() !== "" && password.trim() !== "";

  return (
    <div className="flex flex-col justify-center p-8 space-y-4 max-w-sm mx-auto">
      
      {/* Page title*/}
      <h3 className="font-semibold text-center">Sing In</h3>

      {/* User inputs */}
      <GenericInput
        type="text"
        placeholder="Username"
        onFilled={setUsername}
      />
      <GenericInput
        type="password"
        placeholder="Password"
        onFilled={setPassword}
      />

      {/* Log in Button */}
      <GenericButton
        className="generic-button"
        text="LOG IN"
        disabled={!formFilled}
        onClick={() => { navigate('/homeuser')}}
      />

      {/* GoogleLogin Button */}

      {/* Sign up link */}
      <p className="text-center text-sm">
        Not registered?{' '}
        <Link to="/signup" className="text: underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default SignInPage;
