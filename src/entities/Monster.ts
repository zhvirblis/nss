import { TileMap } from '../game/TileMap';

export abstract class Monster {
  x: number;
  origX: number;
  y: number;
  origY: number;
  dx: number;
  origDX: number;
  dy: number;
  origDY: number;
  height = 16;
  halfH = 8;
  width = 16;
  halfW = 8;
  currentMove = 3;
  currentFrame = 0;
  levelHeight: number;
  active = true;
  dying = false;
  dead = false;

  readonly M_UP = 0;
  readonly M_DOWN = 1;
  readonly M_LEFT = 2;
  readonly M_RIGHT = 3;
  readonly M_DEAD = 4;
  readonly M_JUMP_LEFT = 5;
  readonly M_JUMP_RIGHT = 6;

  constructor(
    tileX: number,
    tileY: number,
    dx: number,
    dy: number,
    levelHeight: number
  ) {
    this.x = tileX * 16;
    this.origX = tileX * 16;
    this.y = tileY * 16;
    this.origY = tileY * 16;
    this.levelHeight = levelHeight;
    this.dx = dx;
    this.origDX = dx;
    this.dy = dy;
    this.origDY = dy;
  }

  reset(): void {
    if (!this.dying && !this.dead) {
      this.x = this.origX;
      this.y = this.origY;
      this.dx = this.origDX;
      this.dy = this.origDY;
      this.dying = false;
      this.dead = false;
    }
    this.active = true;
  }

  checkActive(xOff: number, yOff: number, screenW: number, screenH: number): void {
    if (
      this.x < -xOff + screenW + 50 &&
      this.x > -xOff - 50 &&
      this.y < -yOff + screenH + 50 &&
      this.y > -yOff - 50
    ) {
      this.active = true;
    } else {
      this.active = false;
    }
  }

  collide(px: number, py: number): boolean {
    return (
      !this.dying &&
      this.x - 5 <= px &&
      this.x + this.width + 5 >= px &&
      this.y - 5 <= py &&
      this.y + this.height + 5 >= py
    );
  }

  shotCollide(
    x1: number, x0: number, y1: number, y0: number
  ): boolean {
    if (this.dying) return false;
    const xHit =
      (x0 >= this.x && x0 <= this.x + this.width) ||
      (x1 >= this.x && x1 <= this.x + this.width) ||
      (x0 < this.x && x1 > this.x + this.width);
    const yHit =
      (y0 >= this.y && y0 <= this.y + this.height) ||
      (y1 >= this.y && y1 <= this.y + this.height) ||
      (y0 < this.y && y1 > this.y + this.height);
    if (xHit && yHit) {
      this.dying = true;
      this.dy = -8;
      this.dx = 0;
      this.currentMove = 4;
      this.currentFrame = 0;
      return true;
    }
    return false;
  }

  abstract move(_tileMap?: TileMap): void;

  abstract render(ctx: CanvasRenderingContext2D, xOff: number, yOff: number): void;
}
