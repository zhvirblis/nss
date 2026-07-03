import { Renderer } from './Renderer';

export class ScreenRenderer {
  private renderer: Renderer;

  constructor(renderer: Renderer) {
    this.renderer = renderer;
  }

  drawEndScreen(): void {
    this.renderer.fillRect(0, 0, this.renderer.bufferWidth, this.renderer.bufferHeight, '#00196A');
  }

  drawLevelStart(levelNum: number): void {
    const text = `Level ${levelNum + 1}`;
    this.drawBoxedText(text, this.renderer.bufferWidth / 2, this.renderer.bufferHeight / 2);
  }

  drawGameOver(): void {
    this.drawBoxedText('GAME OVER', this.renderer.bufferWidth / 2, this.renderer.bufferHeight / 2);
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
}
