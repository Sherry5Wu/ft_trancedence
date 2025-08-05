import { createContext, useContext, useState, ReactNode } from "react";

interface Players {
  id: string;
  username: string;
  photo: string;
}

interface PlayersContextType {
    tournamentTitle?: string,
    setTitle?: (newTitle: string) => void;
    players: Players[];
    setPlayerUsername: (id: string, newUsername: string) => void;
    addPlayer: (player: Players) => void;
    removePlayer: (id: string) => void;
    resetPlayers: () => void;
    setPlayer: (index: number, player: Players) => void;
}

const PlayersContext = createContext<PlayersContextType | undefined>(undefined);

export const usePlayersContext = () => {
  const context = useContext(PlayersContext);
  if (!context)
    throw new Error('Invalid use of playersContext');
  return context;
};

export const PlayersProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<Players[]>([]);
  const [tournamentTitle, setTournamentTitle] = useState('');

  const addPlayer = (newPlayer: Players) => {
    setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
  };

  const removePlayer = (userToRemove: string) => {
    setPlayers((prevPlayers) => prevPlayers.filter((player) => player.id !== userToRemove))
  };

  const setPlayerUsername = (id: string, newUsername: string) => {
    setPlayers((prevPlayers) => {
        return prevPlayers.map((player) => {
            return player.id === id ? {...player, username: newUsername} : player;
        });
    })};

  const resetPlayers = () => {
    setPlayers([]);
  };

  const setTitle = (newTitle: string) => {
    setTournamentTitle(newTitle);
  };

  const setPlayer = (index: number, player: Players) => {
    setPlayers((prevPlayers) => {
      const updated = [...prevPlayers];
      updated[index] = player;
      return updated;
    });
  };

  return (
    <PlayersContext.Provider value={{ players, tournamentTitle, addPlayer, removePlayer, setPlayerUsername, setTitle, resetPlayers, setPlayer, }}>
      {children}
    </PlayersContext.Provider>
  );
};