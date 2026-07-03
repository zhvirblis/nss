export interface MenuAction {
  id: string;
  label: string;
}

export class Menu {
  items: MenuAction[] = [];
  selected = 0;
  private overlay: HTMLElement;
  private itemEls: HTMLElement[] = [];

  constructor(container: HTMLElement, items: MenuAction[], titleImgUrl?: string) {
    this.items = items;

    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: absolute; inset: 0; z-index: 1;
      display: flex; flex-direction: column; align-items: center;
      pointer-events: auto;
    `;

    if (titleImgUrl) {
      this.overlay.style.backgroundImage = `url(${titleImgUrl})`;
      this.overlay.style.backgroundSize = 'contain';
      this.overlay.style.backgroundPosition = 'center top';
      this.overlay.style.backgroundRepeat = 'no-repeat';
      this.overlay.style.imageRendering = 'pixelated';
      this.overlay.style.backgroundColor = '#0a6a9b';
    } else {
      this.overlay.style.background = '#000066';
    }

    const list = document.createElement('div');
    list.style.cssText = `
      margin-top: auto; padding-bottom: 24px;
      display: flex; flex-direction: column; align-items: center;
      gap: 4px;
      background: rgb(0, 0, 0, 0.75);
      width: 100%;
    `;

    for (let i = 0; i < items.length; i++) {
      const el = document.createElement('div');
      el.textContent = items[i].label;
      el.style.cssText = `
        font: 2rem monospace; color: #fff; cursor: pointer;
        padding: 2px 16px; white-space: nowrap;
        pointer-events: auto;
      `;
      el.addEventListener('click', () => {
        this.selected = i;
      });
      el.addEventListener('dblclick', () => {
        this.selected = i;
      });
      list.appendChild(el);
      this.itemEls.push(el);
    }

    this.overlay.appendChild(list);
    container.appendChild(this.overlay);
    this.highlight();
  }

  highlight(): void {
    for (let i = 0; i < this.itemEls.length; i++) {
      this.itemEls[i].style.color = i === this.selected ? '#5375FF' : '#FFFFFF';
      this.itemEls[i].textContent = i === this.selected
        ? '> ' + this.items[i].label + ' <'
        : this.items[i].label;
    }
  }

  up(): void {
    this.selected--;
    if (this.selected < 0) this.selected = this.items.length - 1;
    this.highlight();
  }

  down(): void {
    this.selected++;
    if (this.selected >= this.items.length) this.selected = 0;
    this.highlight();
  }

  get current(): MenuAction | null {
    return this.items[this.selected] ?? null;
  }

  destroy(): void {
    this.overlay.remove();
    this.items = [];
    this.itemEls = [];
  }
}
