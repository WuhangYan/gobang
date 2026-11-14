// src/app/core/game/gobang.types.ts

export type Player = 'black' | 'white';
export type Cell = Player | null;
export type Board = Cell[][];
export type GameResult = Player | 'draw' | null;

export interface Position {
  row: number;
  col: number;
}

export const BOARD_SIZE = 15;
export const WIN_COUNT = 5;