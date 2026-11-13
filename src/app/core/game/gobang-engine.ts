// src/app/core/game/gobang-engine.ts

import {
  BOARD_SIZE,
  WIN_COUNT,
  type Board,
  type Cell,
  type Player,
  type Position,
} from './gobang.types';

export class GobangEngine {
  /** Create an empty 15×15 board. */
  static createBoard(size = BOARD_SIZE): Board {
    return Array.from({ length: size }, () =>
      Array.from({ length: size }, () => null as Cell),
    );
  }

  /**
   * Return a NEW board with the stone placed.
   * Immutable update—the signal consumer relies on reference changes.
   */
  static placeStone(
    board: Board,
    row: number,
    col: number,
    player: Player,
  ): Board {
    return board.map((r, ri) =>
      r.map((c, ci) => (ri === row && ci === col ? player : c)),
    );
  }

  /**
   * Check whether the stone just placed at (row, col) forms five-in-a-row.
   * Returns the winning player, or null.
   */
  static checkWin(
    board: Board,
    row: number,
    col: number,
  ): Player | null {
    const player = board[row][col];
    if (!player) return null;

    const directions: [number, number][] = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal ↘
      [1, -1],  // anti-diagonal ↙
    ];

    for (const [dr, dc] of directions) {
      let count = 1;

      for (const sign of [1, -1] as const) {
        let r = row + dr * sign;
        let c = col + dc * sign;

        while (
          r >= 0 &&
          r < board.length &&
          c >= 0 &&
          c < board[0].length &&
          board[r][c] === player
        ) {
          count++;
          r += dr * sign;
          c += dc * sign;
        }
      }

      if (count >= WIN_COUNT) {
        return player;
      }
    }

    return null;
  }

  /** The board is full and no one has won. */
  static isDraw(board: Board): boolean {
    return board.every((row) => row.every((cell) => cell !== null));
  }

  /**
   * Return the five (or more) winning cells for highlight.
   * Called only after checkWin confirms a winner.
   */
  static getWinningLine(
    board: Board,
    row: number,
    col: number,
  ): Position[] {
    const player = board[row][col];
    if (!player) return [];

    const directions: [number, number][] = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    for (const [dr, dc] of directions) {
      const line: Position[] = [{ row, col }];

      for (const sign of [1, -1] as const) {
        let r = row + dr * sign;
        let c = col + dc * sign;

        while (
          r >= 0 &&
          r < board.length &&
          c >= 0 &&
          c < board[0].length &&
          board[r][c] === player
        ) {
          line.push({ row: r, col: c });
          r += dr * sign;
          c += dc * sign;
        }
      }

      if (line.length >= WIN_COUNT) {
        return line;
      }
    }

    return [];
  }
}