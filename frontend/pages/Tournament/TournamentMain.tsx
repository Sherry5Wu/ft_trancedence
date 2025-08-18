// /src/pages/Tornament/TournamentMain.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import DownArrow from '../../assets/noun-down-arrow-down-1144832.svg?react';
// import ToBeDoneBracket from '../../components/ToBeDoneBracket';
// import BracketViewer from '../../components/BracketViewer';
import ModularBracketViewer from '../../components/ModularBracketViewer';
import { useUserContext } from '../../context/UserContext';

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
  // abc tournament
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
  // another tournament
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
  {
    tournament_id: 'another',
    total_players: 4,
    stage_number: 1,
    match_number: 2,
    player_name: 'Bob',
    opponent_name: 'Bob2',
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
];


const TournamentsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserContext();

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
    <main
      className="pageLayout"
      role="main"
      aria-labelledby="pageTitle"
      aria-describedby="pageDescription"
    >
      <AccessiblePageDescription
        id="pageDescription"
        text={t('pages.tournament.list.aria.description')}
      />

      <h1 id="pageTitle" className="font-semibold text-center text-xl">
        {t('pages.tournament.list.title')}
      </h1>

      <div
        role="table"
        aria-label={t('pages.tournament.list.aria.table')}
        className="w-full p-4"
      >
        <div
          role="row"
          className="grid grid-cols-5 mb-1 text-center font-semibold"
        >
          <span role="columnheader" aria-label={t('pages.tournament.list.aria.columnTitle')}>
            {t('pages.tournament.list.columnHeaders.title')}
          </span>
          <span role="columnheader" aria-label={t('pages.tournament.list.aria.columnDate')}>
            {t('pages.tournament.list.columnHeaders.date')}
          </span>
          <span role="columnheader" aria-label={t('pages.tournament.list.aria.columnPlayers')}>
            {t('pages.tournament.list.columnHeaders.players')}
          </span>
          <span role="columnheader" aria-label={t('pages.tournament.list.aria.columnWinner')}>
            {t('pages.tournament.list.columnHeaders.winner')}
          </span>
          <span aria-hidden="true"></span>
        </div>

        <ul aria-label={t('pages.tournament.list.aria.tournamentList')}>
          {tournaments.slice(0, visibleTournamentsCount).map((tournament) => {
            const isExpanded = expandedId === tournament.id;
            return (
              <React.Fragment key={tournament.id}>
                <li
                  role="row"
                  aria-label={t('pages.tournament.list.aria.tournamentRow', { id: tournament.id })}
                  className={`grid grid-cols-5 text-center items-center rounded-xl h-12 mt-2 transition-transform 
                    ${isExpanded ? 'bg-[#FDFBD4] scale-105' : 'bg-[#FFEE8C]'} 
                    hover:scale-105 ease-in-out duration-300`}
                >
                  <span role="cell">{tournament.id}</span>
                  <span role="cell">{tournament.date}</span>
                  <span role="cell">{tournament.totalPlayers}</span>
                  <span role="cell">{tournament.winner ?? '-'}</span>
                  <span role="cell">
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : tournament.id)
                      }
                      aria-label={t('pages.tournament.list.aria.expandButton', { id: tournament.id })}
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
                    <ModularBracketViewer
                      matches={tournament.matches}
                      totalPlayers={tournament.totalPlayers}
                    />
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </ul>
      </div>

      {visibleTournamentsCount < tournaments.length && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setVisibleTournamentsCount((prev) => prev + 5)}
            aria-label={t('pages.tournament.list.aria.loadMoreButton')}
          >
            <DownArrow className="size-20 -mb-15 hover:cursor-pointer" />
          </button>
        </div>
      )}

      {visibleTournamentsCount >= tournaments.length && tournaments.length > 5 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setVisibleTournamentsCount(5)}
            aria-label={t('pages.tournament.list.aria.showLessButton')}
          >
            <DownArrow className="size-20 -mb-15 scale-y-[-1] hover:cursor-pointer" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4 mt-12">
        <GenericButton
          className="generic-button"
          text={t('common.buttons.back')}
          aria-label={t('common.aria.buttons.back')}
          onClick={() =>
            navigate(`/user/${user?.username}`)
          }
        />
        <GenericButton
          className="generic-button"
          text={t('common.buttons.new')}
          aria-label={t('common.aria.buttons.new')}
          onClick={() =>
            navigate('/tournaments/new')
          }
        />
      </div>
    </main>
  );
};

export default TournamentsPage;