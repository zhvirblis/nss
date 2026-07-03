import { Monster } from './Monster';
import { TileMap } from '../game/TileMap';
import { SpriteSheet } from '../rendering/SpriteSheet';

export class JumpingMonster extends Monster {
  private jumpCounter = 0;
  private jumpFrequency: number;
  private sheet: SpriteSheet;
  private jumping = false;
  private falling = false;
  private onLeftRamp = false;
  private onRightRamp = false;
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
    if (this.dx > 0) this.currentMove = this.M_RIGHT;
    else if (this.dx < 0) this.currentMove = this.M_LEFT;
  }

  reset(): void {
    if (!this.dying && !this.dead) {
      super.reset();
      this.jumpCounter = 0;
      this.jumping = false;
      this.falling = false;
      this.onLeftRamp = false;
      this.onRightRamp = false;
      if (this.dx > 0) this.currentMove = this.M_RIGHT;
      else if (this.dx < 0) this.currentMove = this.M_LEFT;
    }
  }

  move(tileMap?: TileMap): void {
    if (!this.dying && !this.dead) {
      const tm = tileMap!;

      if (this.jumpFrequency > 0) {
        this.jumpCounter++;
        if (this.jumpCounter >= this.jumpFrequency) {
          this.jumpCounter = 0;
          if (!this.falling) {
            this.dy = -8;
            this.jumping = true;
          }
        }
      }

      this.x += this.dx;
      this.y += this.dy;

      // Ground collision
      const tileCol = Math.floor((this.x + this.halfW) / 16);
      const rowAtFeet = Math.floor((this.y) / 16);
      const rowAboveFeet = Math.floor((this.y - 1) / 16);
      let groundRow = rowAtFeet;

      if (this.y >= 0) {
        if (!this.onLeftRamp && !this.onRightRamp) {
          const t = tm.getTile(tileCol, rowAboveFeet);
          if (t > 34 && t < 65) groundRow = rowAboveFeet;
        }

        const tile = tm.getTile(tileCol, groundRow);
        if (tile > 29 && tile < 90) {
          const subX = this.x + this.halfW - (tileCol << 4);
          if (tm.isRightRamp(tileCol, groundRow)) {
            const rampH = tm.getRampHeight(tileCol, groundRow, subX);
            const groundTop = (groundRow << 4) + 16 - rampH;
            if (this.y >= groundTop || this.onRightRamp) {
              this.y = groundTop;
              if (this.falling) {
                this.dy = 0;
                this.falling = false;
              }
              this.onRightRamp = true;
            } else {
              this.falling = true;
            }
          } else if (tm.isLeftRamp(tileCol, groundRow)) {
            const rampH = tm.getRampHeight(tileCol, groundRow, subX);
            const groundTop = (groundRow << 4) + 16 - rampH;
            if (this.y >= groundTop || this.onLeftRamp) {
              this.y = groundTop;
              if (this.falling) {
                this.dy = 0;
                this.falling = false;
              }
              this.onLeftRamp = true;
            } else {
              this.falling = true;
            }
          } else {
            this.y = groundRow << 4;
            this.dy = 0;
            this.falling = false;
          }
        }
      }

      // Left wall collision
      if (this.x >= 0) {
        const wallRow = Math.floor((this.y - this.halfH) / 16);
        const leftTileX = Math.floor(this.x / 16);
        if (this.y >= this.height) {
          const t = tm.getTile(leftTileX, wallRow);
          if (t > 34 && t < 90 && !tm.isLeftRamp(leftTileX, wallRow)) {
            if (tm.isRightRamp(leftTileX, wallRow)) {
              const subX = this.x - (leftTileX << 4);
              const rampH = tm.getRampHeight(leftTileX, wallRow, subX);
              const wallY = (wallRow << 4) + this.halfH - rampH;
              if (this.y - this.height > wallY) {
                this.x = (leftTileX << 4) + 16;
                this.dx = -this.dx;
              }
            } else {
              this.x = (leftTileX << 4) + 16;
              this.dx = -this.dx;
            }
          }
        }
      } else {
        this.x = 0;
        this.dx = -this.dx;
      }

      // Right wall collision
      const rightEdge = this.x + this.width;
      const mapWidth = tm.width << 4;
      if (rightEdge < mapWidth) {
        const wallRow = Math.floor((this.y - this.halfH) / 16);
        const rightTileX = Math.floor(rightEdge / 16);
        if (this.y >= this.height) {
          const t = tm.getTile(rightTileX, wallRow);
          if (t > 49 && t < 90 && !tm.isRightRamp(rightTileX, wallRow)) {
            if (tm.isLeftRamp(rightTileX, wallRow)) {
              const subX = rightEdge - (rightTileX << 4);
              const rampH = tm.getRampHeight(rightTileX, wallRow, subX);
              const wallY = (wallRow << 4) + this.halfH - rampH;
              if (this.y - this.height > wallY) {
                this.x = (rightTileX << 4) - this.width;
                this.dx = -this.dx;
              }
            } else {
              this.x = (rightTileX << 4) - this.width;
              this.dx = -this.dx;
            }
          }
        }
      } else {
        this.x = mapWidth - this.width - 1;
        this.dx = -this.dx;
      }

      // Ramp state cleanup
      const adjustedRow = Math.floor(this.y / 16);
      if (this.onLeftRamp && !tm.isLeftRamp(tileCol, adjustedRow)) this.onLeftRamp = false;
      if (this.onRightRamp && !tm.isRightRamp(tileCol, adjustedRow)) this.onRightRamp = false;

      // Fall detection
      if (this.y >= 0 && !this.jumping && !this.falling) {
        const t = tm.getTile(tileCol, adjustedRow);
        if (t < 35 || t > 90) this.falling = true;
      }

      // Gravity
      if ((this.jumping || this.falling) && this.dy < 8) {
        this.dy++;
        if (this.jumping && this.dy === 0) {
          this.falling = true;
          this.jumping = false;
        }
      }

      // Direction/state sprite
      if (this.jumping || this.falling) {
        this.currentMove = this.dx >= 0 ? this.M_JUMP_RIGHT : this.M_JUMP_LEFT;
      } else {
        this.currentMove = this.dx >= 0 ? this.M_RIGHT : this.M_LEFT;
      }

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
    const sx = this.currentFrame * this.width;
    const sy = this.currentMove * JumpingMonster.FH;
    this.sheet.draw(ctx, sx, sy, this.width, JumpingMonster.FH, xOff + this.x, yOff + this.y - JumpingMonster.FH);
  }
}
