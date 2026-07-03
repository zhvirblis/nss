import { SCREEN_W, SCREEN_H, HALF_GAME_W } from '../core/types';
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

    if (titleImg) {
      renderer.fillRect(0, 0, SCREEN_W, SCREEN_H, '#000000');
      ctx.drawImage(titleImg, 0, 0, SCREEN_W, SCREEN_H);
    } else {
      renderer.fillRect(0, 0, SCREEN_W, SCREEN_H, '#000066');
    }

    const startY = titleImg ? SCREEN_H - this.items.length * 14 - 10 : 40;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';

    for (let i = 0; i < this.items.length; i++) {
      const y = startY + i * 14;
      const label = this.items[i].label;

      if (i === this.selected) {
        ctx.fillStyle = '#FFFF00';
        ctx.fillText('> ' + label + ' <', HALF_GAME_W, y);
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(label, HALF_GAME_W, y);
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
