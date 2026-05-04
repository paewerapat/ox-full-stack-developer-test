'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchProfile, removeToken, UserProfile } from '../lib/auth';
import { startGame, makeMove, Cell, GameStatus, Difficulty } from '../lib/game';
import Board from '../components/Board';

interface GameState {
  gameId: string;
  board: Cell[];
  status: GameStatus;
  winLine: number[] | null;
  lastBotMove: number | null;
  difficulty: Difficulty;
}

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; desc: string; activeCls: string; ringCls: string }> = {
  medium: {
    label: 'ปานกลาง',
    desc: 'บอทพลาดบ้าง — ชนะได้ถ้าเล่นฉลาด',
    activeCls: 'bg-orange-500 text-white border-orange-400',
    ringCls: 'ring-orange-500',
  },
  boss: {
    label: '☠️ บอส',
    desc: 'Minimax สมบูรณ์แบบ — ชนะไม่ได้',
    activeCls: 'bg-rose-600 text-white border-rose-500',
    ringCls: 'ring-rose-600',
  },
};

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [gameLoading, setGameLoading] = useState(false);
  const [moving, setMoving] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [scoreChange, setScoreChange] = useState<{ value: number; bonus: boolean } | null>(null);

  useEffect(() => {
    fetchProfile().then((profile) => {
      if (!profile) router.replace('/login');
      else { setUser(profile); setAuthLoading(false); }
    });
  }, [router]);

  const handleNewGame = useCallback(async (diff: Difficulty) => {
    setScoreChange(null);
    setGameLoading(true);
    const res = await startGame(diff);
    setGame({ gameId: res.gameId, board: res.board, status: 'playing', winLine: null, lastBotMove: null, difficulty: res.difficulty });
    setGameLoading(false);
  }, []);

  const handleCellClick = async (position: number) => {
    if (!game || game.status !== 'playing' || moving) return;
    setMoving(true);
    const res = await makeMove(game.gameId, position);
    setGame((prev) => prev ? { ...prev, board: res.board, status: res.status, winLine: res.winLine, lastBotMove: res.botMove } : prev);
    if (res.status !== 'playing') {
      setUser((prev) => prev ? { ...prev, score: res.score, consecutiveWins: res.consecutiveWins } : prev);
      if (res.scoreChange !== 0) setScoreChange({ value: res.scoreChange, bonus: res.bonusWin });
    }
    setMoving(false);
  };

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const isPlaying = game?.status === 'playing';
  const isOver = game && !isPlaying;

  const resultConfig: Record<GameStatus, { msg: string; color: string }> = {
    playing: { msg: moving ? 'บอทกำลังคิด...' : 'ตาคุณ (X)', color: 'text-gray-300' },
    win:  { msg: '🎉 คุณชนะ!',  color: 'text-green-400' },
    lose: { msg: '😞 บอทชนะ!', color: 'text-rose-400' },
    draw: { msg: '🤝 เสมอ!',   color: 'text-yellow-400' },
  };

  // ─── Difficulty selector (shown before game starts OR after game ends) ───
  const DifficultySelector = (
    <div className="w-full max-w-md flex flex-col gap-2">
      <p className="text-xs text-gray-500 text-center">เลือกระดับความยาก</p>
      <div className="flex gap-3">
        {(['medium', 'boss'] as Difficulty[]).map((d) => {
          const cfg = DIFFICULTY_CONFIG[d];
          const active = difficulty === d;
          return (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                active ? `${cfg.activeCls} ring-2 ${cfg.ringCls} ring-offset-2 ring-offset-gray-950` : 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <div>{cfg.label}</div>
              <div className={`text-xs font-normal mt-0.5 ${active ? 'opacity-80' : 'text-gray-500'}`}>{cfg.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4 gap-5">

      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between">
        <div className="text-3xl font-black tracking-widest select-none">
          <span className="text-blue-400">O</span><span className="text-gray-400">X</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/leaderboard" className="text-sm text-gray-400 hover:text-white transition-colors">Leaderboard</Link>
          <button onClick={() => { removeToken(); router.replace('/login'); }} className="text-sm text-gray-500 hover:text-red-400 transition-colors">ออกจากระบบ</button>
        </div>
      </div>

      {/* Score card */}
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user?.picture && <img src={user.picture} alt={user.displayName} className="w-10 h-10 rounded-full border border-gray-600" />}
          <span className="font-medium text-sm">{user?.displayName}</span>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold text-blue-400">{user?.score}</span>
              {scoreChange && scoreChange.value !== 0 && (
                <span className={`text-sm font-bold animate-bounce ${scoreChange.value > 0 ? 'text-green-400' : 'text-rose-400'}`}>
                  {scoreChange.value > 0 ? `+${scoreChange.value}` : scoreChange.value}{scoreChange.bonus && ' 🎊'}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">คะแนน</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-yellow-400">{user?.consecutiveWins}</p>
            <p className="text-xs text-gray-400">Streak</p>
          </div>
        </div>
      </div>

      {/* ── PRE-GAME: selector + start button ── */}
      {!game && !gameLoading && (
        <>
          {DifficultySelector}
          <button
            onClick={() => handleNewGame(difficulty)}
            className="w-full max-w-md py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg transition-colors"
          >
            เริ่มเล่น
          </button>
        </>
      )}

      {/* ── GAME LOADING ── */}
      {gameLoading && (
        <div className="w-72 h-72 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── IN GAME ── */}
      {game && (
        <>
          {/* Difficulty badge + status */}
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${DIFFICULTY_CONFIG[game.difficulty].activeCls}`}>
              {DIFFICULTY_CONFIG[game.difficulty].label}
            </span>
            <p className={`text-base font-semibold ${resultConfig[game.status].color}`}>
              {resultConfig[game.status].msg}
            </p>
          </div>

          <Board
            board={game.board}
            onCellClick={handleCellClick}
            disabled={!isPlaying || moving}
            winLine={game.winLine}
            lastBotMove={game.lastBotMove}
          />

          <div className="flex gap-6 text-sm text-gray-500">
            <span><span className="text-blue-400 font-bold">X</span> = คุณ</span>
            <span><span className="text-rose-400 font-bold">O</span> = บอท</span>
          </div>

          {/* ── POST-GAME: selector + play again ── */}
          {isOver && (
            <div className="w-full max-w-md flex flex-col items-center gap-4 pt-2">
              {DifficultySelector}
              <button
                onClick={() => handleNewGame(difficulty)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors"
              >
                เล่นอีกครั้ง
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
