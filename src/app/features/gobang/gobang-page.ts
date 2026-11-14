// src/app/features/gobang/gobang-page.ts

import { Component, computed, signal } from '@angular/core';
import {
  BOARD_SIZE,
  type Board,
  type GameResult,
  type Player,
  type Position,
} from '../../core/game/gobang.types';
import { GobangEngine } from '../../core/game/gobang-engine';
import { BoardComponent } from './components/board/board';
import { StatusBarComponent } from './components/status-bar/status-bar';

@Component({
  selector: 'app-gobang-page',
  imports: [BoardComponent, StatusBarComponent],
  templateUrl: './gobang-page.html',
  styleUrl: './gobang-page.scss',
})
export class GobangPageComponent {
  // ── Core game signals ──────────────────────────────────────
  protected readonly board = signal<Board>(
    GobangEngine.createBoard(BOARD_SIZE),
  );
  protected readonly currentPlayer = signal<Player>('black');
  protected readonly result = signal<GameResult>(null);
  protected readonly lastMove = signal<Position | null>(null);
  protected readonly winningLine = signal<Position[]>([]);

  // ── Derived signals (computed) ─────────────────────────────
  protected readonly moveCount = computed(
    () =>
      this.board()
        .flat()
        .filter((cell) => cell !== null).length,
  );

  protected readonly isGameOver = computed(
    () => this.result() !== null,
  );

  // ── Event handlers ─────────────────────────────────────────
  protected onCellClick(pos: Position): void {
    if (this.isGameOver()) return;
    if (this.board()[pos.row][pos.col] !== null) return;

    const player = this.currentPlayer();

    // 1. Place the stone (immutable update).
    const newBoard = GobangEngine.placeStone(
      this.board(),
      pos.row,
      pos.col,
      player,
    );
    this.board.set(newBoard);
    this.lastMove.set(pos);

    // 2. Check for a win.
    const winner = GobangEngine.checkWin(
      newBoard,
      pos.row,
      pos.col,
    );

    if (winner) {
      this.result.set(winner);
      this.winningLine.set(
        GobangEngine.getWinningLine(newBoard, pos.row, pos.col),
      );
      return;
    }

    // 3. Check for a draw.
    if (GobangEngine.isDraw(newBoard)) {
      this.result.set('draw');
      return;
    }

    // 4. Switch turn.
    this.currentPlayer.update((p) =>
      p === 'black' ? 'white' : 'black',
    );
  }

  protected resetGame(): void {
    this.board.set(GobangEngine.createBoard(BOARD_SIZE));
    this.currentPlayer.set('black');
    this.result.set(null);
    this.lastMove.set(null);
    this.winningLine.set([]);
  }
}