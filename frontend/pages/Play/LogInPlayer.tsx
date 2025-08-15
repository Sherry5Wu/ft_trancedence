// pages/Play/LogInPlayer.tsx
// registered user logs in with username and player PIN as a 2nd player
// game data will be stored on database

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { GenericButton } from '../../components/GenericButton';
// import { GenericInput} from "../../components/GenericInput";
// import { useValidationField } from '../../hooks/useValidationField';
// import { isValidUsername, isValidPin } from '../../utils/Validation';

// const LogInPlayerPage: React.FC = () => {
//   const navigate = useNavigate();

//   const usernameField = useValidationField('', isValidUsername);
//   const pinField = useValidationField('', isValidPin);

//   const formFilled =
//     usernameField.value !== '' &&
//     pinField.value !== '';

//   return (
//     <div className="flex flex-col items-center p-8 space-y-6">
//       <div>

//       <h3 className="font-semibold text-center">Log in a player</h3>

//       <GenericInput
//         type="username"
//         placeholder="Username"
//         value={usernameField.value}
//         onFilled={usernameField.onFilled}
//         onBlur={usernameField.onBlur}
//         errorMessage={usernameField.error}
//       />

//       <GenericInput
//         type="password"
//         placeholder="Player PIN"
//         value={pinField.value}
//         onFilled={pinField.onFilled}
//         onBlur={pinField.onBlur}
//         errorMessage={pinField.error}
//       />

//       {/* OK Button */}
//       <GenericButton
//         className="generic-button"
//         text="OK"
//         disabled={!formFilled}
//         onClick={() => { navigate(-1);}} //  go to the previous page in React Router without explicitly defining the path
//       />
//       </div>
//     </div>
//   );
// };

// export default LogInPlayerPage;


// // pages/Play/LogInPlayer.tsx
// import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { GenericButton } from '../../components/GenericButton';
// import { GenericInput } from '../../components/GenericInput';
// import { useValidationField } from '../../hooks/useValidationField';
// import { isValidUsername, isValidPin } from '../../utils/Validation';
// import { useSingleMatch } from '../../context/SingleMatchContext';
// import { useTournament } from '../../context/TournamentContext';

// const LogInPlayerPage: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const usernameField = useValidationField('', isValidUsername);
//   const pinField = useValidationField('', isValidPin);

//   const formFilled = usernameField.value !== '' && pinField.value !== '';

//   const { setSecondPlayer } = useSingleMatch();
//   const { setPlayer } = useTournament();

//   const handleSubmit = async () => {
//     const contextType = location.state?.context;
//     const playerIndex = location.state?.playerIndex ?? 1;

//     try {
//       // Simulate API call
//       const response = await fakeFetchPlayer(usernameField.value, pinField.value);

//       const player = {
//         id: response.id,
//         username: response.username,
//         photo: response.photo,
//       };

//       if (contextType === "single") {
//         setSecondPlayer(player);
//       } else if (contextType === "tournament") {
//         setPlayer(playerIndex, player);
//       }

//       navigate(-1); // Go back to previous page
//     } catch (err) {
//       alert("Invalid login.");
//     }
//   };

//   return (
//     <div className="flex flex-col items-center p-8 space-y-6">
//       <h3 className="font-semibold text-center">Log in a player</h3>

//       <GenericInput
//         type="text"
//         placeholder="Username"
//         value={usernameField.value}
//         onFilled={usernameField.onFilled}
//         onBlur={usernameField.onBlur}
//         errorMessage={usernameField.error}
//       />

//       <GenericInput
//         type="password"
//         placeholder="Player PIN"
//         value={pinField.value}
//         onFilled={pinField.onFilled}
//         onBlur={pinField.onBlur}
//         errorMessage={pinField.error}
//       />

//       <GenericButton
//         className="generic-button"
//         text="OK"
//         disabled={!formFilled}
//         onClick={handleSubmit}
//       />
//     </div>
//   );
// };

// export default LogInPlayerPage;

// // Temporary fake fetch function (replace with actual API)
// const fakeFetchPlayer = async (username: string, pin: string) => {
//   await new Promise((r) => setTimeout(r, 500)); // simulate delay
//   return {
//     id: Date.now().toString(),
//     username,
//     photo: `https://api.dicebear.com/6.x/initials/svg?seed=${username}`,
//   };
// };



// // pages/Play/LogInPlayer.tsx

// import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { GenericButton } from '../../components/GenericButton';
// import { GenericInput } from '../../components/GenericInput';
// import { useValidationField } from '../../hooks/useValidationField';
// import { isValidUsername, isValidPin } from '../../utils/Validation';
// import { useSingleMatch } from '../../context/SingleMatchContext';
// import { useTournament } from '../../context/TournamentContext';

