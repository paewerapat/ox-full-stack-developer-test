'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProfile, removeToken, UserProfile } from '../lib/auth';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-6">
      <div className="text-6xl font-black tracking-widest select-none">
        <span className="text-blue-400">O</span>
        <span className="text-gray-400">X</span>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 flex flex-col items-center gap-4 w-full max-w-sm">
        {user?.picture && (
          <img
            src={user.picture}
            alt={user.displayName}
            className="w-16 h-16 rounded-full border-2 border-blue-400"
          />
        )}
        <p className="text-lg font-semibold">{user?.displayName}</p>
        <p className="text-sm text-gray-400">{user?.email}</p>

        <div className="w-full border-t border-gray-700 pt-4 flex justify-around">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{user?.score}</p>
            <p className="text-xs text-gray-400">Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">{user?.consecutiveWins}</p>
            <p className="text-xs text-gray-400">Win Streak</p>
          </div>
        </div>
      </div>

      <p className="text-gray-500 text-sm">Game board coming soon...</p>

      <button
        onClick={handleLogout}
        className="text-sm text-gray-500 hover:text-red-400 transition-colors"
      >
        Sign out
      </button>
    </main>
  );
}
