const TOKEN_KEY = 'ox_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  picture: string;
  score: number;
  consecutiveWins: number;
}

export async function fetchProfile(): Promise<UserProfile | null> {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    removeToken();
    return null;
  }

  return res.json() as Promise<UserProfile>;
}
