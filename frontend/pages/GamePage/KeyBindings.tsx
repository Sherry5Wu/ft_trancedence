import React, { useEffect, useMemo, useState } from 'react';

export type Action = 'up' | 'down' | 'boost' | 'shield';
export type PlayerId = 'p1' | 'p2';
export type KeyBinding = { up: string; down: string; boost: string; shield: string };
export type KeyBindings = { p1: KeyBinding; p2: KeyBinding };

export const BINDINGS_STORAGE_KEY = 'pong.bindings.v1';

export const DEFAULT_BINDINGS: KeyBindings = {
  p1: { up: 'KeyW', down: 'KeyS', boost: 'KeyA', shield: 'KeyD' },
  p2: { up: 'ArrowUp', down: 'ArrowDown', boost: 'ArrowRight', shield: 'ArrowLeft' },
};

export function loadBindings(): KeyBindings {
  try {
    const raw = localStorage.getItem(BINDINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_BINDINGS;
    const parsed = JSON.parse(raw);
    if (parsed?.p1?.up && parsed?.p2?.up) return parsed as KeyBindings;
  } catch {}
  return DEFAULT_BINDINGS;
}

export function saveBindings(b: KeyBindings) {
  try { localStorage.setItem(BINDINGS_STORAGE_KEY, JSON.stringify(b)); } catch {}
}

export function labelForCode(code: string): string {
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  const special: Record<string, string> = {
    ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
    Space: 'Space', ShiftLeft: 'L-Shift', ShiftRight: 'R-Shift',
    ControlLeft: 'L-Ctrl', ControlRight: 'R-Ctrl',
    AltLeft: 'L-Alt', AltRight: 'R-Alt',
  };
  return special[code] ?? code;
}

function findConflicts(b: KeyBindings): string[] {
  const all: Array<{ who: string; code: string }> = [];
  (['p1', 'p2'] as PlayerId[]).forEach(pid => {
    (['up', 'down', 'boost', 'shield'] as Action[]).forEach(act => {
      all.push({ who: `${pid}:${act}`, code: b[pid][act] });
    });
  });
  const seen = new Map<string, string>();
  const dups: string[] = [];
  for (const item of all) {
    if (seen.has(item.code)) dups.push(`${seen.get(item.code)} ↔ ${item.who} (${item.code})`);
    else seen.set(item.code, item.who);
  }
  return dups;
}

type KeyBindingsPanelProps = {
  playerNames: [string, string];
  value: KeyBindings;
  onChange: (next: KeyBindings) => void;
  enforceUnique?: boolean;
  className?: string;
};

export default function KeyBindingsPanel({
  playerNames,
  value,
  onChange,
  enforceUnique = true,
  className = '',
}: KeyBindingsPanelProps) {
  const [capture, setCapture] = useState<{ player: PlayerId; action: Action } | null>(null);
  const conflicts = useMemo(() => findConflicts(value), [value]);

  // Capture next keydown as the binding
  useEffect(() => {
    if (!capture) return;
    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.code === 'Escape') { setCapture(null); return; }

      const code = e.code;
      // Uniqueness guard
      if (enforceUnique) {
        for (const pid of ['p1','p2'] as PlayerId[]) {
          for (const act of ['up','down','boost','shield'] as Action[]) {
            if (!(pid === capture.player && act === capture.action) && value[pid][act] === code) {
              setCapture(null);
              return;
            }
          }
        }
      }
      const next = {
        ...value,
        [capture.player]: { ...value[capture.player], [capture.action]: code },
      };
      saveBindings(next);
      onChange(next);
      setCapture(null);
    };
    window.addEventListener('keydown', onKeyDown, { once: true });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [capture, enforceUnique, onChange, value]);

  const [p1Name, p2Name] = playerNames;

  const resetP = (pid: PlayerId) => {
    const next: KeyBindings = { ...value, [pid]: DEFAULT_BINDINGS[pid] };
    saveBindings(next); onChange(next);
  };
  const resetAll = () => { saveBindings(DEFAULT_BINDINGS); onChange(DEFAULT_BINDINGS); };
  const swapBoth = () => {
    const swapped: KeyBindings = { p1: value.p2, p2: value.p1 };
    saveBindings(swapped); onChange(swapped);
  };

  const Row = ({ pid, act }: { pid: PlayerId; act: Action }) => (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="capitalize text-neutral-300">{act}</span>
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 rounded bg-neutral-900 text-xs">
          {labelForCode(value[pid][act])}
        </span>
        <button
          type="button"
          onClick={() => setCapture({ player: pid, action: act })}
          className={`px-2 py-1 rounded border text-xs ${
            capture?.player === pid && capture?.action === act
              ? 'border-emerald-500 text-emerald-400'
              : 'border-white/10 text-neutral-200'
          }`}
        >
          {capture?.player === pid && capture?.action === act ? 'Press any key…' : 'Rebind'}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`mb-6 ${className}`}>
      <div className="block text-sm text-neutral-300 mb-2">Controls</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Player 1 */}
        <div className="rounded-lg bg-neutral-800 p-3">
          <div className="font-semibold mb-2">{p1Name} (Player 1)</div>
          {(['up','down','boost','shield'] as Action[]).map(act => (
            <Row key={`p1-${act}`} pid="p1" act={act} />
          ))}
          <button type="button" className="mt-3 text-xs underline" onClick={() => resetP('p1')}>
            Reset P1 to defaults
          </button>
        </div>
        {/* Player 2 */}
        <div className="rounded-lg bg-neutral-800 p-3">
          <div className="font-semibold mb-2">{p2Name} (Player 2)</div>
          {(['up','down','boost','shield'] as Action[]).map(act => (
            <Row key={`p2-${act}`} pid="p2" act={act} />
          ))}
          <button type="button" className="mt-3 text-xs underline" onClick={() => resetP('p2')}>
            Reset P2 to defaults
          </button>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="mt-2 text-xs text-amber-400">
          Conflicts detected: {conflicts.join(', ')}
        </div>
      )}

      <div className="mt-2 flex gap-3">
        <button type="button" className="text-xs underline" onClick={resetAll}>
          Reset all to defaults
        </button>
        <button type="button" className="text-xs underline" onClick={swapBoth}>
          Swap P1/P2
        </button>
      </div>
    </div>
  );
}
