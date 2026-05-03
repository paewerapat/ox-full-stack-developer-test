'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchProfile, removeToken, UserProfile } from '../lib/auth';
import { startGame, makeMove, Cell, GameStatus } from '../lib/game';
import Board from '../components/Board';

interface GameState {
  gameId: string;
  board: Cell[];
  status: GameStatus;
  winLine: number[] | null;
  lastBotMove: number | null;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [moving, setMoving] = useState(false);
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

  const handleNewGame = useCallback(async () => {
    setScoreChange(null);
    const res = await startGame();
    setGame({ gameId: res.gameId, board: res.board, status: 'playing', winLine: null, lastBotMove: null });
  }, []);

  useEffect(() => {
    if (!loading && user) handleNewGame();
  }, [loading, user, handleNewGame]);

  const handleCellClick = async (position: number) => {
    if (!game || game.status !== 'playing' || moving) return;
    setMoving(true);

    const res = await makeMove(game.gameId, position);

    setGame({
      gameId: res.gameId,
      board: res.board,
      status: res.status,
      winLine: res.winLine,
      lastBotMove: res.botMove,
    });

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

  const statusMessage: Record<GameStatus, string> = {
    playing: moving ? "Bot is thinking..." : "Your turn (X)",
    win: '🎉 You Win!',
    lose: '😞 Bot Wins!',
    draw: '🤝 Draw!',
  };

  const statusColor: Record<GameStatus, string> = {
    playing: 'text-gray-300',
    win: 'text-green-400',
    lose: 'text-rose-400',
    draw: 'text-yellow-400',
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4 gap-6">

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
            Sign out
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
            <p className="text-xs text-gray-400">Score</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-yellow-400">{user?.consecutiveWins}</p>
            <p className="text-xs text-gray-400">Streak</p>
          </div>
        </div>
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
        <span><span className="text-blue-400 font-bold">X</span> = You</span>
        <span><span className="text-rose-400 font-bold">O</span> = Bot</span>
      </div>

      {/* New game button */}
      {game?.status !== 'playing' && (
        <button
          onClick={handleNewGame}
          className="mt-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors"
        >
          Play Again
        </button>
      )}
    </main>
  );
}
