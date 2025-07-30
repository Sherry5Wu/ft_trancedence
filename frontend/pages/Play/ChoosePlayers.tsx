// // pages/Play/ChoosePlayers.tsx
// // user choose player 2 as Registed or Guest, if register the player should 'log in a player'

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { GenericInput } from "../../components/GenericInput";
import { useUserContext } from '../../context/UserContext';

const ChoosePlayersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserContext();

  const [player1, setPlayer1] = useState("");     // Editable input state
  const [player2, setPlayer2] = useState("");

  const [player2Type, setPlayer2Type] = useState<"registered" | "guest" | null>(null);
  const [isPlayer1Loading, setIsPlayer1Loading] = useState(true); // Optional loader

  useEffect(() => {
    // Simulate fetch for player 1 data
      setPlayer1(user?.username ?? "");
      setIsPlayer1Loading(false);
  }, [user]);

  const formFilled = player2.trim() !== "";

  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <div>
        <h3 className="font-semibold text-center">Choose players</h3>

        {/* Player 1 input - fetched and editable */}
        <GenericInput
          type="text"
          placeholder="Player 1"
          value={player1}
          onFilled={setPlayer1}
          disabled={isPlayer1Loading}
          showEditIcon={true}
        />

        {/* Player 2 type selection */}
        <div className="flex flex-wrap justify-center gap-6 mt-4">
          <GenericButton
            className={`generic-button ${player2Type === "registered" ? "" : "unclicked-button"}`}
            text="Registered"
            onClick={() => {
              setPlayer2Type("registered");
              navigate("/login-player");
            }}
          />
          <GenericButton
            className={`generic-button ${player2Type === "guest" ? "" : "unclicked-button"}`}
            text="Guest"
            onClick={() => {
              setPlayer2Type("guest");
              alert("Fill the guest player!");
            }}
          />
        </div>

        {/* Player 2 input - active only after choosing type */}
        {player2Type && ( //  conditionally render the Player 2
        <div className="mt-4">
        <GenericInput
          type="text"
          placeholder="Player 2"
          onFilled={setPlayer2}
          disabled={player2Type === null}
          showEditIcon={true} // <-- Always show edit icon if value is present
        />
      </div>
    )}
      </div>

      {/* Bottom buttons */}
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
          onClick={() => navigate('/ping-pong')}
        />
      </div>
    </div>
  );
};

export default ChoosePlayersPage;
