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
    const coerced: Players = {
      ...newPlayer,
      id: newPlayer.id === 'guest' ? 'guest' : newPlayer.id,
      username: newPlayer.id === 'guest' ? 'guest' : newPlayer.username,
      playername: newPlayer.playername ?? newPlayer.username,
    };
    setPlayers((prev) => [...prev, coerced]);
  };

  const dicebearUrl = (seed: string) =>
  `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ffee8c&textColor=000000&fontFamily=Jost`;

  const setPlayer = (index: number, next: Players) => {
    setPlayers((prev) => {
      const updated = [...prev];
      const old = updated[index];
      if (!old) {
        const created: Players = {
          ...next,
          id: next.id === 'guest' ? 'guest' : next.id,
          username: next.id === 'guest' ? 'guest' : next.username,
          playername: next.playername ?? next.username,
          photo: next.photo?.includes('dicebear.com') && next.playername
            ? dicebearUrl(next.playername)
            : next.photo,
        };
        updated[index] = created;
        return updated;
      }
      updated[index] = {
        ...old,
        ...next,
        id: old.id,
        username: old.username,
        playername: next.playername ?? old.playername ?? old.username,
        photo:
          (old.photo?.includes('dicebear.com') && next.playername)
            ? dicebearUrl(next.playername)
            : (next.photo ?? old.photo),
      };
      return updated;
    });
  };

  const removePlayer = (userToRemove: string) => {
    setPlayers
    ((prevPlayers) => prevPlayers.filter((player) => player.id !== userToRemove))
  };

  // const name = (id: string, newUsername: string) => {
  //   setPlayers((prevPlayers) => {
  //       return prevPlayers.map((player) => {
  //           return player.id === id ? {...player, username: newUsername} : player;
  //       });
  //   })};
  const setPlayername = (id: string, newAlias: string) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newPhoto = p.photo?.includes('dicebear.com') ? dicebearUrl(newAlias) : p.photo;
        return { ...p, playername: newAlias, photo: newPhoto };
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
      setPlayername,
      resetPlayers,
      resetPlayerListOnly
    }}>
      {children}
    </PlayersContext.Provider>
  );
};