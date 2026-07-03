import { Monster } from './Monster';
import { SpriteSheet } from '../rendering/SpriteSheet';

export class FlyingMonster extends Monster {
  private moveCounter = 0;
  private moveInterval: number;
  private sheet: SpriteSheet;

  private static readonly FW = 22;
  private static readonly FH = 22;
  private static readonly OFFSETS: Record<number, [number, number]> = {
    2: [0, -6],
    3: [-6, -6],
    4: [-3, -3],
  };

  constructor(
    img: HTMLImageElement,
    tileX: number,
    tileY: number,
    dx: number,
    dy: number,
    moveParam: number,
    levelHeight: number
  ) {
    super(tileX, tileY, dx, dy, levelHeight);
    this.moveInterval = moveParam;
    this.moveCounter = 0;
    this.sheet = new SpriteSheet(img);
  }

  move(): void {
    if (!this.dying && !this.dead) {
      this.moveCounter++;
      if (this.moveCounter >= this.moveInterval) {
        this.moveCounter = 0;
        if (this.x > this.origX) this.dx--;
        else if (this.x < this.origX) this.dx++;
        if (this.y > this.origY) this.dy--;
        else if (this.y < this.origY) this.dy++;
      }
      this.x += this.dx;
      this.y += this.dy;
      if (this.dx > 0) this.currentMove = this.M_RIGHT;
      else if (this.dx < 0) this.currentMove = this.M_LEFT;
      this.currentFrame++;
      if (this.currentFrame >= 2) this.currentFrame = 0;
    } else if (this.dying) {
      this.x += this.dx;
      this.y += this.dy;
      if (this.dy < 8) this.dy++;
      if (this.y > this.levelHeight) this.dead = true;
    }
  }

  render(ctx: CanvasRenderingContext2D, xOff: number, yOff: number): void {
    if (!this.active && !this.dying) return;
    const off = FlyingMonster.OFFSETS[this.currentMove] ?? [0, 0];
    this.sheet.draw(ctx,
      this.currentFrame * FlyingMonster.FW,
      this.currentMove * FlyingMonster.FH,
      FlyingMonster.FW, FlyingMonster.FH,
      xOff + this.x + off[0],
      yOff + this.y + off[1]);
  }
}
