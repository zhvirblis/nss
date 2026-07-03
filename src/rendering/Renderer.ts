import { SCREEN_W, SCREEN_H } from '../core/types';

export class Renderer {
  readonly offscreen: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly display: HTMLCanvasElement;
  private dCtx: CanvasRenderingContext2D;

  constructor(display: HTMLCanvasElement) {
    this.display = display;
    this.dCtx = display.getContext('2d')!;
    this.offscreen = document.createElement('canvas');
    this.offscreen.width = SCREEN_W;
    this.offscreen.height = SCREEN_H;
    this.ctx = this.offscreen.getContext('2d')!;
  }

  resize(): void {
    const maxW = window.innerWidth;
    const maxH = window.innerHeight;
    const scale = Math.min(maxW / SCREEN_W, maxH / SCREEN_H);
    const w = Math.floor(SCREEN_W * scale);
    const h = Math.floor(SCREEN_H * scale);
    this.display.width = w;
    this.display.height = h;
    this.display.style.width = `${w}px`;
    this.display.style.height = `${h}px`;
    this.dCtx.imageSmoothingEnabled = false;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, SCREEN_W, SCREEN_H);
  }

  present(): void {
    this.dCtx.imageSmoothingEnabled = false;
    this.dCtx.drawImage(this.offscreen, 0, 0, this.display.width, this.display.height);
  }

  fillSky(): void {
    this.ctx.fillStyle = '#CCCCFF';
    this.ctx.fillRect(0, 0, SCREEN_W, SCREEN_H - 7);
  }

  fillRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }
}
