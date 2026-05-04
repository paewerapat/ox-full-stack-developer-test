import { getToken } from './auth';

const API = process.env.NEXT_PUBLIC_API_URL;

export type Cell = 'X' | 'O' | null;
export type GameStatus = 'playing' | 'win' | 'lose' | 'draw';
export type Difficulty = 'medium' | 'boss';

export interface NewGameResponse {
  gameId: string;
  board: Cell[];
  status: GameStatus;
  difficulty: Difficulty;
}

export interface MoveResponse {
  gameId: string;
  board: Cell[];
  status: GameStatus;
  botMove: number | null;
  winLine: number[] | null;
  scoreChange: number;
  bonusWin: boolean;
  score: number;
  consecutiveWins: number;
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  };
}

export async function startGame(difficulty: Difficulty = 'medium'): Promise<NewGameResponse> {
  const res = await fetch(`${API}/game`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ difficulty }),
  });
  if (!res.ok) throw new Error('Failed to start game');
  return res.json() as Promise<NewGameResponse>;
}

export async function makeMove(gameId: string, position: number): Promise<MoveResponse> {
  const res = await fetch(`${API}/game/${gameId}/move`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ position }),
  });
  if (!res.ok) throw new Error('Failed to make move');
  return res.json() as Promise<MoveResponse>;
}
