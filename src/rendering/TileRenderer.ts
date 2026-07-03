import { TILE_SIZE, SCREEN_W, SCREEN_H, STATUS_H } from '../core/types';
import { SpriteSheet } from './SpriteSheet';

export class TileRenderer {
  private sheet: SpriteSheet;

  constructor(sheet: SpriteSheet) {
    this.sheet = sheet;
  }

  render(ctx: CanvasRenderingContext2D, tiles: number[][], xOff: number, yOff: number): void {
    const cols = Math.floor(SCREEN_W / TILE_SIZE) + 2;
    const rows = Math.floor((SCREEN_H - STATUS_H) / TILE_SIZE) + 2;
    const startCol = Math.max(0, Math.floor(-xOff / TILE_SIZE));
    const startRow = Math.max(0, Math.floor(-yOff / TILE_SIZE));

    for (let row = startRow; row <= startRow + rows; row++) {
      if (row >= tiles.length) break;
      const tileRow = tiles[row];
      for (let col = startCol; col <= startCol + cols; col++) {
        if (col >= tileRow.length) break;
        const tileId = tileRow[col];
        if (tileId <= 0 || tileId > 99) continue;
        const sx = (tileId % 10) * TILE_SIZE;
        const sy = Math.floor(tileId / 10) * TILE_SIZE;
        const dx = xOff + col * TILE_SIZE;
        const dy = yOff + row * TILE_SIZE;
        this.sheet.draw(ctx, sx, sy, TILE_SIZE, TILE_SIZE, dx, dy);
      }
    }
  }
}
