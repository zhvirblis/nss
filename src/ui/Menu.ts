import { Renderer } from '../rendering/Renderer';

export interface MenuAction {
  id: string;
  label: string;
}

export class Menu {
  items: MenuAction[] = [];
  selected = 0;

  constructor(items: MenuAction[]) {
    this.items = items;
  }

  render(renderer: Renderer, titleImg?: HTMLImageElement): void {
    const ctx = renderer.ctx;
    const bw = renderer.bufferWidth;
    const bh = renderer.bufferHeight;

    if (titleImg) {
      renderer.fillRect(0, 0, bw, bh, '#000000');
      const ox = Math.floor((bw - 176) / 2);
      ctx.drawImage(titleImg, ox, 0, 176, bh);
    } else {
      renderer.fillRect(0, 0, bw, bh, '#000066');
    }

    const startY = titleImg ? bh - this.items.length * 14 - 10 : 40;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';

    for (let i = 0; i < this.items.length; i++) {
      const y = startY + i * 14;
      const label = this.items[i].label;

      if (i === this.selected) {
        ctx.fillStyle = '#FFFF00';
        ctx.fillText('> ' + label + ' <', bw / 2, y);
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(label, bw / 2, y);
      }
    }
  }

  up(): void {
    this.selected--;
    if (this.selected < 0) this.selected = this.items.length - 1;
  }

  down(): void {
    this.selected++;
    if (this.selected >= this.items.length) this.selected = 0;
  }

  get current(): MenuAction | null {
    return this.items[this.selected] ?? null;
  }

  destroy(): void {
    this.items = [];
  }
}
