import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloseButton } from '../components/CloseButton';
import GameCanvas from '../game/main';
import { usePlayersContext } from '../context/PlayersContext'

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { players, resetPlayers } = usePlayersContext();
  const p1Name = players[0]?.username ?? 'Player 1';
  const p2Name = players[1]?.username ?? 'Player 2';
  const isTournament = false; //Get the real value from the context after done

  return (
    <div className="flex flex-col items-center pt-4 p-8 space-y-4">
      <div className="w-9/10 mx-auto">
        {/* Game Container */}
        <div className="relative w-full pb-[56.25%] bg-yellow-200 p-3 rounded-3xl overflow-hidden">
          {/* Babylon.js Game Logic */}
          <GameCanvas
          canvasRef={canvasRef}
          playerNames={[p1Name, p2Name]}
          isTournament={isTournament}
          />

          {/* Babylon.js Canvas */}
          <canvas
            ref={canvasRef}
            id="renderCanvas"
            className="absolute top-0 left-0 w-full h-full"
          />

          {/* UI Overlay Elements */}
          <div
            id="startPrompt"
            className="absolute top-1/3 left-1/2 transform -translate-x-1/2 text-white font-sans text-lg z-10 pointer-events-none"
          >
            Press Space to start
          </div>
          <div
            id="scoreBoard"
            className="absolute top-2 left-1/2 transform -translate-x-1/2 font-mono text-xl text-green-700 z-10 pointer-events-none"
          >
            {p1Name}: 0 | {p2Name}: 0
          </div>
          <div
             id="endOverlay"
             className="absolute inset-0 pointer-events-none"
           />
           <div
             id="pauseOverlay"
            style={{ visibility: 'hidden' }}
            className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white font-sans z-20 pointer-events-none"
          >
            <div className="text-4xl font-bold mb-2">Game Paused</div>
            <div className="text-base opacity-75">Press Space to continue</div>
          </div>
        </div>
        {/* Controls */}
        <div
        className="mt-4 rounded-2xl bg-black text-white border border-white/10 p-4"
        role="note"
        aria-label="Game controls"
        >
        <div className="grid gap-3 sm:grid-cols-2 text-sm text-zinc-700 dark:text-zinc-300">
            <div>
              <div className="font-medium mb-1">{p1Name}</div>
              <ul className="space-y-1">
                <li>
                  Move:&nbsp;
                  <kbd className="inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-xs font-mono shadow-sm">
                    W
                  </kbd>
                  &nbsp;/&nbsp;
                  <kbd className="inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-xs font-mono shadow-sm">
                    S
                  </kbd>
                </li>
                <li>
                  Boost:&nbsp;
                  <kbd className="inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-xs font-mono shadow-sm">
                    A
                  </kbd>
                </li>
              </ul>
            </div>
            <div className="sm:justify-self-end sm:text-right">
              <div className="font-medium mb-1">{p2Name}</div>
              <ul className="space-y-1">
                <li>
                  Move:&nbsp;
                  <kbd className="inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-xs font-mono shadow-sm">↑</kbd>
                  &nbsp;/&nbsp;
                  <kbd className="inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-xs font-mono shadow-sm">↓</kbd>
                </li>
                <li>
                  Boost:&nbsp;
                  <kbd className="inline-flex items-center justify-center rounded-md border px-1.5 py-0.5 text-xs font-mono shadow-sm">→</kbd>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
