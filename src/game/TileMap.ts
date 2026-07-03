import { TILE_SIZE } from '../core/types';
import { getRampData } from '../core/AssetManager';

export class TileMap {
  tiles: number[][];
  width: number;
  height: number;
  totalCoins = 0;

  constructor(tiles: number[][]) {
    this.tiles = tiles;
    this.height = tiles.length;
    this.width = tiles[0].length;
    this.countCoins();
  }

  private countCoins(): void {
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        if (this.tiles[r][c] === 99) this.totalCoins++;
      }
    }
  }

  getTile(col: number, row: number): number {
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) return 0;
    return this.tiles[row][col];
  }

  setTile(col: number, row: number, val: number): void {
    if (row >= 0 && row < this.height && col >= 0 && col < this.width) {
      this.tiles[row][col] = val;
    }
  }

  isSolid(col: number, row: number): boolean {
    const t = this.getTile(col, row);
    return t >= 30;
  }

  isBlock(col: number, row: number): boolean {
    const t = this.getTile(col, row);
    return t >= 30 && t <= 34;
  }

  isRightRamp(col: number, row: number): boolean {
    const t = this.getTile(col, row);
    return t >= 35 && t <= 49;
  }

  isLeftRamp(col: number, row: number): boolean {
    const t = this.getTile(col, row);
    return t >= 50 && t <= 64;
  }

  isRamp(col: number, row: number): boolean {
    return this.isRightRamp(col, row) || this.isLeftRamp(col, row);
  }

  isSpike(col: number, row: number): boolean {
    const t = this.getTile(col, row);
    return (t >= 80 && t <= 87);
  }

  isBottomSpike(col: number, row: number): boolean {
    const t = this.getTile(col, row);
    return t === 80 || t === 81;
  }

  isTopSpike(col: number, row: number): boolean {
    const t = this.getTile(col, row);
    return t === 82 || t === 83;
  }

  isRightSpike(col: number, row: number): boolean {
    const t = this.getTile(col, row);
    return t === 84 || t === 85;
  }

  isLeftSpike(col: number, row: number): boolean {
    const t = this.getTile(col, row);
    return t === 86 || t === 87;
  }

  isCollectible(col: number, row: number): boolean {
    const t = this.getTile(col, row);
    return t >= 90 && t <= 99;
  }

  isExtraLife(col: number, row: number): boolean {
    return this.getTile(col, row) === 90;
  }

  isRespawn(col: number, row: number): boolean {
    return this.getTile(col, row) === 91;
  }

  isInvincibility(col: number, row: number): boolean {
    return this.getTile(col, row) === 92;
  }

  isEndFlag(col: number, row: number): boolean {
    const t = this.getTile(col, row);
    return t >= 93 && t <= 95;
  }

  isCoin(col: number, row: number): boolean {
    return this.getTile(col, row) === 99;
  }

  getRampHeight(col: number, row: number, subX: number): number {
    const t = this.getTile(col, row);
    if (!this.isRamp(col, row)) return 16;
    const rd = getRampData();
    const hm = rd[t]?.heightMap;
    if (!hm || hm.length === 0) return 16;
    const idx = Math.min(Math.max(subX, 0), 15);
    return hm[idx] ?? 0;
  }

  getRampAngle(col: number, row: number, subX: number): number {
    const t = this.getTile(col, row);
    if (!this.isRamp(col, row)) return 0;
    const rd = getRampData();
    const ang = rd[t]?.angles;
    if (!ang || ang.length === 0) return 0;
    const idx = Math.min(Math.max(subX, 0), 15);
    return ang[idx] ?? 0;
  }

  pixelsWide(): number {
    return this.width * TILE_SIZE;
  }

  pixelsTall(): number {
    return this.height * TILE_SIZE;
  }
}
