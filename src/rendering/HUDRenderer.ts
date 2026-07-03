import { GAME_H, STATUS_H } from '../core/types';
import { SpriteSheet } from './SpriteSheet';

export class HUDRenderer {
  private digits: SpriteSheet[];
  private livesImg: SpriteSheet;
  private coinsImg: SpriteSheet;
  private timerImg: SpriteSheet;
  private optionsImg: SpriteSheet;

  constructor(statusImg: HTMLImageElement) {
    this.digits = [];
    for (let i = 0; i < 11; i++) this.digits[i] = new SpriteSheet(statusImg);
    this.livesImg = new SpriteSheet(statusImg);
    this.coinsImg = new SpriteSheet(statusImg);
    this.timerImg = new SpriteSheet(statusImg);
    this.optionsImg = new SpriteSheet(statusImg);
  }

  render(ctx: CanvasRenderingContext2D, score: number, lives: number, coins: number, timer: number): void {
    const barY = GAME_H;
    const bw = ctx.canvas.width;
    const sx = bw / 176;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, barY, bw, STATUS_H);

    let x = 0;
    let div = 100000;
    for (let i = 0; i < 6; i++) {
      const d = Math.floor(score / div) % 10;
      this.digits[d].draw(ctx, d * 3, 0, 3, 5, x * sx, barY + 1);
      div /= 10;
      x += 4;
    }
    x += 5;
    this.livesImg.draw(ctx, 33, 0, 7, 7, x * sx, barY);
    x += 8;
    this.digits[Math.floor(lives / 10) % 10].draw(ctx, (Math.floor(lives / 10) % 10) * 3, 0, 3, 5, x * sx, barY + 1);
    x += 4;
    this.digits[lives % 10].draw(ctx, (lives % 10) * 3, 0, 3, 5, x * sx, barY + 1);
    x += 9;
    this.coinsImg.draw(ctx, 40, 0, 7, 7, x * sx, barY);
    x += 8;
    this.digits[Math.floor(coins / 10) % 10].draw(ctx, (Math.floor(coins / 10) % 10) * 3, 0, 3, 5, x * sx, barY + 1);
    x += 4;
    this.digits[coins % 10].draw(ctx, (coins % 10) * 3, 0, 3, 5, x * sx, barY + 1);
    x += 9;
    this.timerImg.draw(ctx, 47, 0, 7, 7, x * sx, barY);
    x += 8;

    const mins = Math.floor(timer / 60);
    const secs = timer % 60;
    this.digits[Math.floor(mins / 10) % 10].draw(ctx, (Math.floor(mins / 10) % 10) * 3, 0, 3, 5, x * sx, barY + 1);
    x += 4;
    this.digits[mins % 10].draw(ctx, (mins % 10) * 3, 0, 3, 5, x * sx, barY + 1);
    x += 4;
    this.digits[10].draw(ctx, 30, 0, 3, 5, x * sx, barY + 1);
    x += 4;
    this.digits[Math.floor(secs / 10) % 10].draw(ctx, (Math.floor(secs / 10) % 10) * 3, 0, 3, 5, x * sx, barY + 1);
    x += 4;
    this.digits[secs % 10].draw(ctx, (secs % 10) * 3, 0, 3, 5, x * sx, barY + 1);

    this.optionsImg.draw(ctx, 54, 0, 7, 7, bw - 7, barY);
  }
}
