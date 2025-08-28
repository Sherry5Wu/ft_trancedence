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

  const dicebearUrl = (seed: string) =>
  `https://api.dicebear.com/6.x/initials/png?seed=${encodeURIComponent(seed)}&backgroundColor=ffee8c&textColor=000000`;

  const safePhoto = (photo: unknown, seed: string) => {
    return (typeof photo === 'string' && photo.trim() !== '')
      ? photo
      : dicebearUrl(seed);
  };

  const safeSeed = (p: Partial<Players>) =>
    p.playername ?? p.username ?? 'Player';
  
  const addPlayer = (newPlayer: Players) => {
    const coerced: Players = {
      ...newPlayer,
      id: newPlayer.id === 'guest' ? 'guest' : newPlayer.id,
      username: newPlayer.id === 'guest' ? 'guest' : newPlayer.username,
      playername: newPlayer.playername ?? newPlayer.username,
      photo: safePhoto(newPlayer.photo, safeSeed(newPlayer)),
    };
    setPlayers(prev => [...prev, coerced]);
  };

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
          photo: (typeof next.photo === 'string' && next.photo.includes('dicebear.com') && next.playername)
            ? dicebearUrl(next.playername)
            : safePhoto(next.photo, next.playername ?? next.username ?? 'Player'),
        };
        updated[index] = created;
        return updated;
      }

      const replacing = next.id && next.id !== old.id;

      updated[index] = replacing
        ? {
            ...old,
            ...next,
            id: next.id === 'guest' ? 'guest' : next.id,
            username: next.id === 'guest' ? 'guest' : (next.username ?? old.username),
            playername: next.playername ?? next.username ?? old.playername ?? old.username,
            photo:
              (typeof next.photo === 'string' && next.photo.includes('dicebear.com') && (next.playername ?? next.username))
                ? dicebearUrl(next.playername ?? next.username!)
                : safePhoto(next.photo ?? old.photo, next.playername ?? next.username ?? old.playername ?? old.username),
          }
        : {
            ...old,
            ...next,
            id: old.id,
            username: old.username,
            playername: next.playername ?? old.playername ?? old.username,
            photo:
              (typeof old.photo === 'string' && old.photo.includes('dicebear.com') && next.playername)
                ? dicebearUrl(next.playername)
                : safePhoto(next.photo ?? old.photo, next.playername ?? old.playername ?? old.username),
          };

      return updated;
    });
  };

  const removePlayer = (userToRemove: string) => {
    setPlayers
    ((prevPlayers) => prevPlayers.filter((player) => player.id !== userToRemove))
  };

  const setPlayername = (id: string, newAlias: string) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const isDicebear = typeof p.photo === 'string' && p.photo.includes('dicebear.com');
        const newPhoto = isDicebear ? dicebearUrl(newAlias) : p.photo;
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