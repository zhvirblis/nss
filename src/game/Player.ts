import { TileMap } from './TileMap';
import { Physics } from './Physics';
import { SCREEN_W, GAME_H } from '../core/types';

export interface ScoreAnim {
  index: number;
  x: number;
  y: number;
  counter: number;
}

export class Player {
  x = 0;
  y = 0;
  origX = 0;
  origY = 0;
  oldY = 0;
  dx = 0;
  dy = 0;
  maxDX = 4096;
  maxDY = 4096;
  angle = 0;
  angleOff = 4;
  width = 16;
  height = 16;
  halfW = 8;
  halfH = 8;
  slowDown = 0;
  accelerate = 0;
  currentMove = 2;
  lives = 5;
  coins = 0;
  totalCoins = 0;
  score = 0;
  invincibilityCounter = 0;
  invincibilityFrame = 0;
  invincible = false;
  invincibilityScoreAdj = 0;

  jumping = false;
  falling = false;
  onLeftRamp = false;
  onRightRamp = false;
  dead = false;
  won = false;

  shots: (number[] | null)[] = [];
  scoreAnims: ScoreAnim[] = [];

  readonly P_LEFT = 1;
  readonly P_RIGHT = 2;
  readonly P_DEAD = 0;

  private physics = new Physics();

  reset(_tileMap: TileMap, startX: number, startY: number): void {
    this.x = startX;
    this.y = startY;
    this.origX = startX;
    this.origY = startY;
    this.dx = 0;
    this.dy = 0;
    this.angle = 0;
    this.angleOff = 4;
    this.currentMove = 2;
    this.falling = false;
    this.jumping = false;
    this.dead = false;
    this.won = false;
    this.onLeftRamp = false;
    this.onRightRamp = false;
    this.shots = [];
    this.scoreAnims = [];
  }

  initLevel(startX: number, startY: number): void {
    this.x = startX;
    this.y = startY;
    this.origX = startX;
    this.origY = startY;
    this.dx = 0;
    this.dy = 0;
    this.angle = 0;
    this.angleOff = 4;
    this.currentMove = 2;
    this.falling = false;
    this.jumping = false;
    this.dead = false;
    this.won = false;
    this.onLeftRamp = false;
    this.onRightRamp = false;
    this.shots = [];
    this.scoreAnims = [];
    this.invincibilityCounter = 0;
    this.invincible = false;
    this.invincibilityScoreAdj = 0;
    this.coins = 0;
  }

  jump(): void {
    if (
      (!this.jumping && !this.falling) ||
      (this.angle === 270 && this.x > 0) ||
      (this.angle === 90)
    ) {
      this.dx += (this.getSin(this.angle) * -2048) >> 8;
      this.dy += (this.getCos(this.angle) * -2048) >> 8;
      this.angle = 0;
      this.angleOff = 4;
      this.jumping = true;
      this.onLeftRamp = false;
      this.onRightRamp = false;
    }
  }

  fire(): number | null {
    for (let i = 0; i < 3; i++) {
      if (!this.shots[i]) {
        const shot: number[] = new Array(6);
        shot[0] = (this.x + this.halfW) << 8;
        shot[1] = (this.x + this.halfW) << 8;
        shot[2] = (this.y - this.halfH) << 8;
        shot[3] = (this.y - this.halfH) << 8;

        switch (this.currentMove) {
          case 1:
            shot[4] = this.dx - ((this.getCos(this.angle) * 2048) >> 8);
            shot[5] = this.angle !== 0
              ? ((this.y - this.oldY) << 8) - ((this.getSin(this.angle) * -2048) >> 8)
              : 0;
            break;
          case 2:
            shot[4] = this.dx + ((this.getCos(this.angle) * 2048) >> 8);
            shot[5] = this.angle !== 0
              ? ((this.y - this.oldY) << 8) + ((this.getSin(this.angle) * -2048) >> 8)
              : 0;
            break;
        }
        this.shots[i] = shot;
        return i;
      }
    }
    return null;
  }

