// src/app/features/gobang/components/board/board.ts

import {
  Component,
  ElementRef,
  afterNextRender,
  computed,
  input,
  output,
  signal,
  viewChild,
  type OnDestroy,
} from '@angular/core';
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
export class BoardComponent implements OnDestroy {
  // ── Signal inputs (read-only from the parent) ──────────────
  readonly board = input.required<Board>();
  readonly currentPlayer = input.required<Player>();
  readonly disabled = input(false);
  readonly lastMove = input<Position | null>(null);
  readonly winningLine = input<Position[]>([]);

  // ── Signal output (emitted to the parent) ──────────────────
  readonly cellClick = output<Position>();

  // ── Local UI state (only the template reads it) ────────────
  protected readonly hover = signal<Position | null>(null);

  // ── Canvas reference (signal query) ────────────────────────
  private readonly canvasRef =
    viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private resizeObserver: ResizeObserver | null = null;
  private readonly padding = 30;

  constructor() {
    afterNextRender(() => {
      this.setupCanvas();
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  // ── Coordinate math ────────────────────────────────────────
  protected onMouseMove(event: MouseEvent): void {
    if (this.disabled()) return;
    const pos = this.eventToPosition(event);
    this.hover.set(pos);
    this.draw();
  }

  protected onMouseLeave(): void {
    this.hover.set(null);
    this.draw();
  }

  protected onClick(event: MouseEvent): void {
    if (this.disabled()) return;
    const pos = this.eventToPosition(event);
    if (pos && this.board()[pos.row][pos.col] === null) {
      this.cellClick.emit(pos);
    }
  }

  private eventToPosition(event: MouseEvent): Position | null {
    const canvas = this.canvasRef().nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const cellSize =
      (canvas.width - this.padding * 2) / (BOARD_SIZE - 1);
    const col = Math.round((x - this.padding) / cellSize);
    const row = Math.round((y - this.padding) / cellSize);

    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
      return null;
    }

    // Snap to the nearest intersection.
    const snapX = this.padding + col * cellSize;
    const snapY = this.padding + row * cellSize;
    const dist = Math.hypot(x - snapX, y - snapY);

    return dist < cellSize / 2 ? { row, col } : null;
  }

  // ── Canvas rendering ───────────────────────────────────────
  private setupCanvas(): void {
    const canvas = this.canvasRef().nativeElement;
    const container = canvas.parentElement!;

    this.resizeObserver = new ResizeObserver(() => {
      const size = Math.min(container.clientWidth, 600);
      canvas.width = size;
      canvas.height = size;
      this.draw();
    });

    this.resizeObserver.observe(container);
    this.draw();
  }

  private draw(): void {
    const canvas = this.canvasRef().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cellSize = (size - this.padding * 2) / (BOARD_SIZE - 1);

    // Background
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--board-bg')
      .trim() || '#deb887';
    ctx.fillRect(0, 0, size, size);

    // Grid lines
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--grid-color')
      .trim() || '#5c4033';
    ctx.lineWidth = 1;

    for (let i = 0; i < BOARD_SIZE; i++) {
      const pos = this.padding + i * cellSize;

      ctx.beginPath();
      ctx.moveTo(this.padding, pos);
      ctx.lineTo(size - this.padding, pos);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pos, this.padding);
      ctx.lineTo(pos, size - this.padding);
      ctx.stroke();
    }

    // Star points (天元 + 4 星位)
    const stars = [3, 7, 11];
    ctx.fillStyle = '#5c4033';
    for (const r of stars) {
      for (const c of stars) {
        ctx.beginPath();
        ctx.arc(
          this.padding + c * cellSize,
          this.padding + r * cellSize,
          3,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }

    // Stones
    const board = this.board();
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = board[r][c];
        if (!cell) continue;
        this.drawStone(
          ctx,
          this.padding + c * cellSize,
          this.padding + r * cellSize,
          cellSize,
          cell,
        );
      }
    }

    // Hover ghost stone
    const hover = this.hover();
    if (hover && !this.disabled() && board[hover.row][hover.col] === null) {
      ctx.globalAlpha = 0.35;
      this.drawStone(
        ctx,
        this.padding + hover.col * cellSize,
        this.padding + hover.row * cellSize,
        cellSize,
        this.currentPlayer(),
      );
      ctx.globalAlpha = 1;
    }

    // Last-move marker
    const last = this.lastMove();
    if (last) {
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(
        this.padding + last.col * cellSize,
        this.padding + last.row * cellSize,
        4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Winning line highlight
    for (const pos of this.winningLine()) {
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        this.padding + pos.col * cellSize,
        this.padding + pos.row * cellSize,
        cellSize / 2 - 4,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
  }

  private drawStone(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    cellSize: number,
    player: Player,
  ): void {
    const radius = cellSize / 2 - 3;
    const gradient = ctx.createRadialGradient(
      x - radius / 3,
      y - radius / 3,
      radius / 4,
      x,
      y,
      radius,
    );

    if (player === 'black') {
      gradient.addColorStop(0, '#555');
      gradient.addColorStop(1, '#000');
    } else {
      gradient.addColorStop(0, '#fff');
      gradient.addColorStop(1, '#ccc');
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}