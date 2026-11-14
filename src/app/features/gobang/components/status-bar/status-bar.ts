// src/app/features/gobang/components/status-bar/status-bar.ts

import { Component, computed, input, output } from '@angular/core';
import type {
  GameResult,
  Player,
} from '../../../../core/game/gobang.types';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.html',
  styleUrl: './status-bar.scss',
})
export class StatusBarComponent {
  // ── Signal inputs ──────────────────────────────────────────
  readonly result = input.required<GameResult>();
  readonly currentPlayer = input.required<Player>();
  readonly moveCount = input.required<number>();

  // ── Signal output ──────────────────────────────────────────
  readonly newGame = output<void>();

  // ── Computed state ─────────────────────────────────────────
  protected readonly isGameOver = computed(() => this.result() !== null);

  protected readonly statusText = computed(() => {
    const result = this.result();

    if (result === 'black') return 'Black wins!';
    if (result === 'white') return 'White wins!';
    if (result === 'draw') return 'Draw.';

    const player = this.currentPlayer();
    return player === 'black' ? "Black's turn" : "White's turn";
  });

  protected readonly statusClass = computed(() => {
    const result = this.result();
    if (result === 'black') return 'winner-black';
    if (result === 'white') return 'winner-white';
    if (result === 'draw') return 'draw';
    return this.currentPlayer() === 'black' ? 'turn-black' : 'turn-white';
  });
}