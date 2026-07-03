import { Monster } from './Monster';
import { SpriteSheet } from '../rendering/SpriteSheet';

export class LineMonster extends Monster {
  private nodes: number[][];
  private nextNode: number;
  private speed: number;
  private sheet: SpriteSheet;

  constructor(
    img: HTMLImageElement,
    nodes: number[][],
    startX: number,
    startY: number,
    dx: number,
    dy: number,
    speed: number,
    levelHeight: number
  ) {
    super(0, 0, dx, dy, levelHeight);
    this.x = startX;
    this.origX = startX;
    this.y = startY;
    this.origY = startY;
    this.nodes = nodes;
    this.nextNode = 1;
    this.speed = speed;
    this.dx = speed;
    this.origDX = speed;
    this.sheet = new SpriteSheet(img);
  }

  move(): void {
    if (!this.dying && !this.dead) {
      this.currentFrame++;
      if (this.currentFrame >= 2) this.currentFrame = 0;

      const targetX = this.nodes[this.nextNode][0];
      const targetY = this.nodes[this.nextNode][1];

      const diffX = targetX - this.x;
      const diffY = targetY - this.y;
      const dist = Math.sqrt(diffX * diffX + diffY * diffY);

      if (dist < this.speed) {
        this.x = targetX;
        this.y = targetY;
        this.nextNode++;
        if (this.nextNode >= this.nodes.length) this.nextNode = 0;
      } else {
        this.x += Math.round((diffX / dist) * this.speed);
        this.y += Math.round((diffY / dist) * this.speed);
      }

      if (diffX > 0) this.currentMove = this.M_RIGHT;
      else if (diffX < 0) this.currentMove = this.M_LEFT;
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
