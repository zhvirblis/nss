import { TICK_MS } from './types';

export class GameLoop {
  private lastTime = 0;
  private accumulator = 0;
  private running = false;
  private rafId = 0;
  private paused = false;

  onUpdate: ((dt: number) => void) | null = null;
  onRender: ((alpha: number) => void) | null = null;

  start(): void {
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.rafId = requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
    this.lastTime = performance.now();
    this.accumulator = 0;
  }

  private frame = (timestamp: number): void => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.frame);

    if (this.paused) {
      this.lastTime = timestamp;
      this.onRender?.(1);
      return;
    }

    const delta = Math.min(timestamp - this.lastTime, 200);
    this.lastTime = timestamp;
    this.accumulator += delta;

    while (this.accumulator >= TICK_MS) {
      this.onUpdate?.(TICK_MS);
      this.accumulator -= TICK_MS;
    }

    const alpha = this.accumulator / TICK_MS;
    this.onRender?.(alpha);
  };
}
