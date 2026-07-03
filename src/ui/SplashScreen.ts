import { SCREEN_W, SCREEN_H } from '../core/types';
import { Renderer } from '../rendering/Renderer';

export class SplashScreen {
  private timer = 0;

  reset(): void {
    this.timer = 0;
  }

  update(dt: number): number {
    this.timer += dt;
    return this.timer;
  }

  render(renderer: Renderer, img: HTMLImageElement): void {
    renderer.clear();
    renderer.ctx.drawImage(img, 0, 0, SCREEN_W, SCREEN_H);
    renderer.present();
  }

  get elapsed(): number {
    return this.timer;
  }
}
