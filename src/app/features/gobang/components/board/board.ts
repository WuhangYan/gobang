// src/app/features/gobang/components/board/board.ts

import { Component, input, output } from '@angular/core';
import {
  BOARD_SIZE,
  type Board,
  type Player,
  type Position,
} from '../../../../core/game/gobang.types';

@Component({
  selector: 'app-board',
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class BoardComponent {
  // ── Signal inputs ──────────────────────────────────────────
  readonly board = input.required<Board>();
  readonly currentPlayer = input.required<Player>();
  readonly disabled = input(false);
  readonly lastMove = input<Position | null>(null);
  readonly winningLine = input<Position[]>([]);

  // ── Signal output ──────────────────────────────────────────
  readonly cellClick = output<Position>();

  // ── Layout constants (SVG viewBox units) ───────────────────
  protected readonly size = 600;
  protected readonly padding = 30;
  protected readonly cellSize =
    (this.size - this.padding * 2) / (BOARD_SIZE - 1);
  protected readonly stoneRadius = this.cellSize / 2 - 3;

  protected readonly gridIndices = Array.from(
    { length: BOARD_SIZE },
    (_, i) => i,
  );
  protected readonly starCoords = [3, 7, 11];

  protected pos(i: number): number {
    return this.padding + i * this.cellSize;
  }

  protected onCellClick(row: number, col: number): void {
    if (this.disabled()) return;
    if (this.board()[row][col] !== null) return;
    this.cellClick.emit({ row, col });
  }
}