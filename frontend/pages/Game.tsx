// pages/Game.tsx
// render all players dynamically from the PlayersContext

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CloseButton } from '../components/CloseButton';
import { usePlayersContext } from '../context/PlayersContext';

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const { players, resetPlayers } = usePlayersContext();

  return (
    <div className="flex flex-col justify-center p-8 space-y-6 max-w-sm mx-auto">
      <CloseButton className="ml-auto" />

      <h3 className="font-semibold text-center">Game</h3>

{/* 
      {tournamentTitle && (
        <h4 className="text-center text-xl font-semibold text-blue-600">
          {tournamentTitle}
        </h4>
      )} */}

      {players.length === 0 ? (
        <p className="text-center text-gray-500">No players selected.</p>
      ) : (
        <div className="space-y-4">
          {players.map((player, index) => (
            <div key={player.id} className="border p-4 rounded shadow">
              <strong>Player {index + 1}:</strong> {player.username}
              {player.photo && (
                <img
                  src={player.photo}
                  alt={`Player ${index + 1}`}
                  className="profilePic mt-2"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <button
        className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
        onClick={() => {
          resetPlayers();
          navigate('/homeuser');
        }}
      >
        Reset Players
      </button>
    </div>
  );
};

export default GamePage;
