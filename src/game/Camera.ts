import { SCREEN_W, GAME_H } from '../core/types';

export class Camera {
  xOff = 0;
  yOff = 0;
  xOffCounter = 0;
  yOffCounter = 0;
  xOffAdjust = -40;

  private backW = 0;
  private backH = 0;

  setBounds(w: number, h: number): void {
    this.backW = w;
    this.backH = h;
  }

  update(px: number, py: number, _pDX: number, pDY: number, pHalfW: number, pHalfH: number, pCurrentMove: number, pAngle: number, down: boolean): void {
    const halfScreenW = Math.floor(SCREEN_W / 2);
    const halfScreenH = Math.floor(GAME_H / 2);

    if (
      (px + pHalfW > halfScreenW + this.xOffAdjust - this.xOffCounter &&
        this.backW + this.xOff > SCREEN_W) ||
      (px + pHalfW < halfScreenW + this.xOffAdjust - this.xOffCounter - this.xOff &&
        this.xOff < 0)
    ) {
      this.xOff = halfScreenW + this.xOffAdjust - this.xOffCounter - px + pHalfW;
      if (this.backW + this.xOff < SCREEN_W) {
        this.xOff = -(this.backW - SCREEN_W);
      } else if (this.xOff > 0) {
        this.xOff = 0;
      }
    }

    if (this.xOffCounter > 0) {
      this.xOffCounter -= Math.floor(this.xOffCounter / 5) + 1;
    } else if (this.xOffCounter < 0) {
      this.xOffCounter += Math.floor(-this.xOffCounter / 5) + 1;
    }

    if (down) {
      if (this.yOffCounter < 64) this.yOffCounter += 16;
    } else if (
      pDY > 0 ||
      (pCurrentMove === 1 && pAngle > 0 && pAngle <= 90) ||
      (pCurrentMove === 2 && pAngle > 270)
    ) {
      if (this.yOffCounter < 64) this.yOffCounter += Math.floor(this.yOffCounter / 5) + 1;
    } else if (this.yOffCounter !== 0) {
      this.yOffCounter -= Math.floor(this.yOffCounter / 5) + 1;
    }

    if (
      (py - pHalfH > halfScreenH + 36 - this.yOffCounter &&
        this.backH + this.yOff > GAME_H) ||
      (py - pHalfH < halfScreenH + 36 - this.yOffCounter - this.yOff &&
        this.yOff < 0)
    ) {
      this.yOff = halfScreenH + 36 - this.yOffCounter - py - pHalfH;
      if (this.backH + this.yOff < GAME_H) {
        this.yOff = -(this.backH - GAME_H);
      } else if (this.yOff > 0) {
        this.yOff = 0;
      }
    }
  }

  reset(): void {
    this.xOff = 0;
    this.yOff = 0;
    this.xOffCounter = 0;
    this.yOffCounter = 0;
    this.xOffAdjust = -40;
  }
}
