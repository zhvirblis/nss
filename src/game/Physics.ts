import { TileMap } from './TileMap';

export interface CollisionResult {
  pXPos: number;
  pYPos: number;
  pDX: number;
  pDY: number;
  pDXLeft: number;
  pDYLeft: number;
  pDXT: number;
  pDYT: number;
  jumping: boolean;
  falling: boolean;
  dead: boolean;
  onLeftRamp: boolean;
  onRightRamp: boolean;
  pAngle: number;
  pAngleOffSet: number;
  collectX: number;
  collectY: number;
  collectTile: number;
}

export class Physics {
  resolve(
    pXPos: number,
    pYPos: number,
    pDX: number,
    pDY: number,
    pWidth: number,
    pHeight: number,
    jumping: boolean,
    falling: boolean,
    dead: boolean,
    onLeftRamp: boolean,
    onRightRamp: boolean,
    pAngle: number,
    pAngleOffSet: number,
    tileMap: TileMap,
    _pOrigXPos: number,
    _pOrigYPos: number,
    _pMaxDX: number,
    _pLives: number
  ): CollisionResult {
    let dx = pDX;
    let dy = pDY;
    let x = pXPos;
    let y = pYPos;
    let jmp = jumping;
    let fall = falling;
    let d = dead;
    let lr = onLeftRamp;
    let rr = onRightRamp;
    let angle = pAngle;
    let angleOff = pAngleOffSet;
    let collectX = 0;
    let collectY = 0;
    let collectTile = 0;

    const doCollect = (cx: number, cy: number, ct: number) => {
      if (ct >= 90 && ct <= 99) {
        collectX = cx;
        collectY = cy;
        collectTile = ct;
      }
    };

    let pDXLeft = dx >> 8;
    let pDYLeft = dy >> 8;
    let pDXT = 0;
    let pDYT = 0;
    if (dx > 0) pDXT = 1;
    else if (dx < 0) pDXT = -1;
    if (dy > 0) pDYT = 1;
    else if (dy < 0) pDYT = -1;

    if (lr || rr) {
      dx -= this.getSin(angle);
    }

    if (!d) {
      while (!d && (pDXLeft !== 0 || pDYLeft !== 0)) {
        if (pDXLeft !== 0) {
          x += pDXT;
          pDXLeft -= pDXT;
        }
        if (pDYLeft !== 0) {
          y += pDYT;
          pDYLeft -= pDYT;
        }

        // Left collision
        if (x >= 0) {
          const leftTileX = x >> 4;
          if (y >= pHeight) {
            const leftTileY1 = (y - pHeight + 2) >> 4;
            const leftTileY2 = (y - 1) >> 4;
            const t1 = tileMap.getTile(leftTileX, leftTileY1);
            const t2 = tileMap.getTile(leftTileX, leftTileY2);

            if (t1 > 34 || t2 > 34) {
              if (tileMap.isLeftRamp(leftTileX, leftTileY2)) {
                const subX = x - (leftTileX << 4);
                const rampH = tileMap.getRampHeight(leftTileX, leftTileY2, subX);
                const j = (leftTileY2 << 4) + 17 - rampH;
                if (y > j || lr) {
                  y = j;
                  angle = tileMap.getRampAngle(leftTileX, leftTileY2, subX);
                  this.setAngle(angle, dx, (v) => angleOff = v);
                  if (fall) {
                    pDYLeft = 0;
                    dy = 0;
                    fall = false;
                  }
                  lr = true;
                }
              } else if (tileMap.isRightRamp(leftTileX, leftTileY2)) {
                const subX = x - (leftTileX << 4);
                const rampH = tileMap.getRampHeight(leftTileX, leftTileY2, subX);
                const j = (leftTileY2 << 4) + 17 - rampH;
                if (y >= j) {
                  pDXLeft = 0;
                  x = (leftTileX << 4) + 16;
                  dx = 0;
                }
              } else if (tileMap.isCollectible(leftTileX, leftTileY1)) {
                doCollect(leftTileX, leftTileY1, t1);
              } else if (tileMap.isCollectible(leftTileX, leftTileY2)) {
                doCollect(leftTileX, leftTileY2, t2);
              } else if (
                tileMap.isLeftSpike(leftTileX, leftTileY1) &&
                tileMap.isLeftSpike(leftTileX, leftTileY2)
              ) {
                d = true;
              } else if (lr) {
                if (dx < 0) {
                  dy = -(dx * this.getSin(angle)) >> 8;
                  pDXLeft = 0;
                  x = (leftTileX << 4) + 16;
                  dx = 0;
                  jmp = true;
                  fall = false;
                  pDXT = 0; pDYT = 0;
                  pDXLeft = dx >> 8;
                  pDYLeft = dy >> 8;
                  if (dx > 0) pDXT = 1; else if (dx < 0) pDXT = -1;
                  if (dy > 0) pDYT = 1; else if (dy < 0) pDYT = -1;
                }
                lr = false;
              } else if (t1 >= 30 || (t1 < 30 && (y % 16) >= 3)) {
                pDXLeft = 0;
                x = (leftTileX << 4) + 16;
                dx = 0;
              }
            }
          }
        } else {
          pDXLeft = 0;
          x = 0;
          dx = 0;
        }

        // Right collision
        if (x + pWidth < tileMap.width << 4) {
          const rightTileX = (x + pWidth) >> 4;
          if (y >= pHeight) {
            const rightTileY1 = (y - pHeight + 2) >> 4;
            const rightTileY2 = (y - 1) >> 4;
            const t1 = tileMap.getTile(rightTileX, rightTileY1);
            const t2 = tileMap.getTile(rightTileX, rightTileY2);

            if (t1 > 34 || t2 > 34) {
              if (tileMap.isRightRamp(rightTileX, rightTileY2)) {
                const subX = x + pWidth - (rightTileX << 4);
                const rampH = tileMap.getRampHeight(rightTileX, rightTileY2, subX);
                const j = (rightTileY2 << 4) + 17 - rampH;
                if (y > j || rr) {
                  y = j;
                  angle = tileMap.getRampAngle(rightTileX, rightTileY2, subX);
                  this.setAngle(angle, dx, (v) => angleOff = v);
                  if (fall) {
                    pDYLeft = 0;
                    dy = 0;
                    fall = false;
                  }
                  rr = true;
                }
              } else if (tileMap.isLeftRamp(rightTileX, rightTileY2)) {
                const subX = x + pWidth - (rightTileX << 4);
                const rampH = tileMap.getRampHeight(rightTileX, rightTileY2, subX);
                const j = (rightTileY2 << 4) + 17 - rampH;
                if (y > j) {
                  pDXLeft = 0;
                  x = (rightTileX << 4) - pWidth;
                  dx = 0;
                }
              } else if (tileMap.isCollectible(rightTileX, rightTileY1)) {
                doCollect(rightTileX, rightTileY1, t1);
              } else if (tileMap.isCollectible(rightTileX, rightTileY2)) {
                doCollect(rightTileX, rightTileY2, t2);
              } else if (
                tileMap.isRightSpike(rightTileX, rightTileY1) &&
                tileMap.isRightSpike(rightTileX, rightTileY2)
              ) {
                d = true;
              } else if (rr) {
                if (dx > 0) {
                  dy = -(dx * this.getSin(angle)) >> 8;
                  pDXLeft = 0;
                  x = (rightTileX << 4) - pWidth;
                  dx = 0;
                  jmp = true;
                  fall = false;
                  pDXT = 0; pDYT = 0;
                  pDXLeft = dx >> 8;
                  pDYLeft = dy >> 8;
                  if (dx > 0) pDXT = 1; else if (dx < 0) pDXT = -1;
                  if (dy > 0) pDYT = 1; else if (dy < 0) pDYT = -1;
                }
                rr = false;
              } else if (t1 >= 30 || (t1 < 30 && (y % 16) >= 3)) {
                pDXLeft = 0;
                x = (rightTileX << 4) - pWidth;
                dx = 0;
              }
            }
          }
        } else {
          pDXLeft = 0;
          x = (tileMap.width << 4) - pWidth - 1;
          dx = 0;
        }

        // Up collision
        if (y >= pHeight) {
          const upTileX1 = (x + 2) >> 4;
          const upTileX2 = (x + pWidth - 2) >> 4;
          const upTileY = (y - pHeight) >> 4;
          const t1 = tileMap.getTile(upTileX1, upTileY);
          const t2 = tileMap.getTile(upTileX2, upTileY);

          if (t1 > 64 || t2 > 64) {
            if (tileMap.isCollectible(upTileX1, upTileY)) {
              doCollect(upTileX1, upTileY, t1);
            } else if (tileMap.isCollectible(upTileX2, upTileY)) {
              doCollect(upTileX2, upTileY, t2);
            } else if (
              tileMap.isTopSpike(upTileX1, upTileY) &&
              tileMap.isTopSpike(upTileX2, upTileY)
            ) {
              d = true;
            } else if (jmp) {
              pDYLeft = 0;
              y = ((upTileY + 1) << 4) + pHeight;
              if (dy < 0) dy = 0;
              angle = 0;
              angleOff = 4;
              fall = true;
              jmp = false;
            }
          }
        }

        // Down collision
        if (y >= 0) {
          const downTileX1 = (x + 1) >> 4;
          const downTileX2 = (x + pWidth - 1) >> 4;
          const downTileY = y >> 4;
          const t1 = tileMap.getTile(downTileX1, downTileY);
          const t2 = tileMap.getTile(downTileX2, downTileY);

          if (t1 > 29 || t2 > 29) {
            if (tileMap.isRightRamp(downTileX2, downTileY)) {
              let subX = x + pWidth - (downTileX2 << 4);
              if (subX > 15) subX = 15;
              const rampH = tileMap.getRampHeight(downTileX2, downTileY, subX);
              const j = (downTileY << 4) + 16 - rampH;
              if (!jmp && (y >= j || rr)) {
                y = j;
                angle = tileMap.getRampAngle(downTileX2, downTileY, subX);
                this.setAngle(angle, dx, (v) => angleOff = v);
                if (fall) {
                  dx -= (dy * this.getSin(angle)) >> 8;
                  pDXLeft = dx >> 8;
                  pDXT = dx > 0 ? 1 : (dx < 0 ? -1 : 0);
                  pDYLeft = 0;
                  dy = 0;
                  fall = false;
                }
                rr = true;
              } else if (!jmp) {
                fall = true;
              }
            } else if (tileMap.isLeftRamp(downTileX1, downTileY)) {
              let subX = x - (downTileX1 << 4);
              if (subX < 0) subX = 0;
              const rampH = tileMap.getRampHeight(downTileX1, downTileY, subX);
              const j = (downTileY << 4) + 16 - rampH;
              if (!jmp && (y >= j || lr)) {
                y = j;
                angle = tileMap.getRampAngle(downTileX1, downTileY, subX);
                this.setAngle(angle, dx, (v) => angleOff = v);
                if (fall) {
                  dx -= (dy * this.getSin(angle)) >> 8;
                  pDXLeft = dx >> 8;
                  pDXT = dx > 0 ? 1 : (dx < 0 ? -1 : 0);
                  pDYLeft = 0;
                  dy = 0;
                  fall = false;
                }
                lr = true;
              } else if (!jmp) {
                fall = true;
              }
            } else if (!lr && !rr) {
              if (tileMap.isCollectible(downTileX1, downTileY)) {
                doCollect(downTileX1, downTileY, t1);
              } else if (tileMap.isCollectible(downTileX2, downTileY)) {
                doCollect(downTileX2, downTileY, t2);
              } else if (
                tileMap.isBottomSpike(downTileX1, downTileY) &&
                tileMap.isBottomSpike(downTileX2, downTileY)
              ) {
                d = true;
              } else if (fall && (y % 16) <= 2) {
                pDYLeft = 0;
                y = downTileY << 4;
                dy = 0;
                angle = 0;
                angleOff = 4;
                fall = false;
              }
            }
          }
        }

        // Ramp dismount right
        if (rr) {
          const rtx = (x + pWidth) >> 4;
          const rty2 = (y - 1) >> 4;
          const dtx2 = y >> 4;
          if (
            !tileMap.isRightRamp(rtx, rty2) &&
            !tileMap.isRightRamp(dtx2, dtx2)
          ) {
            if (dx > 0) {
              if (angle === 90) x -= 2;
              dy = -(dx * this.getSin(angle)) >> 8;
              dx = (dx * this.getCos(angle)) >> 8;
              jmp = true;
              fall = false;
              pDXLeft = dx >> 8;
              pDYLeft = dy >> 8;
              pDXT = dx > 0 ? 1 : (dx < 0 ? -1 : 0);
              pDYT = dy > 0 ? 1 : (dy < 0 ? -1 : 0);
            } else {
              angle = 0;
              angleOff = 4;
            }
            rr = false;
          }
        }

        // Ramp dismount left
        if (lr) {
          const ltx = x >> 4;
          const lty2 = (y - 1) >> 4;
          const dtx1 = y >> 4;
          if (
            !tileMap.isLeftRamp(ltx, lty2) &&
            !tileMap.isLeftRamp(dtx1, ltx)
          ) {
            if (dx < 0) {
              if (angle === 270) x += 2;
              dy = -(dx * this.getSin(angle)) >> 8;
              dx = (dx * this.getCos(angle)) >> 8;
              jmp = true;
              fall = false;
              pDXLeft = dx >> 8;
              pDYLeft = dy >> 8;
              pDXT = dx > 0 ? 1 : (dx < 0 ? -1 : 0);
              pDYT = dy > 0 ? 1 : (dy < 0 ? -1 : 0);
            } else {
              angle = 0;
              angleOff = 4;
            }
            lr = false;
          }
        }
      }

      // Check falling off edge
      if (y >= 0 && !jmp) {
        const rtx = (x + pWidth) >> 4;
        const rty2 = (y - 1) >> 4;
        const dtx1 = (x + 1) >> 4;
        const dtx2 = (x + pWidth - 1) >> 4;
        const dty = y >> 4;
        const ltx = x >> 4;
        const lty2 = (y - 1) >> 4;

        if (
          tileMap.getTile(rtx, rty2) < 35 &&
          tileMap.getTile(dtx1, dty) < 30 &&
          tileMap.getTile(dtx2, dty) < 30 &&
          tileMap.getTile(ltx, lty2) < 35
        ) {
          fall = true;
        }
      }
    }

    return {
      pXPos: x, pYPos: y,
      pDX: dx, pDY: dy,
      pDXLeft, pDYLeft, pDXT, pDYT,
      jumping: jmp, falling: fall, dead: d,
      onLeftRamp: lr, onRightRamp: rr,
      pAngle: angle, pAngleOffSet: angleOff,
      collectX, collectY, collectTile,
    };
  }

