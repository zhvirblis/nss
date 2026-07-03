import { Monster } from './Monster';
import { SpriteSheet } from '../rendering/SpriteSheet';

export class FlyingMonster extends Monster {
  private moveIndex = 0;
  private moveFrameCounter = 0;
  private sheet: SpriteSheet;

  constructor(
    img: HTMLImageElement,
    tileX: number,
    tileY: number,
    dx: number,
    dy: number,
    _moveParam: number,
    levelHeight: number
  ) {
    super(tileX, tileY, dx, dy, levelHeight);
    this.dx = 0;
    this.sheet = new SpriteSheet(img);
  }

  move(): void {
    if (!this.dying && !this.dead) {
      this.currentFrame++;
      if (this.currentFrame >= 2) this.currentFrame = 0;

      this.moveFrameCounter++;
      if (this.moveFrameCounter >= 5) {
        this.moveFrameCounter = 0;
        this.moveIndex++;
        if (this.moveIndex >= 32) this.moveIndex = 0;
      }
    } else if (this.dying) {
      this.y += this.dy;
      this.dy += 1;
      if (this.y > this.levelHeight) this.dead = true;
    }
  }

  render(ctx: CanvasRenderingContext2D, xOff: number, yOff: number): void {
    if (!this.active && !this.dying) return;
    const sx = this.currentFrame * this.width;
    const sy = this.currentMove * this.height;
    this.sheet.draw(ctx, sx, sy, this.width, this.height, xOff + this.x, yOff + this.y - this.height);
  }
}