  update(
    tileMap: TileMap,
    left: boolean,
    right: boolean,
    up: boolean,
    down: boolean,
    _dt: number
  ): { died: boolean; collected: boolean; cx: number; cy: number; ct: number } {
    let died = false;
    let collected = false;
    let cx = 0, cy = 0, ct = 0;

    if (this.invincible) {
      this.invincibilityCounter++;
      if (this.invincibilityCounter % (Math.floor(this.invincibilityCounter / 20) + 1) === 0) {
        this.invincibilityFrame++;
        if (this.invincibilityFrame >= 2) this.invincibilityFrame = 0;
      }
      if (this.invincibilityCounter >= 150) {
        this.invincibilityCounter = 0;
        this.invincible = false;
        this.invincibilityScoreAdj = 0;
      }
    }

    if (up) this.jump();

    if (left) {
      this.accelerate++;
      if ((!this.jumping && !this.falling && this.accelerate === 1) || this.accelerate === 3) {
        this.accelerate = 0;
        if (this.dx > -this.maxDX) this.dx -= 256;
      }
    }

    if (right) {
      this.accelerate++;
      if ((!this.jumping && !this.falling && this.accelerate === 1) || this.accelerate === 3) {
        this.accelerate = 0;
        if (this.dx < this.maxDX) this.dx += 256;
      }
    }

    if (down && !this.jumping && !this.falling) {
      if (this.dx >= 512) {
        this.dx -= 512;
      } else if (this.dx <= -512) {
        this.dx += 512;
      } else {
        this.dx = 0;
      }
    }

    if (!down && !left && !right && this.dx !== 0) {
      this.slowDown++;
      if (this.slowDown === 5) {
        this.slowDown = 0;
        if (this.dx <= -256) {
          this.dx += 256;
        } else if (this.dx >= 256) {
          this.dx -= 256;
        } else {
          this.dx = 0;
        }
      }
    }

    if (!this.dead) {
      this.oldY = this.y;
      const result = this.physics.resolve(
        this.x, this.y, this.dx, this.dy,
        this.width, this.height,
        this.jumping, this.falling, this.dead,
        this.onLeftRamp, this.onRightRamp,
        this.angle, this.angleOff,
        tileMap,
        this.origX, this.origY,
        this.maxDX, this.invincible
      );

      this.x = result.pXPos;
      this.y = result.pYPos;
      this.dx = result.pDX;
      this.dy = result.pDY;
      this.jumping = result.jumping;
      this.falling = result.falling;
      this.onLeftRamp = result.onLeftRamp;
      this.onRightRamp = result.onRightRamp;
      this.angle = result.pAngle;
      this.angleOff = result.pAngleOffSet;

      if (result.dead && !this.dead) {
        this.die();
      }
      this.dead = result.dead;

      if (result.collectTile > 0) {
        collected = true;
        cx = result.collectX;
        cy = result.collectY;
        ct = result.collectTile;
      }

      if (result.dead) died = true;
    }

    // Gravity
    if ((this.jumping || this.falling) && this.dy < this.maxDY) {
      this.dy += 256;
      if (this.jumping && this.dy >= 0) {
        this.falling = true;
        this.jumping = false;
        this.angle = 0;
        this.angleOff = 4;
      }
    }

    // Direction flip
    if (this.currentMove === 1 && this.dx > 255) {
      this.currentMove = 2;
    }
    if (this.currentMove === 2 && this.dx < 0) {
      this.currentMove = 1;
    }

    // Update shots
    for (let i = 0; i < this.shots.length; i++) {
      const s = this.shots[i];
      if (s) {
        s[1] = s[0];
        s[3] = s[2];
        s[0] += s[4];
        s[2] += s[5];
        if (
          s[0] >> 8 > this.x + SCREEN_W ||
          s[0] >> 8 < this.x - SCREEN_W ||
          s[2] >> 8 > this.y + GAME_H ||
          s[2] >> 8 < this.y - GAME_H
        ) {
          this.shots[i] = null;
        }
      }
    }

    return { died, collected, cx, cy, ct };
  }

  die(): void {
    this.dy = -2048;
    this.lives--;
    this.dead = true;
    this.jumping = true;
    this.falling = false;
    this.currentMove = 0;
    this.angleOff = 4;
  }

  respawn(): void {
    this.x = this.origX;
    this.y = this.origY;
    this.dx = 0;
    this.dy = 0;
    this.currentMove = 2;
    this.angle = 0;
    this.angleOff = 4;
    this.falling = false;
    this.jumping = false;
    this.dead = false;
  }

  private getSin(angle: number): number {
    const t = [0,4,8,13,17,22,26,31,35,40,44,48,53,57,61,66,70,74,79,83,87,91,95,100,104,108,112,116,120,124,127,131,135,139,143,146,150,154,157,161,164,167,171,174,177,181,184,187,190,193,196,198,201,204,207,209,212,214,217,219,221,223,226,228,230,232,233,235,237,238,240,242,243,244,246,247,248,249,250,251,252,252,253,254,254,255,255,255,255,255,256];
    if (angle <= 90) return t[angle];
    if (angle <= 180) return t[180 - angle];
    if (angle <= 270) return -t[angle - 180];
    return -t[360 - angle];
  }

  private getCos(angle: number): number {
    const t = [256,255,255,255,255,255,254,254,253,252,252,251,250,249,248,247,246,244,243,242,240,238,237,235,233,232,230,228,226,223,221,219,217,214,212,209,207,204,201,198,196,193,190,187,184,181,177,174,171,167,164,161,157,154,150,146,143,139,135,131,128,124,120,116,112,108,104,100,95,91,87,83,79,74,70,66,61,57,53,48,44,40,35,31,26,22,17,13,8,4,0];
    if (angle <= 90) return t[angle];
    if (angle <= 180) return -t[180 - angle];
    if (angle <= 270) return -t[angle - 180];
    return t[360 - angle];
  }
}