  private setAngle(angle: number, dx: number, setOff: (v: number) => void): void {
    let off = 4;
    if (dx > 0) {
      if (angle >= 270 && angle < 288) off = 0;
      else if (angle >= 288 && angle < 306) off = 1;
      else if (angle >= 306 && angle < 324) off = 2;
      else if (angle >= 324 && angle < 342) off = 3;
      else if (angle >= 342) off = 4;
      else if (angle < 18) off = 4;
      else if (angle >= 18 && angle < 36) off = 5;
      else if (angle >= 36 && angle < 54) off = 6;
      else if (angle >= 54 && angle < 72) off = 7;
      else off = 8;
    } else if (dx < 0) {
      if (angle >= 270 && angle < 288) off = 8;
      else if (angle >= 288 && angle < 306) off = 7;
      else if (angle >= 306 && angle < 324) off = 6;
      else if (angle >= 324 && angle < 342) off = 5;
      else if (angle >= 342) off = 4;
      else if (angle < 18) off = 4;
      else if (angle >= 18 && angle < 36) off = 3;
      else if (angle >= 36 && angle < 54) off = 2;
      else if (angle >= 54 && angle < 72) off = 1;
      else off = 0;
    }
    setOff(off);
  }

  private getSin(angle: number): number {
    const sinTable = [0,4,8,13,17,22,26,31,35,40,44,48,53,57,61,66,70,74,79,83,87,91,95,100,104,108,112,116,120,124,127,131,135,139,143,146,150,154,157,161,164,167,171,174,177,181,184,187,190,193,196,198,201,204,207,209,212,214,217,219,221,223,226,228,230,232,233,235,237,238,240,242,243,244,246,247,248,249,250,251,252,252,253,254,254,255,255,255,255,255,256];
    if (angle <= 90) return sinTable[angle];
    if (angle <= 180) return sinTable[180 - angle];
    if (angle <= 270) return -sinTable[angle - 180];
    return -sinTable[360 - angle];
  }

  private getCos(angle: number): number {
    const cosTable = [256,255,255,255,255,255,254,254,253,252,252,251,250,249,248,247,246,244,243,242,240,238,237,235,233,232,230,228,226,223,221,219,217,214,212,209,207,204,201,198,196,193,190,187,184,181,177,174,171,167,164,161,157,154,150,146,143,139,135,131,128,124,120,116,112,108,104,100,95,91,87,83,79,74,70,66,61,57,53,48,44,40,35,31,26,22,17,13,8,4,0];
    if (angle <= 90) return cosTable[angle];
    if (angle <= 180) return -cosTable[180 - angle];
    if (angle <= 270) return -cosTable[angle - 180];
    return cosTable[360 - angle];
  }
}
