'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setToken } from '../../../lib/auth';

export default function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = use(searchParams);
  const router = useRouter();

  useEffect(() => {
    if (params.token) {
      setToken(params.token);
      router.replace('/');
    } else {
      router.replace('/login');
    }
  }, [params.token, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-4 text-white">
        <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400">Signing you in...</p>
      </div>
    </main>
  );
}
