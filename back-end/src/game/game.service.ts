import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Game, GameDocument, Cell, GameStatus } from './schemas/game.schema';
import { UsersService, ScoreUpdate } from '../users/users.service';

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export type Difficulty = 'medium' | 'boss';

export interface MoveResult {
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

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    private usersService: UsersService,
  ) {}

  async createGame(
    userId: string,
    difficulty: Difficulty = 'medium',
  ): Promise<{ gameId: string; board: Cell[]; status: GameStatus; difficulty: Difficulty }> {
    await this.gameModel.updateMany(
      { userId: new Types.ObjectId(userId), status: 'playing' },
      { status: 'draw' },
    );

    const game = await this.gameModel.create({
      userId: new Types.ObjectId(userId),
      board: Array(9).fill(null),
      status: 'playing',
      difficulty,
    });

    return {
      gameId: (game._id as object).toString(),
      board: game.board,
      status: game.status,
      difficulty: game.difficulty,
    };
  }

  async makeMove(gameId: string, userId: string, position: number): Promise<MoveResult> {
    const game = await this.gameModel.findById(gameId);
    if (!game) throw new NotFoundException('Game not found');
    if (game.userId.toString() !== userId) throw new BadRequestException('Not your game');
    if (game.status !== 'playing') throw new BadRequestException('Game is already over');
    if (position < 0 || position > 8) throw new BadRequestException('Invalid position');
    if (game.board[position] !== null) throw new BadRequestException('Cell already taken');

    const board = [...game.board] as Cell[];
    let botMove: number | null = null;
    let winLine: number[] | null = null;
    let status: GameStatus = 'playing';

    board[position] = 'X';
    const playerWinLine = this.getWinLine(board, 'X');

    if (playerWinLine) {
      status = 'win';
      winLine = playerWinLine;
    } else if (board.every((c) => c !== null)) {
      status = 'draw';
    } else {
      botMove = game.difficulty === 'boss'
        ? this.getBossMove(board)
        : this.getMediumMove(board);

      board[botMove] = 'O';
      const botWinLine = this.getWinLine(board, 'O');

      if (botWinLine) {
        status = 'lose';
        winLine = botWinLine;
      } else if (board.every((c) => c !== null)) {
        status = 'draw';
      }
    }

    game.set('board', board);
    game.status = status;
    await game.save();

    const user = await this.usersService.findById(userId);
    let scoreInfo: ScoreUpdate = {
      scoreChange: 0,
      bonusWin: false,
      newScore: user?.score ?? 0,
      consecutiveWins: user?.consecutiveWins ?? 0,
    };

    if (status !== 'playing') {
      const result = status === 'win' ? 'win' : status === 'lose' ? 'lose' : 'draw';
      scoreInfo = await this.usersService.updateScore(userId, result);
    }

    return {
      gameId: (game._id as object).toString(),
      board,
      status,
      botMove,
      winLine,
      scoreChange: scoreInfo.scoreChange,
      bonusWin: scoreInfo.bonusWin,
      score: scoreInfo.newScore,
      consecutiveWins: scoreInfo.consecutiveWins,
    };
  }

  // Medium: 35% pure random → win if possible → block → random
  // Bot makes mistakes often enough that player can win with basic moves
  private getMediumMove(board: Cell[]): number {
    const empty = board.reduce<number[]>((acc, c, i) => {
      if (c === null) acc.push(i);
      return acc;
    }, []);

    // 35% chance: skip all logic and play random
    if (Math.random() < 0.35) {
      return empty[Math.floor(Math.random() * empty.length)];
    }

    // Take winning move
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        const wins = !!this.getWinLine(board, 'O');
        board[i] = null;
        if (wins) return i;
      }
    }

    // Block player (only 70% of remaining cases — still makes mistakes)
    if (Math.random() < 0.70) {
      for (let i = 0; i < 9; i++) {
        if (!board[i]) {
          board[i] = 'X';
          const blocks = !!this.getWinLine(board, 'X');
          board[i] = null;
          if (blocks) return i;
        }
      }
    }

    return empty[Math.floor(Math.random() * empty.length)];
  }

  // Boss: full Minimax — unbeatable
  private getBossMove(board: Cell[]): number {
    let bestVal = -Infinity;
    let bestMove = 0;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        const val = this.minimax(board, false, 0);
        board[i] = null;
        if (val > bestVal) {
          bestVal = val;
          bestMove = i;
        }
      }
    }
    return bestMove;
  }

  private getWinLine(board: Cell[], symbol: 'X' | 'O'): number[] | null {
    for (const line of WIN_LINES) {
      const [a, b, c] = line;
      if (board[a] === symbol && board[b] === symbol && board[c] === symbol) {
        return line;
      }
    }
    return null;
  }

  private minimax(board: Cell[], isMaximizing: boolean, depth: number): number {
    if (this.getWinLine(board, 'O')) return 10 - depth;
    if (this.getWinLine(board, 'X')) return depth - 10;
    if (board.every((c) => c !== null)) return 0;

    if (isMaximizing) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!board[i]) {
          board[i] = 'O';
          best = Math.max(best, this.minimax(board, false, depth + 1));
          board[i] = null;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!board[i]) {
          board[i] = 'X';
          best = Math.min(best, this.minimax(board, true, depth + 1));
          board[i] = null;
        }
      }
      return best;
    }
  }
}
