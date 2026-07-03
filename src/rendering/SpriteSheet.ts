export class SpriteSheet {
  private img: HTMLImageElement;

  constructor(img: HTMLImageElement) {
    this.img = img;
  }

  draw(ctx: CanvasRenderingContext2D, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number): void {
    ctx.drawImage(this.img, sx, sy, sw, sh, dx, dy, sw, sh);
  }

  drawClipped(ctx: CanvasRenderingContext2D, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, cw: number, ch: number): void {
    ctx.save();
    ctx.beginPath();
    ctx.rect(dx, dy, cw, ch);
    ctx.clip();
    ctx.drawImage(this.img, sx, sy, sw, sh, dx, dy, sw, sh);
    ctx.restore();
  }
}
