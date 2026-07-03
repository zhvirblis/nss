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
    const ox = Math.floor((renderer.bufferWidth - 176) / 2);
    renderer.ctx.drawImage(img, ox, 0, 176, renderer.bufferHeight);
    renderer.present();
  }

  get elapsed(): number {
    return this.timer;
  }
}
