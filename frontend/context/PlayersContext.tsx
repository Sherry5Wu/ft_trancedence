// context/PlayersContext.tsx

import { createContext, useContext, useState, ReactNode } from "react";
import { Players, PlayersContextType } from "../utils/Interfaces";

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
  const [totalPlayers, setTotalPlayers] = useState<number | undefined>(undefined);

  const [isTournament, setIsTournament] = useState(false);

  const addPlayer = (newPlayer: Players) => {
    setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
  };

  const setPlayer = (index: number, player: Players) => {
    setPlayers((prevPlayers) => {
      const updated = [...prevPlayers];
      updated[index] = player;
      return updated;
    });
  };

  const removePlayer = (userToRemove: string) => {
    setPlayers((prevPlayers) => prevPlayers.filter((player) => player.id !== userToRemove))
  };

  // const setPlayerUsername = (id: string, newUsername: string) => {
  //   setPlayers((prevPlayers) => {
  //       return prevPlayers.map((player) => {
  //           return player.id === id ? {...player, username: newUsername} : player;
  //       });
  //   })};
  const setPlayerUsername = (id: string, newUsername: string) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => {
        if (player.id === id) {
          const updatedPhoto = player.photo?.includes('dicebear.com')
            ? `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(newUsername)}`
            : player.photo;
  
          return {
            ...player,
            username: newUsername,
            photo: updatedPhoto,
          };
        }
        return player;
      })
    );
  };
  

  const resetPlayers = () => {
    setPlayers([]);
    setTotalPlayers(undefined);
    setTournamentTitle('');
  };

  const resetPlayerListOnly = () => {
    setPlayers([]);
  };

  const setTitle = (newTitle: string) => {
    setTournamentTitle(newTitle);
  };

  return (
    <PlayersContext.Provider value={{
      players,
      tournamentTitle,
      totalPlayers,
      isTournament,
      setIsTournament,
      setTitle,
      setTotalPlayers,
      setPlayer,
      addPlayer,
      removePlayer,
      setPlayerUsername,
      resetPlayers,
      resetPlayerListOnly
    }}>
      {children}
    </PlayersContext.Provider>
  );
};