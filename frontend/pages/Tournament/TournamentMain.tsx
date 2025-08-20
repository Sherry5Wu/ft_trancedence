// /src/pages/Tornament/TournamentMain.tsx

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import DownArrow from '../../assets/noun-down-arrow-down-1144832.svg?react';
// import ToBeDoneBracket from '../../components/ToBeDoneBracket';
// import BracketViewer from '../../components/BracketViewer';
import ModularBracketViewer from '../../components/ModularBracketViewer';
import { useUserContext } from '../../context/UserContext';

type Result = 'win' | 'loss' | 'draw';

interface TournamentHistoryRow {
  tournament_id: string;
  stage_number: number;
  match_number: number;
  player_name: string;
  opponent_name: string;
  result: Result;
  played_at: string;
}

type UITournament = {
  id: string;
  date: string;
  totalPlayers: number;
  winner?: string | null;
  matches: TournamentHistoryRow[];
};

const API_BASE = 'https://localhost:8443';

async function fetchAllTournamentHistory(): Promise<TournamentHistoryRow[]> {
  const res = await fetch(`${API_BASE}/tournament_history`, { credentials: 'include' });
  if (!res.ok) throw new Error(`GET /tournament_history ${res.status}`);
  return res.json();
}

export default function TournamentsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const [rows, setRows] = useState<TournamentHistoryRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleTournamentsCount, setVisibleTournamentsCount] = useState(5);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAllTournamentHistory();
        if (!cancelled) setRows(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load tournament history');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <main className="pageLayout">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }
  if (rows === null) {
    return (
      <main className="pageLayout">
        <p>{t('common.loading') || 'Loading…'}</p>
      </main>
    );
  }

  const grouped: Record<string, TournamentHistoryRow[]> = (Object as any).groupBy
    ? (Object as any).groupBy(rows, (r: TournamentHistoryRow) => r.tournament_id)
    : rows.reduce((acc, r) => {
        (acc[r.tournament_id] ||= []).push(r);
        return acc;
      }, {} as Record<string, TournamentHistoryRow[]>);

  const tournaments: UITournament[] = Object.entries(grouped).map(([id, matches]) => {
    const sorted = [...matches].sort((a, b) => {
      if (a.stage_number !== b.stage_number) return a.stage_number - b.stage_number; // 1..N
      if (a.match_number !== b.match_number) return a.match_number - b.match_number; // 1..M
      return new Date(a.played_at).getTime() - new Date(b.played_at).getTime();
    });

    const lastPlayed = sorted[sorted.length - 1]?.played_at ?? sorted[0]?.played_at;
    const date = lastPlayed ? new Date(lastPlayed).toLocaleDateString(undefined) : '-';

    const maxStage = sorted.reduce((m, r) => Math.max(m, r.stage_number ?? 1), 1);
    const totalPlayers = Math.pow(2, maxStage);

    // Compute winner from the final
    const finalRow = sorted.find(r => r.stage_number === 1 && r.match_number === 1);
    let winner: string | null = null;
    if (finalRow) {
      if (finalRow.result === 'win') winner = finalRow.player_name;
      else if (finalRow.result === 'loss') winner = finalRow.opponent_name;
      else winner = null;
    }

    return { id, date, totalPlayers, winner, matches: sorted };
  })
  .sort((a, b) => {
    const ta = Date.parse(a.date) || 0;
    const tb = Date.parse(b.date) || 0;
    return tb - ta;
  });

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

      <div role="table" aria-label={t('pages.tournament.list.aria.table')} className="w-full p-4">
        <div role="row" className="grid grid-cols-5 mb-1 text-center font-semibold">
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
                      onClick={() => setExpandedId(isExpanded ? null : tournament.id)}
                      aria-label={t('pages.tournament.list.aria.expandButton', { id: tournament.id })}
                    >
                      <div className={`size-12 transition-transform duration-300 ${isExpanded ? '-rotate-180 opacity-25' : ''}`}>
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
          onClick={() => navigate('/tournaments/new')}
        />
      </div>
    </main>
  );
}