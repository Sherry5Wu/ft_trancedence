// // pages/Tornament/TournamentMain.tsx
// // tournament list history in a dropdown layout
// // user can create a new tournament or go back

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { GenericButton } from '../../components/GenericButton';
// import DownArrow from '../../assets/noun-down-arrow-down-1144832.svg?react';
// import ToBeDoneBracket from '../../components/ToBeDoneBracket';

// const TournamentsPage: React.FC = () => {
//   const navigate = useNavigate();

//   // Mocked tournament data
//   interface TournamentStats {
//     title: string;
//     date: string; // verify w/ backend, format: 'MM/DD/YY'
//     totalPlayers: number;
//     finalWinner: string;
//     // ...
//   }

//   const mockTournament: TournamentStats[] = [
//     { title: 'abc', date: '01/01/25', totalPlayers: 4, finalWinner: 'Lily' },
//     { title: 'BIG', date: '11/11/11', totalPlayers: 8, finalWinner: 'Bob' },
//     { title: 'Alpha Cup', date: '03/15/24', totalPlayers: 16, finalWinner: 'Charlie' },
//     { title: 'Champ Clash', date: '02/10/24', totalPlayers: 8, finalWinner: 'Alice' },
//     { title: 'Zeta Games', date: '05/05/25', totalPlayers: 4, finalWinner: 'Anna' },
//     { title: 'Delta Smash', date: '06/06/25', totalPlayers: 16, finalWinner: 'Nina' },
//     { title: 'Rocket Royale', date: '04/21/24', totalPlayers: 8, finalWinner: 'Kate' },
//     { title: 'Pixel Fight', date: '07/01/25', totalPlayers: 8, finalWinner: 'Oskari' },
//     { title: 'Turbo Cup', date: '12/12/24', totalPlayers: 4, finalWinner: 'Lily' },
//     { title: 'Omega Clash', date: '09/09/24', totalPlayers: 4, finalWinner: 'Bob' },
//     { title: 'Gamma Gala', date: '08/08/24', totalPlayers: 4, finalWinner: 'Bob' },
//     { title: 'Knight Knockout', date: '10/10/25', totalPlayers: 8, finalWinner: 'Alice' },
//   ];

//   const [sort, setSort] = useState<'title' | 'date' | 'finalWinner'>('title');
//   const [visibleTournamentsCount, setVisibleTournamentsCount] = useState(5);
//   const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

//   const sortTournaments = [...mockTournament].sort((a, b) => {
//     if (sort === 'date') {
//       const [aMonth, aDay, aYear] = a.date.split('/').map(Number);
//       const [bMonth, bDay, bYear] = b.date.split('/').map(Number);
//       const dateA = new Date(2000 + aYear, aMonth - 1, aDay);
//       const dateB = new Date(2000 + bYear, bMonth - 1, bDay);
//       return dateB.getTime() - dateA.getTime(); // most recent first
//     }
//     return a[sort].localeCompare(b[sort]);
//   });

//   const visibleTournaments = sortTournaments.slice(0, visibleTournamentsCount);


//   if (sortTournaments.length === 0) {
//     return (
//       <div aria-label="empty leaderboard" className='bg-[#FFEE8C] rounded-full text-center'>
//         No tournament to show.
//       </div>
//     );
//   }

  
//   return (
//     <div className="flex flex-col items-center p-8 space-y-6">

//       <h3 className="font-semibold text-center" aria-label="Tournament title" >
//         Tournament list
//       </h3>


//       {/* Sort Dropdown */}
//       {/* <div className="flex ">
//         <label className="mr-2 font-semibold">Sort by:</label>
//         <select
//           value={sort}
//           onChange={(e) => {
//             setSort(e.target.value as 'title' | 'date' | 'finalWinner');
//           }}
//         >
//           <option value="title">Title (A-Z)</option>
//           <option value="date">Date </option>
//           <option value="finalWinner">Winner (A-Z)</option>
//         </select>
//       </div> */}

