import { Monster } from './Monster';
import { TileMap } from '../game/TileMap';
import { SpriteSheet } from '../rendering/SpriteSheet';

export class JumpingMonster extends Monster {
  private jumpCounter = 0;
  private jumpFrequency: number;
  private sheet: SpriteSheet;
  private static readonly FH = 20;

  constructor(
    img: HTMLImageElement,
    _tileMap: TileMap,
    tileX: number,
    tileY: number,
    dx: number,
    dy: number,
    jumpFreq: number,
    levelHeight: number
  ) {
    super(tileX, tileY, dx, dy, levelHeight);
    this.jumpFrequency = jumpFreq;
    this.sheet = new SpriteSheet(img);
  }

  move(tileMap?: TileMap): void {
    if (!this.dying && !this.dead) {
      this.currentFrame++;
      if (this.currentFrame >= 2) this.currentFrame = 0;

      if (this.x < 0 || this.x > (tileMap?.width ?? 80) * 16) {
        this.dx = -this.dx;
      }

      this.x += this.dx;

      this.jumpCounter++;
      if (this.jumpCounter >= this.jumpFrequency) {
        this.currentMove = this.M_JUMP_LEFT;
        this.y += this.dy;
        if (this.jumpCounter >= this.jumpFrequency + 30) {
          this.jumpCounter = 0;
          this.currentMove = this.M_RIGHT;
        }
      }

      if (this.y > this.levelHeight) this.dead = true;
    } else if (this.dying) {
      this.y += this.dy;
      this.dy += 1;
      if (this.y > this.levelHeight) this.dead = true;
    }
  }

  render(ctx: CanvasRenderingContext2D, xOff: number, yOff: number): void {
    if (!this.active && !this.dying) return;
    const sx = this.currentFrame * this.width;
    const sy = this.currentMove * JumpingMonster.FH;
    this.sheet.draw(ctx, sx, sy, this.width, JumpingMonster.FH, xOff + this.x, yOff + this.y - JumpingMonster.FH);
  }
}
