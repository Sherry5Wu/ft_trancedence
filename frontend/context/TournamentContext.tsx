import React, { createContext, useContext, useEffect, useState } from "react";

type Player = {
  id: string;
  username: string;
  photo: string;
};

type TournamentData = {
  title: string;
  numPlayers: number;
  players: (Player | null)[];
  setTitle: (title: string) => void;
  setNumPlayers: (num: number) => void;
  setPlayer: (index: number, player: Player) => void;
  reset: () => void;
};

const defaultData: TournamentData = {
  title: "",
  numPlayers: 0,
  players: [],
  setTitle: () => {},
  setNumPlayers: () => {},
  setPlayer: () => {},
  reset: () => {},
};

const TournamentContext = createContext<TournamentData>(defaultData);

export const useTournament = () => useContext(TournamentContext);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [title, setTitle] = useState("");
  const [numPlayers, setNumPlayers] = useState(0);
  const [players, setPlayers] = useState<(Player | null)[]>([]);

  // Load from sessionStorage on first mount
  useEffect(() => {
    const stored = sessionStorage.getItem("tournament");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTitle(parsed.title || "");
        setNumPlayers(parsed.numPlayers || 0);
        setPlayers(parsed.players || []);
      } catch (err) {
        console.warn("Failed to parse tournament from sessionStorage:", err);
      }
    }
  }, []);

  // Sync to sessionStorage on every update
  useEffect(() => {
    const data = { title, numPlayers, players };
    sessionStorage.setItem("tournament", JSON.stringify(data));
  }, [title, numPlayers, players]);

  const setPlayer = (index: number, player: Player) => {
    setPlayers((prev) => {
      const updated = [...prev];
      updated[index] = player;
      return updated;
    });
  };

  const reset = () => {
    setTitle("");
    setNumPlayers(0);
    setPlayers([]);
    sessionStorage.removeItem("tournament");
  };

  return (
    <TournamentContext.Provider
      value={{
        title,
        numPlayers,
        players,
        setTitle,
        setNumPlayers,
        setPlayer,
        reset,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};
