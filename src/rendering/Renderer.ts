import { SCREEN_W, SCREEN_H } from '../core/types';

export class Renderer {
  offscreen: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  readonly display: HTMLCanvasElement;
  private dCtx: CanvasRenderingContext2D;
  bufferWidth = SCREEN_W;
  bufferHeight = SCREEN_H;

  constructor(display: HTMLCanvasElement) {
    this.display = display;
    this.dCtx = display.getContext('2d')!;
    this.offscreen = document.createElement('canvas');
    this.offscreen.width = SCREEN_W;
    this.offscreen.height = SCREEN_H;
    this.ctx = this.offscreen.getContext('2d')!;
  }

  setBufferSize(w: number, h: number): void {
    if (w === this.bufferWidth && h === this.bufferHeight) return;
    this.bufferWidth = w;
    this.bufferHeight = h;
    this.offscreen.width = w;
    this.offscreen.height = h;
    this.ctx = this.offscreen.getContext('2d')!;
  }

  resize(): void {
    this.display.width = window.innerWidth;
    this.display.height = window.innerHeight;
    this.display.style.width = `${window.innerWidth}px`;
    this.display.style.height = `${window.innerHeight}px`;
    this.dCtx.imageSmoothingEnabled = false;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.bufferWidth, this.bufferHeight);
  }

  present(): void {
    this.dCtx.fillStyle = '#000';
    this.dCtx.fillRect(0, 0, this.display.width, this.display.height);
    this.dCtx.imageSmoothingEnabled = false;
    const scale = this.display.width / this.bufferWidth;
    const gameH = Math.round(this.bufferHeight * scale);

    if (gameH <= this.display.height) {
      const oy = Math.floor((this.display.height - gameH) / 2);
      this.dCtx.drawImage(this.offscreen, 0, 0, this.bufferWidth, this.bufferHeight,
        0, oy, this.display.width, gameH);
    } else {
      const srcH = Math.round(this.display.height / scale);
      const srcY = Math.floor((this.bufferHeight - srcH) / 2);
      this.dCtx.drawImage(this.offscreen, 0, srcY, this.bufferWidth, srcH,
        0, 0, this.display.width, this.display.height);
    }
  }

  fillSky(): void {
    this.ctx.fillStyle = '#CCEEFF';
    this.ctx.fillRect(0, 0, this.bufferWidth, this.bufferHeight - 7);
  }

  fillRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }
}
