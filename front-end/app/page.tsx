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

const DIFFICULTY_CONFIG = {
  medium: {
    label: 'ปานกลาง',
    badge: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    btn: 'bg-orange-500 text-white',
    btnIdle: 'bg-gray-800 text-gray-400 hover:bg-gray-700',
    description: 'บอทโจมตีและบล็อคเท่านั้น',
  },
  boss: {
    label: '☠️ บอส',
    badge: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    btn: 'bg-rose-600 text-white',
    btnIdle: 'bg-gray-800 text-gray-400 hover:bg-gray-700',
    description: 'บอทเล่น Minimax สมบูรณ์แบบ',
  },
} satisfies Record<Difficulty, { label: string; badge: string; btn: string; btnIdle: string; description: string }>;

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [moving, setMoving] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [scoreChange, setScoreChange] = useState<{ value: number; bonus: boolean } | null>(null);

  useEffect(() => {
    fetchProfile().then((profile) => {
      if (!profile) {
        router.replace('/login');
      } else {
        setUser(profile);
        setLoading(false);
      }
    });
  }, [router]);

  const handleNewGame = useCallback(async (diff: Difficulty) => {
    setScoreChange(null);
    const res = await startGame(diff);
    setGame({
      gameId: res.gameId,
      board: res.board,
      status: 'playing',
      winLine: null,
      lastBotMove: null,
      difficulty: res.difficulty,
    });
  }, []);

  useEffect(() => {
    if (!loading && user) handleNewGame(difficulty);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  const handleCellClick = async (position: number) => {
    if (!game || game.status !== 'playing' || moving) return;
    setMoving(true);

    const res = await makeMove(game.gameId, position);

    setGame((prev) => prev ? {
      ...prev,
      board: res.board,
      status: res.status,
      winLine: res.winLine,
      lastBotMove: res.botMove,
    } : prev);

    if (res.status !== 'playing') {
      setUser((prev) => prev ? { ...prev, score: res.score, consecutiveWins: res.consecutiveWins } : prev);
      if (res.scoreChange !== 0) {
        setScoreChange({ value: res.scoreChange, bonus: res.bonusWin });
      }
    }

    setMoving(false);
  };

  function handleLogout() {
    removeToken();
    router.replace('/login');
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const isPlaying = game?.status === 'playing';
  const cfg = DIFFICULTY_CONFIG[game?.difficulty ?? difficulty];

  const statusMessage: Record<GameStatus, string> = {
    playing: moving ? 'บอทกำลังคิด...' : 'ตาคุณ (X)',
    win: '🎉 คุณชนะ!',
    lose: '😞 บอทชนะ!',
    draw: '🤝 เสมอ!',
  };

  const statusColor: Record<GameStatus, string> = {
    playing: 'text-gray-300',
    win: 'text-green-400',
    lose: 'text-rose-400',
    draw: 'text-yellow-400',
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4 gap-5">

      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between">
        <div className="text-3xl font-black tracking-widest select-none">
          <span className="text-blue-400">O</span>
          <span className="text-gray-400">X</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/leaderboard" className="text-sm text-gray-400 hover:text-white transition-colors">
            Leaderboard
          </Link>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-400 transition-colors">
            ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Player info & score */}
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user?.picture && (
            <img src={user.picture} alt={user.displayName} className="w-10 h-10 rounded-full border border-gray-600" />
          )}
          <span className="font-medium text-sm">{user?.displayName}</span>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold text-blue-400">{user?.score}</span>
              {scoreChange && scoreChange.value !== 0 && (
                <span className={`text-sm font-bold animate-bounce ${scoreChange.value > 0 ? 'text-green-400' : 'text-rose-400'}`}>
                  {scoreChange.value > 0 ? `+${scoreChange.value}` : scoreChange.value}
                  {scoreChange.bonus && ' 🎊'}
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

      {/* Difficulty selector */}
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 mr-1">ระดับความยาก:</span>
          {(['medium', 'boss'] as Difficulty[]).map((d) => {
            const c = DIFFICULTY_CONFIG[d];
            const active = (isPlaying ? game?.difficulty : difficulty) === d;
            return (
              <button
                key={d}
                onClick={() => !isPlaying && setDifficulty(d)}
                disabled={isPlaying}
                title={isPlaying ? 'เริ่มเกมใหม่เพื่อเปลี่ยนระดับ' : c.description}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  active ? `${c.btn} border-transparent` : `${c.btnIdle} border-gray-700`
                } ${isPlaying ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                {c.label}
              </button>
            );
          })}
          {game && (
            <span className={`ml-auto text-xs px-2 py-1 rounded-md border ${cfg.badge}`}>
              {cfg.label}
            </span>
          )}
        </div>
        {!isPlaying && (
          <p className="text-xs text-gray-600 mt-1 ml-1">
            {DIFFICULTY_CONFIG[difficulty].description}
          </p>
        )}
      </div>

      {/* Status */}
      <p className={`text-lg font-semibold ${game ? statusColor[game.status] : 'text-gray-300'}`}>
        {game ? statusMessage[game.status] : ''}
      </p>

      {/* Board */}
      {game ? (
        <Board
          board={game.board}
          onCellClick={handleCellClick}
          disabled={game.status !== 'playing' || moving}
          winLine={game.winLine}
          lastBotMove={game.lastBotMove}
        />
      ) : (
        <div className="w-72 h-72 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-6 text-sm text-gray-500">
        <span><span className="text-blue-400 font-bold">X</span> = คุณ</span>
        <span><span className="text-rose-400 font-bold">O</span> = บอท</span>
      </div>

      {/* Play Again */}
      {game?.status !== 'playing' && (
        <button
          onClick={() => handleNewGame(difficulty)}
          className="mt-1 px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors"
        >
          เล่นอีกครั้ง
        </button>
      )}
    </main>
  );
}