//       <div className="w-full p-4">
//         <div aria-label="Tournament column headers" className='grid grid-cols-5 mb-1 text-center'>
//           <span>Title</span>
//           <span>Date</span>
//           <span>Players</span>
//           <span>Winner</span>
//         </div>

//         {/* Tournament Rows */}
//         <ul>
//           {/* {visibleTournaments.map((tournament, idx) => (
//             <li
//               key={`${tournament.title}-${idx}`}
//               className="grid grid-cols-5 text-center items-center bg-[#FFEE8C] rounded-xl h-12 mt-2 hover:scale-105 transform transition ease-in-out duration-300"
//             >
//               <span>{tournament.title}</span>
//               <span>{tournament.date}</span>
//               <span>{tournament.totalPlayers}</span>
//               <span>{tournament.finalWinner}</span>
//               <span>
//                 <button 
//                   onClick={() => TournamentBracket }>
//                   <DownArrow className='size-12 hover:cursor-pointer' />
//                 </button>
//               </span>
//             </li>
//           ))} */}
//           {visibleTournaments.map((tournament, idx) => {
//             const isExpanded = expandedIdx === idx;

//             return (
//               <React.Fragment key={`${tournament.title}-${idx}`}>
//                 <li
//                   className={`grid grid-cols-5 text-center items-center rounded-xl h-12 mt-2 transform transition 
//                     ${isExpanded ? 'bg-[#FDFBD4] scale-105' : 'bg-[#FFEE8C]'} 
//                     hover:scale-105 ease-in-out duration-300`}
//                 >
//                   <span>{tournament.title}</span>
//                   <span>{tournament.date}</span>
//                   <span>{tournament.totalPlayers}</span>
//                   <span>{tournament.finalWinner}</span>
//                   <span>
//                     <button
//                       onClick={() => setExpandedIdx(isExpanded ? null : idx)}
//                       aria-label={`Details for ${tournament.title}`}
//                     >
//                     <div className={`size-12  transition ease-in-out duration-300 ${isExpanded ? '-rotate-180 opacity-25 ' : 'rotate-0'}`}>
//                       <DownArrow />
//                     </div>

//                     </button>
//                   </span>
//                 </li>

//                 {isExpanded && (
//                   <li className="">
//                     <ToBeDoneBracket tournament={tournament} />
//                   </li>
//                 )}
//               </React.Fragment>
//             );
//           })}
//         </ul>

//         {visibleTournamentsCount < sortTournaments.length && (
//           <div className="mt-4 text-center">
//             <button 
//               onClick={() => setVisibleTournamentsCount((prev) => prev + 5)}
//               className="px-4 py-2 font-semibold">
//               <DownArrow className='size-20 -mb-15 hover:cursor-pointer' />
//             </button>
//           </div>
//         )}
//         {visibleTournamentsCount > sortTournaments.length && (
//             <div className="mt-4 text-center">
//               <button
//                 onClick={() => setVisibleTournamentsCount(5)}
//                 className="px-4 py-2 font-semibold">
//                 <DownArrow className='size-20 -mb-15 scale-y-[-1] hover:cursor-pointer' />
//               </button>
//             </div>
//           )}
//         </div>

//       {/* Bottom buttons */}
//       <div className="flex flex-wrap justify-center gap-4 mt-12">
//         <GenericButton
//           className="generic-button"
//           text="BACK"
//           onClick={() => navigate('/homeuser')}
//         />
//         <GenericButton
//           className="generic-button"
//           text="CREATE"
//           onClick={() => navigate('/tournaments/new')}
//         />
//       </div>
//     </div>
//   );
// };

// export default TournamentsPage;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import DownArrow from '../../assets/noun-down-arrow-down-1144832.svg?react';
import ToBeDoneBracket from '../../components/ToBeDoneBracket';
import BracketViewer from '../../components/BracketViewer';

