'use client';

import type { Cell } from '../lib/game';

interface BoardProps {
  board: Cell[];
  onCellClick: (index: number) => void;
  disabled: boolean;
  winLine: number[] | null;
  lastBotMove: number | null;
}

const SYMBOL_STYLE: Record<string, string> = {
  X: 'text-blue-400',
  O: 'text-rose-400',
};

export default function Board({ board, onCellClick, disabled, winLine, lastBotMove }: BoardProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {board.map((cell, i) => {
        const isWinCell = winLine?.includes(i) ?? false;
        const isBotMove = lastBotMove === i;
        const isEmpty = cell === null;

        let cellClass =
          'w-24 h-24 flex items-center justify-center rounded-xl text-4xl font-black border-2 transition-all duration-200 select-none ';

        if (isWinCell) {
          cellClass += 'border-yellow-400 bg-yellow-400/20 scale-105 ';
        } else if (isBotMove && cell === 'O') {
          cellClass += 'border-rose-500 bg-rose-500/10 ';
        } else {
          cellClass += 'border-gray-700 bg-gray-800 ';
        }

        if (isEmpty && !disabled) {
          cellClass += 'cursor-pointer hover:border-gray-500 hover:bg-gray-700 ';
        } else if (isEmpty) {
          cellClass += 'cursor-not-allowed ';
        } else {
          cellClass += 'cursor-default ';
        }

        return (
          <button
            key={i}
            onClick={() => isEmpty && !disabled && onCellClick(i)}
            className={cellClass}
            disabled={!isEmpty || disabled}
            aria-label={`Cell ${i + 1}: ${cell ?? 'empty'}`}
          >
            {cell && <span className={SYMBOL_STYLE[cell]}>{cell}</span>}
          </button>
        );
      })}
    </div>
  );
}
