// pages/Tornament/TournamentNew.tsx


// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { GenericButton } from '../../components/GenericButton';
// import { GenericInput } from "../../components/GenericInput";
// import { TopDownButton } from '../../components/TopDownButton';

// const NewTournamentPage: React.FC = () => {
//   const navigate = useNavigate();

//     const [title, setTitle] = useState("");
//     const [totalPlayers, setTotalPlayers] = useState("");
//     const formFilled = title.trim() !== "";

//   return ( 
//       <div className="flex flex-col items-center p-8 space-y-6">
//         <h3 className="font-semibold text-center">New tournament</h3>
        
//         <div>
//         {/* User inputs */}
//         <GenericInput
//         type="text"
//         placeholder="Tournament title"
//         onFilled={title}
//         />
//         <TopDownButton
//           label="Total players"
//           options={["2 Players", "4 Players", "8 Players"]}
//           onSelect={(value) => console.log("User chose:", value)}
//         />
//         </div>

//       {/* CANCEL and NEXT Button */}
//       <div className="flex flex-wrap justify-center gap-4 mt-4">
//       <GenericButton
//         className="generic-button"
//         text="CANCEL"
//         disabled={false}
//         onClick={() => { navigate('/tournaments');}}
//       />
//       <GenericButton
//         className="generic-button"
//         text="NEXT"
//         disabled={!formFilled}
//         onClick={() => { navigate('/tournaments/new/players');}}
//       />
//     </div>
// </div>
//    );
// };

// export default NewTournamentPage;


// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { GenericButton } from '../../components/GenericButton';
// import { GenericInput } from '../../components/GenericInput';
// import { TopDownButton } from '../../components/TopDownButton';
// import { UserProfileBadge } from '../../components/UserProfileBadge';
// import { ProfilePic } from '../../components/ProfilePic';

// const NewTournamentPage: React.FC = () => {
//   const navigate = useNavigate();

//   const [title, setTitle] = useState('');
//   const [totalPlayers, setTotalPlayers] = useState<number | null>(null);
//   const [players, setPlayers] = useState<string[]>([]);

//   // Helper: Check if all player names are filled
//   const allPlayersFilled =
//     totalPlayers !== null &&
//     players.length === totalPlayers &&
//     players.every((name) => name.trim() !== '');

//   const formFilled = title.trim() !== '' && allPlayersFilled;

//   const handlePlayerNameChange = (index: number, name: string) => {
//     setPlayers((prev) => {
//       const updated = [...prev];
//       updated[index] = name;
//       return updated;
//     });
//   };

//   const handlePlayerCountSelect = (value: string) => {
//     const num = parseInt(value);
//     setTotalPlayers(num);
//     setPlayers(Array(num).fill('')); // Reset players list
//   };

//   return (
//     <div className="flex flex-col items-center p-8 space-y-6">
//       <h3 className="font-semibold text-center">New tournament</h3>

//       {/* Input section */}
//       <div className="space-y-4">
//         <GenericInput
//           type="text"
//           placeholder="Tournament title"
//           value={title}
//           onFilled={setTitle}
//         />

//         <TopDownButton
//           label="Total players"
//           options={['4', '8', '16']}
//           onSelect={handlePlayerCountSelect}
//         />
//       </div>

//       {/* Render player name inputs */}
//       {totalPlayers !== null && (
//         <div className="flex flex-col items-center space-y-3 mt-6">
//           {Array.from({ length: totalPlayers }).map((_, idx) => (
//             <ProfilePic
//               key={idx}
//               index={idx}
//               value={players[idx]}
//               onChange={(name: string) => handlePlayerNameChange(idx, name)}
//             />
//           ))}
//         </div>
//       )}

//       {/* Buttons */}
//       <div className="flex flex-wrap justify-center gap-4 mt-6">
//         <GenericButton
//           className="generic-button"
//           text="CANCEL"
//           onClick={() => navigate('/tournaments')}
//         />
//         <GenericButton
//           className="generic-button"
//           text="NEXT"
//           disabled={!formFilled}
//           onClick={() => {
//             navigate('/tournaments/new/players');
//             // go to next page and store data in context/state ?
//           }}
//         />
//       </div>
//     </div>
//   );
// };

// export default NewTournamentPage;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { GenericInput } from '../../components/GenericInput';
import { TopDownButton } from '../../components/TopDownButton';
import UserProfileBadge from '../../components/UserProfileBadge';

const NewTournamentPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [totalPlayers, setTotalPlayers] = useState<number | null>(null);
  const [players, setPlayers] = useState<(null | { photoUrl?: string })[]>([]);

  const formFilled =
    title.trim() !== '' &&
    totalPlayers !== null &&
    players.length === totalPlayers &&
    players.every((p) => p !== null);

  const handlePlayerCountSelect = (value: string) => {
    const num = parseInt(value);
    setTotalPlayers(num);
    setPlayers(Array(num).fill(null)); // reset players
  };

    const handlePlayerClick = (index: number) => {
    setPlayers((prev) => {
        const updated = [...prev];
        updated[index] = updated[index] ? null : { photoUrl: undefined }; // Simulate toggling user
        return updated;
    });
    };

  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <h3 className="font-semibold text-center">New tournament</h3>

      <div className="space-y-4">
        <GenericInput
          type="text"
          placeholder="Tournament title"
          value={title}
          onFilled={setTitle}
        />

        <TopDownButton
          label="Total players"
          options={['4', '8', '16']}
          onSelect={handlePlayerCountSelect}
        />
      </div>

      {/* Player slots */}
      {totalPlayers !== null && (
        <div className="grid grid-cols-4 gap-4 mt-6">
          {players.map((player, idx) => (
            <UserProfileBadge
              key={idx}
              user={player}
              onClick={() => handlePlayerClick(idx)}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4 mt-6">
        <GenericButton
          className="generic-button"
          text="CANCEL"
          onClick={() => navigate('/tournaments')}
        />
        <GenericButton
          className="generic-button"
          text="NEXT"
          disabled={!formFilled}
          onClick={() => {
            navigate('/tournaments/new/players');
            // Optionally: store `players` in context or temp state
          }}
        />
      </div>
    </div>
  );
};

export default NewTournamentPage;