// const LogInPlayerPage: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const usernameField = useValidationField('', isValidUsername);
//   const pinField = useValidationField('', isValidPin);
//   const formFilled = usernameField.value !== '' && pinField.value !== '';

//   const { setSecondPlayer } = useSingleMatch();
//   const { setPlayer } = useTournament();

//   // Get parameters from router state
//   const contextType: 'single' | 'tournament' = location.state?.context;
//   const playerIndex: number = location.state?.playerIndex ?? 1;
//   const returnTo: string = location.state?.returnTo ?? '/';

//   const handleSubmit = async () => {
//     try {
//       const response = await fakeFetchPlayer(usernameField.value, pinField.value);

//       const player = {
//         id: response.id,
//         username: response.username,
//         photo: response.photo,
//       };

//       if (contextType === 'single') {
//         setSecondPlayer(player);
//       } else if (contextType === 'tournament') {
//         setPlayer(playerIndex, player);
//       }

//       // Go back to previous or redirect to a specific route
//       navigate(returnTo);
//     } catch (err) {
//       alert('Invalid login.');
//     }
//   };

//   return (
//     <div className="flex flex-col items-center p-8 space-y-6">
//       <h3 className="font-semibold text-center">Log in a player</h3>

//       <GenericInput
//         type="text"
//         placeholder="Username"
//         value={usernameField.value}
//         onFilled={usernameField.onFilled}
//         onBlur={usernameField.onBlur}
//         errorMessage={usernameField.error}
//       />

//       <GenericInput
//         type="password"
//         placeholder="Player PIN"
//         value={pinField.value}
//         onFilled={pinField.onFilled}
//         onBlur={pinField.onBlur}
//         errorMessage={pinField.error}
//       />

//       <GenericButton
//         className="generic-button"
//         text="OK"
//         disabled={!formFilled}
//         onClick={handleSubmit}
//       />
//     </div>
//   );
// };

// export default LogInPlayerPage;

// // Temporary fake fetch function (replace with actual API)
// const fakeFetchPlayer = async (username: string, pin: string) => {
//   await new Promise((r) => setTimeout(r, 500)); // simulate delay
//   return {
//     id: Date.now().toString(),
//     username,
//     photo: `https://api.dicebear.com/6.x/initials/svg?seed=${username}`,
//   };
// };


// pages/Play/LogInPlayer.tsx

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { GenericInput } from '../../components/GenericInput';
import { useValidationField } from '../../hooks/useValidationField';
import { isValidUsername, isValidPin } from '../../utils/Validation';
import { usePlayersContext } from '../../context/PlayersContext';

const LogInPlayerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const usernameField = useValidationField('', isValidUsername);
  const pinField = useValidationField('', isValidPin);
  const formFilled = usernameField.value !== '' && pinField.value !== '';

  const { addPlayer, removePlayer, players } = usePlayersContext();

  const contextType: 'generic' | 'tournament' = location.state?.context || 'generic';
  const playerIndex: number = location.state?.playerIndex ?? 1;
  const returnTo: string = location.state?.returnTo ?? '/';

  const handleSubmit = async () => {
    try {
      const response = await fakeFetchPlayer(usernameField.value, pinField.value);

      const player = {
        id: response.id,
        username: response.username,
        photo: response.photo,
      };

      // Remove existing player at same index (if needed)
      if (players.length > playerIndex) {
        removePlayer(players[playerIndex].id);
      }

      addPlayer(player);
      navigate(returnTo);
    } catch (err) {
      alert('Invalid login.');
    }
  };

  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <h3 className="font-semibold text-center">Log in a player</h3>

      <GenericInput
        type="text"
        placeholder="Username"
        value={usernameField.value}
        onFilled={usernameField.onFilled}
        onBlur={usernameField.onBlur}
        errorMessage={usernameField.error}
      />

      <GenericInput
        type="password"
        placeholder="Player PIN"
        value={pinField.value}
        onFilled={pinField.onFilled}
        onBlur={pinField.onBlur}
        errorMessage={pinField.error}
      />

      <GenericButton
        className="generic-button"
        text="OK"
        disabled={!formFilled}
        onClick={handleSubmit}
      />
    </div>
  );
};

export default LogInPlayerPage;

// Temporary fake fetch function (replace with actual API)
const fakeFetchPlayer = async (username: string, pin: string) => {
  await new Promise((r) => setTimeout(r, 500)); // simulate delay
  return {
    id: Date.now().toString(),
    username,
    photo: `https://api.dicebear.com/6.x/initials/svg?seed=${username}`,
  };
};
