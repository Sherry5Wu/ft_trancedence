// pages/Play/ChoosePlayers.tsx
// user choose player 2 as Registed or Guest, if register the player should 'log in a player'

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { GenericButton } from '../../components/GenericButton';
// import { GenericInput } from '../../components/GenericInput';
// import { useUserContext } from '../../context/UserContext';
// import { useSingleMatch } from '../../context/SingleMatchContext';
// import { useValidationField } from '../../hooks/useValidationField';
// import { isValidAlias } from '../../utils/Validation';

// const ChoosePlayersPage: React.FC = () => {
//   const navigate = useNavigate();
//   const { user } = useUserContext();
//   const { secondPlayer } = useSingleMatch(); // Inject second player from context

//   const player1Field = useValidationField('', isValidAlias);
//   const player2Field = useValidationField('', isValidAlias);

//   const [player2Type, setPlayer2Type] = useState<"registered" | "guest" | null>(null);
//   const [isPlayer1Loading, setIsPlayer1Loading] = useState(true);

//   // Simulate fetch for player 1 data
//   useEffect(() => {
//     player1Field.setValue(user?.username ?? '');
//     setIsPlayer1Loading(false);
//   }, [user]);

//     // Inject Player 2 when context changes
//   useEffect(() => {
//     if (secondPlayer?.username) {
//       player2Field.setValue(secondPlayer.username);
//       setPlayer2Type("registered");
//     }
//   }, [secondPlayer]);

//   const aliasDuplicate =
//     player1Field.value.trim() !== '' &&
//     player2Field.value.trim() !== '' &&
//     player1Field.value.trim().toLowerCase() === player2Field.value.trim().toLowerCase();

//   const formFilled =
//     player1Field.value.trim() !== '' &&
//     player2Field.value.trim() !== '' &&
//     !player1Field.error &&
//     !player2Field.error &&
//     !aliasDuplicate;

//   return (
//     <div className="flex flex-col items-center p-8 space-y-6">
//       <div>
//         <h3 className="font-semibold text-center">Choose players</h3>

//         <GenericInput
//           type="text"
//           placeholder="Player 1"
//           value={player1Field.value}
//           onFilled={player1Field.onFilled}
//           onBlur={player1Field.onBlur}
//           errorMessage={
//             player1Field.error ||
//             (aliasDuplicate ? 'Player aliases must be different' : '')
//           }
//           disabled={isPlayer1Loading}
//           showEditIcon={true}
//         />

//         <div className="flex flex-wrap justify-center gap-6 mt-4">
//           <GenericButton
//             className={`generic-button ${player2Type === "registered" ? "" : "unclicked-button"}`}
//             text="Registered"
//             onClick={() => {
//               setPlayer2Type("registered");
//               // navigate("/login-player");
//                     navigate("/login-player", { state: { context: "single", playerIndex: 1 } });
//             }}
//           />
//           <GenericButton
//             className={`generic-button ${player2Type === "guest" ? "" : "unclicked-button"}`}
//             text="Guest"
//             onClick={() => {
//               setPlayer2Type("guest");
//               alert("Fill the guest player!");
//             }}
//           />
//         </div>

//         {player2Type && (
//           <div className="mt-4">
//             <GenericInput
//               type="text"
//               placeholder="Player 2"
//               value={player2Field.value}
//               onFilled={player2Field.onFilled}
//               onBlur={player2Field.onBlur}
//               errorMessage={
//                 player2Field.error ||
//                 (aliasDuplicate ? 'Player aliases must be different' : '')
//               }
//               disabled={player2Type === null}
//               showEditIcon={true}
//             />
//           </div>
//         )}
//       </div>

//       <div className="flex flex-wrap justify-center gap-6 mt-6">
//         <GenericButton
//           className="generic-button"
//           text="CANCEL"
//           onClick={() => navigate('/homeuser')}
//         />
//         <GenericButton
//           className="generic-button"
//           text="PLAY"
//           disabled={!formFilled}
//           onClick={() => navigate('/game')}
//         />
//       </div>
//     </div>
//   );
// };

// export default ChoosePlayersPage;




// pages/Play/ChoosePlayers.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { GenericInput } from '../../components/GenericInput';
import { useUserContext } from '../../context/UserContext';
import { useSingleMatch } from '../../context/SingleMatchContext';
import { useValidationField } from '../../hooks/useValidationField';
import { isValidAlias } from '../../utils/Validation';

const ChoosePlayersPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // ✅

  const { user } = useUserContext();
  // const { secondPlayer, setSecondPlayer } = useSingleMatch(); // ✅ Context read
const { firstPlayer, setFirstPlayer, secondPlayer, setSecondPlayer } = useSingleMatch();

  const player1Field = useValidationField('', isValidAlias);
  const player2Field = useValidationField('', isValidAlias);

  const [player2Type, setPlayer2Type] = useState<"registered" | "guest" | null>(null);


//   const [player2Type, setPlayer2Type] = useState<"registered" | "guest" | null>(() => {
//   if (secondPlayer?.username) return "registered";
//   return null;
// });

  const [isPlayer1Loading, setIsPlayer1Loading] = useState(true);

  useEffect(() => {
  if (user?.username) {
    player1Field.setValue(user.username);
    setFirstPlayer({
      id: user.username, // or some real unique ID if you have it
      username: user.username,
      photo: user.profilePic?.props?.src ?? '' // or user.profilePic.props.src if available
    });
  }
  setIsPlayer1Loading(false);
}, [user]);

  // ✅ Sync first player from user
  // useEffect(() => {
  //   player1Field.setValue(user?.username ?? '');
    
  //   setIsPlayer1Loading(false);
  // }, [user]);

  // ✅ Always re-apply second player if it exists
  // useEffect(() => {
  //   if (secondPlayer?.username) {
  //     player2Field.setValue(secondPlayer.username);
  //     setPlayer2Type("registered"); // <-- this was not persisting
  //   }
  // }, [secondPlayer]);

  // Sync player2Type with secondPlayer only if player2Type is null (not user-selected)
  React.useEffect(() => {

    console.log("Effect - secondPlayer or player2Type changed:", { secondPlayer, player2Type });

    if (player2Type === null) {
      if (secondPlayer?.username) {
        setPlayer2Type("registered");
      } else {
        setPlayer2Type(null);
      }
    }
  }, [secondPlayer, player2Type]);

  // Sync player2Field with secondPlayer
  React.useEffect(() => {

    console.log("Effect - syncing player2Field with secondPlayer:", secondPlayer?.username);

    if (secondPlayer?.username) {
      player2Field.setValue(secondPlayer.username);
    } else {
      player2Field.setValue('');
    }
  }, [secondPlayer]);

  const aliasDuplicate =
    player1Field.value.trim().toLowerCase() === player2Field.value.trim().toLowerCase() &&
    player1Field.value.trim() !== '';

  const formFilled =
    player1Field.value.trim() !== '' &&
    player2Field.value.trim() !== '' &&
    !player1Field.error &&
    !player2Field.error &&
    !aliasDuplicate;

  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <div>
        <h3 className="font-semibold text-center">Choose players</h3>

        <GenericInput
          type="text"
          placeholder="Player 1"
          value={player1Field.value}
          onFilled={player1Field.onFilled}
          onBlur={player1Field.onBlur}
          errorMessage={
            player1Field.error || 
            (aliasDuplicate ? 'Player aliases must be different' : '')}
          disabled={isPlayer1Loading}
          showEditIcon={true}
        />

        <div className="flex flex-wrap justify-center gap-6 mt-4">
          <GenericButton
            className={`generic-button ${player2Type === "registered" ? "" : "unclicked-button"}`}
            text="Registered"
            onClick={() => {
              navigate("/login-player", {
              state: { context: "single", playerIndex: 1, returnTo: "/choose-players" },
              });
            }}
          />
          <GenericButton
            className={`generic-button ${player2Type === "guest" ? "" : "unclicked-button"}`}
            text="Guest"
            onClick={() => {
              setPlayer2Type("guest");
              player2Field.setValue(""); // Clear input
              setSecondPlayer(null);     // Clear context (registered player)
              alert("Fill the guest player!");
            }}
          />
        </div>

        {player2Type && (
          <div className="mt-4">
            <GenericInput
              type="text"
              placeholder="Player 2"
              value={player2Field.value}
              onFilled={player2Field.onFilled}
              onBlur={player2Field.onBlur}
              errorMessage={
                player2Field.error ||
                (aliasDuplicate ? 'Player aliases must be different' : '')
              }
              showEditIcon={true}
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-6 mt-6">
        <GenericButton
          className="generic-button"
          text="CANCEL"
          onClick={() => navigate('/homeuser')}
        />
        <GenericButton
          className="generic-button"
          text="PLAY"
          disabled={!formFilled}
          onClick={() => navigate('/game')}
        />
      </div>
    </div>
  );
};

export default ChoosePlayersPage;