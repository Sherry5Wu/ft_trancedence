// pages/Tornament/TournamentMain.tsx
// tournament list history in a dropdown layout
// user can create a new tournament or go back

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import DownArrow from '../../assets/noun-down-arrow-down-1144832.svg?react';
import ToBeDoneBracket from '../../components/ToBeDoneBracket';

const TournamentsPage: React.FC = () => {
  const navigate = useNavigate();

  // Mocked tournament data
  interface TournamentStats {
    title: string;
    date: string; // verify w/ backend, format: 'MM/DD/YY'
    totalPlayers: number;
    finalWinner: string;
    // ...
  }

  const mockTournament: TournamentStats[] = [
    { title: 'abc', date: '01/01/25', totalPlayers: 4, finalWinner: 'Lily' },
    { title: 'BIG', date: '11/11/11', totalPlayers: 8, finalWinner: 'Bob' },
    { title: 'Alpha Cup', date: '03/15/24', totalPlayers: 16, finalWinner: 'Charlie' },
    { title: 'Champ Clash', date: '02/10/24', totalPlayers: 8, finalWinner: 'Alice' },
    { title: 'Zeta Games', date: '05/05/25', totalPlayers: 4, finalWinner: 'Anna' },
    { title: 'Delta Smash', date: '06/06/25', totalPlayers: 16, finalWinner: 'Nina' },
    { title: 'Rocket Royale', date: '04/21/24', totalPlayers: 8, finalWinner: 'Kate' },
    { title: 'Pixel Fight', date: '07/01/25', totalPlayers: 8, finalWinner: 'Oskari' },
    { title: 'Turbo Cup', date: '12/12/24', totalPlayers: 4, finalWinner: 'Lily' },
    { title: 'Omega Clash', date: '09/09/24', totalPlayers: 4, finalWinner: 'Bob' },
    { title: 'Gamma Gala', date: '08/08/24', totalPlayers: 4, finalWinner: 'Bob' },
    { title: 'Knight Knockout', date: '10/10/25', totalPlayers: 8, finalWinner: 'Alice' },
  ];

  const [sort, setSort] = useState<'title' | 'date' | 'finalWinner'>('title');
  const [visibleTournamentsCount, setVisibleTournamentsCount] = useState(5);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const sortTournaments = [...mockTournament].sort((a, b) => {
    if (sort === 'date') {
      const [aMonth, aDay, aYear] = a.date.split('/').map(Number);
      const [bMonth, bDay, bYear] = b.date.split('/').map(Number);
      const dateA = new Date(2000 + aYear, aMonth - 1, aDay);
      const dateB = new Date(2000 + bYear, bMonth - 1, bDay);
      return dateB.getTime() - dateA.getTime(); // most recent first
    }
    return a[sort].localeCompare(b[sort]);
  });

  const visibleTournaments = sortTournaments.slice(0, visibleTournamentsCount);


  if (sortTournaments.length === 0) {
    return (
      <div aria-label="empty leaderboard" className='bg-[#FFEE8C] rounded-full text-center'>
        No tournament to show.
      </div>
    );
  }

  
  return (
    <div className="flex flex-col items-center p-8 space-y-6">

      <h3 className="font-semibold text-center" aria-label="Tournament title" >
        Tournament list
      </h3>


      {/* Sort Dropdown */}
      {/* <div className="flex ">
        <label className="mr-2 font-semibold">Sort by:</label>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as 'title' | 'date' | 'finalWinner');
          }}
        >
          <option value="title">Title (A-Z)</option>
          <option value="date">Date </option>
          <option value="finalWinner">Winner (A-Z)</option>
        </select>
      </div> */}

      <div className="w-full p-4">
        <div aria-label="Tournament column headers" className='grid grid-cols-5 mb-1 text-center'>
          <span>Title</span>
          <span>Date</span>
          <span>Players</span>
          <span>Winner</span>
        </div>

        {/* Tournament Rows */}
        <ul>
          {/* {visibleTournaments.map((tournament, idx) => (
            <li
              key={`${tournament.title}-${idx}`}
              className="grid grid-cols-5 text-center items-center bg-[#FFEE8C] rounded-xl h-12 mt-2 hover:scale-105 transform transition ease-in-out duration-300"
            >
              <span>{tournament.title}</span>
              <span>{tournament.date}</span>
              <span>{tournament.totalPlayers}</span>
              <span>{tournament.finalWinner}</span>
              <span>
                <button 
                  onClick={() => TournamentBracket }>
                  <DownArrow className='size-12 hover:cursor-pointer' />
                </button>
              </span>
            </li>
          ))} */}
          {visibleTournaments.map((tournament, idx) => {
            const isExpanded = expandedIdx === idx;

            return (
              <React.Fragment key={`${tournament.title}-${idx}`}>
                <li
                  className={`grid grid-cols-5 text-center items-center rounded-xl h-12 mt-2 transform transition 
                    ${isExpanded ? 'bg-[#FDFBD4] scale-105' : 'bg-[#FFEE8C]'} 
                    hover:scale-105 ease-in-out duration-300`}
                >
                  <span>{tournament.title}</span>
                  <span>{tournament.date}</span>
                  <span>{tournament.totalPlayers}</span>
                  <span>{tournament.finalWinner}</span>
                  <span>
                    <button
                      onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                      aria-label={`Details for ${tournament.title}`}
                    >
                    <div className={`size-12  transition ease-in-out duration-300 ${isExpanded ? '-rotate-180 opacity-25 ' : 'rotate-0'}`}>
                      <DownArrow />
                    </div>

                    </button>
                  </span>
                </li>

                {isExpanded && (
                  <li className="">
                    <ToBeDoneBracket tournament={tournament} />
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </ul>

        {visibleTournamentsCount < sortTournaments.length && (
          <div className="mt-4 text-center">
            <button 
              onClick={() => setVisibleTournamentsCount((prev) => prev + 5)}
              className="px-4 py-2 font-semibold">
              <DownArrow className='size-20 -mb-15 hover:cursor-pointer' />
            </button>
          </div>
        )}
        {visibleTournamentsCount > sortTournaments.length && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setVisibleTournamentsCount(5)}
                className="px-4 py-2 font-semibold">
                <DownArrow className='size-20 -mb-15 scale-y-[-1] hover:cursor-pointer' />
              </button>
            </div>
          )}
        </div>

      {/* Bottom buttons */}
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
