'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  picture: string;
  score: number;
  consecutiveWins: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/scores/leaderboard`)
      .then((r) => r.json())
      .then((data: LeaderboardEntry[]) => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8 px-4 gap-6">
      <div className="w-full max-w-lg flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← Back to game
        </Link>
      </div>

      <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <p className="text-center text-gray-400 py-16">Failed to load leaderboard.</p>
        )}

        {!loading && !error && entries.length === 0 && (
          <p className="text-center text-gray-400 py-16">No players yet.</p>
        )}

        {!loading && !error && entries.length > 0 && (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 text-xs text-gray-400 uppercase">
                <th className="py-3 px-4 text-left">Rank</th>
                <th className="py-3 px-4 text-left">Player</th>
                <th className="py-3 px-4 text-right">Score</th>
                <th className="py-3 px-4 text-right">Streak</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.rank} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className={`font-bold ${
                      entry.rank === 1 ? 'text-yellow-400' :
                      entry.rank === 2 ? 'text-gray-300' :
                      entry.rank === 3 ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {entry.picture && (
                        <img src={entry.picture} alt={entry.displayName} className="w-7 h-7 rounded-full" />
                      )}
                      <span className="font-medium text-sm">{entry.displayName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-blue-400">{entry.score}</td>
                  <td className="py-3 px-4 text-right text-yellow-400 text-sm">{entry.consecutiveWins > 0 ? `🔥 ${entry.consecutiveWins}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
