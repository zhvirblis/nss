import { SCREEN_W, SCREEN_H, HALF_GAME_W, HALF_GAME_H } from '../core/types';
import { Renderer } from './Renderer';

export class ScreenRenderer {
  private renderer: Renderer;

  constructor(renderer: Renderer) {
    this.renderer = renderer;
  }

  drawLevelStart(levelNum: number): void {
    const text = `Level ${levelNum + 1}`;
    this.drawBoxedText(text, HALF_GAME_W, HALF_GAME_H);
  }

  drawPaused(): void {
    this.drawBoxedText('PAUSED', HALF_GAME_W, HALF_GAME_H);
  }

  drawGameOver(): void {
    this.drawBoxedText('GAME OVER', HALF_GAME_W, HALF_GAME_H);
  }

  drawLevelClear(score: number, time: number): void {
    const lines = [
      `LEVEL CLEAR!`,
      `Score: ${score}`,
      `Time: ${this.formatTime(time)}`,
    ];
    this.drawBoxedLines(lines, HALF_GAME_W, 10);
  }

  drawEndScreen(): void {
    this.renderer.fillRect(0, 0, SCREEN_W, SCREEN_H, '#00196A');
  }

  drawSplash(img: HTMLImageElement): void {
    this.renderer.ctx.drawImage(img, 0, 0, SCREEN_W, SCREEN_H);
  }

  private drawBoxedText(text: string, cx: number, cy: number): void {
    const ctx = this.renderer.ctx;
    ctx.font = '8px monospace';
    const m = ctx.measureText(text);
    const w = m.width;
    const h = 10;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(cx - w / 2 - 2, cy - 2, w + 4, h + 2);
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(cx - w / 2 - 2, cy - 2, w + 4, h + 2);
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText(text, cx, cy + h - 3);
  }

  private drawBoxedLines(lines: string[], cx: number, cy: number): void {
    const ctx = this.renderer.ctx;
    ctx.font = '8px monospace';
    let maxW = 0;
    const lineH = 10;
    for (const l of lines) {
      maxW = Math.max(maxW, ctx.measureText(l).width);
    }
    const totalH = lines.length * lineH;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(cx - maxW / 2 - 2, cy - 2, maxW + 4, totalH + 2);
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(cx - maxW / 2 - 2, cy - 2, maxW + 4, totalH + 2);
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], cx, cy + i * lineH + lineH - 3);
    }
  }

  private formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
}
