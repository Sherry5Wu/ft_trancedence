//context/SingleMatchContext.tsx

import { createContext, useContext, useState, ReactNode } from "react";

interface MatchPlayer {
  id: string;
  username: string;
  photo: string;
}

interface SingleMatchContextType {
  tournamentTitle?: string,
  
  player: MatchPlayer[] | null;
  setPlayer: (player: MatchPlayer | null) => void;
  reset: () => void;
  addPlayer: () => void;
  removePlayer: (index: number) => void;
}

const SingleMatchContext = createContext<SingleMatchContextType | undefined>(undefined);

export const useSingleMatch = () => {
  const context = useContext(SingleMatchContext);
  if (!context) throw new Error("useSingleMatch must be used within SingleMatchProvider");
  return context;
};

export const SingleMatchProvider = ({ children }: { children: ReactNode }) => {
  const [firstPlayer, setFirstPlayer] = useState<MatchPlayer | null>(null);
  const [secondPlayer, setSecondPlayer] = useState<MatchPlayer | null>(null);

  const reset = () => {
    setFirstPlayer(null);
    setSecondPlayer(null);
  };

  return (
    <SingleMatchContext.Provider value={{ firstPlayer, setFirstPlayer, secondPlayer, setSecondPlayer, reset }}>
      {children}
    </SingleMatchContext.Provider>
  );
};






// import React, { createContext, useContext, useEffect, useState } from "react";

// type Player = {
//   id: string;
//   username: string;
//   photo: string;
// };

// type SingleMatchContextType = {
//   firstPlayer: Player | null;
//   secondPlayer: Player | null;
//   setFirstPlayer: (p: Player) => void;
//   setSecondPlayer: (p: Player) => void;
//   reset: () => void;
// };

// const defaultValue: SingleMatchContextType = {
//   firstPlayer: null,
//   secondPlayer: null,
//   setFirstPlayer: () => {},
//   setSecondPlayer: () => {},
//   reset: () => {},
// };

// const SingleMatchContext = createContext<SingleMatchContextType>(defaultValue);

// export const useSingleMatch = () => useContext(SingleMatchContext);

// export const SingleMatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [firstPlayer, setFirstPlayer] = useState<Player | null>(null);
//   const [secondPlayer, setSecondPlayer] = useState<Player | null>(null);

//   // Optional: Persist across refresh with sessionStorage
//   useEffect(() => {
//     const stored = sessionStorage.getItem("singleMatch");
//     if (stored) {
//       const parsed = JSON.parse(stored);
//       setFirstPlayer(parsed.firstPlayer || null);
//       setSecondPlayer(parsed.secondPlayer || null);
//     }
//   }, []);

//   useEffect(() => {
//     sessionStorage.setItem(
//       "singleMatch",
//       JSON.stringify({ firstPlayer, secondPlayer })
//     );
//   }, [firstPlayer, secondPlayer]);

//   const reset = () => {
//     setFirstPlayer(null);
//     setSecondPlayer(null);
//     sessionStorage.removeItem("singleMatch");
//   };

//   return (
//     <SingleMatchContext.Provider
//       value={{
//         firstPlayer,
//         secondPlayer,
//         setFirstPlayer,
//         setSecondPlayer,
//         reset,
//       }}
//     >
//       {children}
//     </SingleMatchContext.Provider>
//   );
// };

        // // context/SinglePlayerContext.tsx

// import React, { createContext, useContext, useState } from "react";

// type Player = {
//   id: string;
//   username: string;
//   photo: string;
// };

// type SinglePlayerContextType = {
//   player: Player | null;
//   setPlayer: (p: Player) => void;
//   reset: () => void;
// };

// const defaultValue: SinglePlayerContextType = {
//   player: null,
//   setPlayer: () => {},
//   reset: () => {},
// };

// const SinglePlayerContext = createContext<SinglePlayerContextType>(defaultValue);

// export const useSinglePlayer = () => useContext(SinglePlayerContext);

// export const SinglePlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [player, setPlayer] = useState<Player | null>(null);

//   const reset = () => setPlayer(null);

//   return (
//     <SinglePlayerContext.Provider value={{ player, setPlayer, reset }}>
//       {children}
//     </SinglePlayerContext.Provider>
//   );
// };