interface TournamentHistoryRow {
  tournament_id: string; // TEXT NOT NULL
  total_players: number;
  stage_number: number;  // finals = 1, semis = 2, winner = 0 (if exists)
  match_number: number;
  player_name: string;
  opponent_name: string;
  result: 'win' | 'loss' | 'draw'; // TEXT CHECK(result IN ('win', 'loss', 'draw')) NOT NUL
  played_at: string; //  DATETIME DEFAULT CURRENT_TIMESTAMP
}

// knockout-style tournament data
const mockData: TournamentHistoryRow[] = [
  {
    tournament_id: 'abc',
    total_players: 4,
    stage_number: 2,
    match_number: 1,
    player_name: 'Lily',
    opponent_name: 'Anna',
    result: 'win',
    played_at: '2025-01-01T10:00:00',
  },
  {
    tournament_id: 'abc',
    total_players: 4,
    stage_number: 2,
    match_number: 2,
    player_name: 'Zoe',
    opponent_name: 'Maya',
    result: 'loss',
    played_at: '2025-01-01T10:30:00',
  },
  {
    tournament_id: 'abc',
    total_players: 4,
    stage_number: 1,
    match_number: 1,
    player_name: 'Lily',
    opponent_name: 'Maya',
    result: 'win',
    played_at: '2025-01-01T11:00:00',
  },
  {
    tournament_id: 'another',
    total_players: 4,
    stage_number: 2,
    match_number: 1,
    player_name: 'Bob',
    opponent_name: 'Charlie',
    result: 'win',
    played_at: '2025-01-01T10:00:00',
  },
  {
    tournament_id: 'another',
    total_players: 4,
    stage_number: 2,
    match_number: 2,
    player_name: 'Bob2',
    opponent_name: 'Charlie2',
    result: 'win',
    played_at: '2025-01-01T10:00:00',
  },
  // Round 1 (Quarterfinals) - Stage 3
  {
    tournament_id: 'big',
    total_players: 8,
    stage_number: 3,
    match_number: 1,
    player_name: 'Lily',
    opponent_name: 'Anna',
    result: 'win',
    played_at: '2025-01-01T10:00:00',
  },
  {
    tournament_id: 'big',
    total_players: 8,
    stage_number: 3,
    match_number: 2,
    player_name: 'Zoe',
    opponent_name: 'Maya',
    result: 'win',
    played_at: '2025-01-01T10:30:00',
  },
  {
    tournament_id: 'big',
    total_players: 8,
    stage_number: 3,
    match_number: 3,
    player_name: 'Jake',
    opponent_name: 'Eva',
    result: 'win',
    played_at: '2025-01-01T11:00:00',
  },
  {
    tournament_id: 'big',
    total_players: 8,
    stage_number: 3,
    match_number: 4,
    player_name: 'Milo',
    opponent_name: 'Nina',
    result: 'loss',
    played_at: '2025-01-01T11:30:00',
  },

  // Round 2 (Semifinals) - Stage 2
  {
    tournament_id: 'big',
    total_players: 8,
    stage_number: 2,
    match_number: 1,
    player_name: 'Lily',
    opponent_name: 'Zoe',
    result: 'win',
    played_at: '2025-01-01T12:00:00',
  },
  {
    tournament_id: 'big',
    total_players: 8,
    stage_number: 2,
    match_number: 2,
    player_name: 'Jake',
    opponent_name: 'Nina',
    result: 'win',
    played_at: '2025-01-01T12:30:00',
  },

  // Round 3 (Finals) - Stage 1
  {
    tournament_id: 'big',
    total_players: 8,
    stage_number: 1,
    match_number: 1,
    player_name: 'Lily',
    opponent_name: 'Jake',
    result: 'win',
    played_at: '2025-01-01T13:00:00',
  },  


    // INCOMPLETE TOURNAMENTE Semifinals (Stage 2)
  {
    tournament_id: 'incomplete',
    total_players: 4,
    stage_number: 2,
    match_number: 1,
    player_name: 'Lily',
    opponent_name: 'Anna',
    result: 'win',
    played_at: '2025-08-08T14:00:00',
  },
  {
    tournament_id: 'incomplete',
    total_players: 4,
    stage_number: 2,
    match_number: 2,
    player_name: 'Zoe',
    opponent_name: 'Maya',
    result: 'win',
    played_at: '2025-08-08T14:30:00',
  },

  // Finals (Stage 1) — not played yet, so no entry here
  {
    tournament_id: 'incomplete',
    total_players: 4,
    stage_number: 1,
    match_number: 1,
    player_name: '',
    opponent_name: '',
    result: 'draw',
    played_at: '',
  },  
];


const TournamentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleTournamentsCount, setVisibleTournamentsCount] = useState(5);

  const grouped = Object.groupBy
    ? Object.groupBy(mockData, row => row.tournament_id)
    : mockData.reduce((acc, row) => {
        (acc[row.tournament_id] ||= []).push(row);
        return acc;
      }, {} as Record<string, TournamentHistoryRow[]>);

  const tournaments = Object.entries(grouped)
    .map(([id, rows]) => {
      const date = new Date(rows[0].played_at).toLocaleDateString('en-US');
      return {
        id,
        date,
        winner: rows[0].tournament_winner,
        totalPlayers: rows[0].total_players,
        matches: rows,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <h3 className="font-semibold text-center">Tournament List</h3>

      <div className="w-full p-4">
        <div aria-label="Tournament column headers" className='grid grid-cols-5 mb-1 text-center'>
          <span>Title</span>
          <span>Date</span>
          <span>Players</span>
          <span>Winner</span>
          <span></span>
        </div>

        <ul>
          {tournaments.slice(0, visibleTournamentsCount).map((t, idx) => {
            const isExpanded = expandedId === t.id;
            return (
              <React.Fragment key={t.id}>
                <li
                  className={`grid grid-cols-5 text-center items-center rounded-xl h-12 mt-2 transition-transform 
                    ${isExpanded ? 'bg-[#FDFBD4] scale-105' : 'bg-[#FFEE8C]'} 
                    hover:scale-105 ease-in-out duration-300`}
                >
                  <span>{t.id}</span>
                  <span>{t.date}</span>
                  <span>{t.totalPlayers}</span>
                  <span>{t.winner}</span>
                  <span>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : t.id)}
                      aria-label={`Expand bracket for ${t.id}`}
                    >
                      <div
                        className={`size-12 transition-transform duration-300 ${
                          isExpanded ? '-rotate-180 opacity-25' : ''
                        }`}
                      >
                        <DownArrow />
                      </div>
                    </button>
                  </span>
                </li>

                {isExpanded && (
                  <li className="mt-2">
                    {/* <ToBeDoneBracket tournament={{ ...t, matches: t.matches! }} /> */}
                    <BracketViewer matches={t.matches} />
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </ul>

        {visibleTournamentsCount < tournaments.length && (
          <div className="mt-4 text-center">
            <button 
              onClick={() => setVisibleTournamentsCount((prev) => prev + 5)}
              className="px-4 py-2 font-semibold">
              <DownArrow className='size-20 -mb-15 hover:cursor-pointer' />
            </button>
          </div>
        )}
        {visibleTournamentsCount >= tournaments.length && tournaments.length > 5 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setVisibleTournamentsCount(5)}
                className="px-4 py-2 font-semibold">
                <DownArrow className='size-20 -mb-15 scale-y-[-1] hover:cursor-pointer' />
              </button>
            </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-12">
        <GenericButton
          className="generic-button"
          text="BACK"
          onClick={() => navigate('/homeuser')}
        />
        <GenericButton
          className="generic-button"
          text="CREATE"
          onClick={() => navigate('/tournaments/new')}
        />
      </div>
    </div>
  );
};

export default TournamentsPage;
