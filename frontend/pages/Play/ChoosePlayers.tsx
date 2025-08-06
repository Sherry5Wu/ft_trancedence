// pages/Play/ChoosePlayers.tsx
// user choose player 2 as Registed or Guest, if register the player should 'log in a player'

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { GenericInput } from '../../components/GenericInput';
import { useUserContext } from '../../context/UserContext';
import { useValidationField } from '../../hooks/useValidationField';
import { isValidAlias } from '../../utils/Validation';

const ChoosePlayersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();

  const player1Field = useValidationField('', isValidAlias);
  const player2Field = useValidationField('', isValidAlias);

  const [player2Type, setPlayer2Type] = useState<"registered" | "guest" | null>(null);
  const [isPlayer1Loading, setIsPlayer1Loading] = useState(true);

  // Simulate fetch for player 1 data
  useEffect(() => {
    player1Field.setValue(user?.username ?? '');
    setIsPlayer1Loading(false);
  }, [user]);

  const aliasDuplicate =
    player1Field.value.trim() !== '' &&
    player2Field.value.trim() !== '' &&
    player1Field.value.trim().toLowerCase() === player2Field.value.trim().toLowerCase();

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
              disabled={player2Type === null}
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