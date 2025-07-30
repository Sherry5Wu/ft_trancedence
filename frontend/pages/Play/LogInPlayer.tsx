// pages/Play/LogInPlayer.tsx
// registered user logs in with username and player PIN as a 2nd player
// game data will be stored on database

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { GenericInput} from "../../components/GenericInput";


const LogInPlayerPage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const formFilled = name.trim() !== "" && password.trim() !== "";

  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <div>
        {/* Page title */}
        <h3 className="font-semibold text-center">
          Log in a player</h3>

      {/* User inputs */}
      <GenericInput
        type="text"
        placeholder="Username"
        onFilled={setUsername}
      />
      <GenericInput
        type="password"
        placeholder="Player PIN"
        onFilled={setPassword}
      />

      {/* OK Button */}
      <GenericButton
        className="generic-button"
        text="OK"
        disabled={!formFilled}
        onClick={() => { navigate(-1);}} //  go to the previous page in React Router without explicitly defining the path
      />
      </div>
    </div>
  );
};

export default LogInPlayerPage;
