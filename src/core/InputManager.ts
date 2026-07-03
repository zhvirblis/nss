import type { InputState } from './types';

export class InputManager {
  readonly state: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    fire: false,
    menu: false,
  };

  private keys = new Set<string>();
  private menuPressed = false;

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.code);
    this.updateState();
    if (e.code === 'Escape' || e.code === 'Enter') {
      if (!this.menuPressed) {
        this.state.menu = true;
        this.menuPressed = true;
      }
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code);
    this.updateState();
    if (e.code === 'Escape' || e.code === 'Enter') {
      this.state.menu = false;
      this.menuPressed = false;
    }
  };

  private updateState(): void {
    this.state.left = this.keys.has('ArrowLeft') || this.keys.has('KeyA');
    this.state.right = this.keys.has('ArrowRight') || this.keys.has('KeyD');
    this.state.up = this.keys.has('ArrowUp') || this.keys.has('KeyW');
    this.state.down = this.keys.has('ArrowDown') || this.keys.has('KeyS');
    this.state.fire = this.keys.has('Space') || this.keys.has('KeyZ');
  }

  private virtLeft = false;
  private virtRight = false;
  private virtUp = false;
  private virtDown = false;
  private virtFire = false;
  private virtMenu = false;

  setVirtual(dpad: string, active: boolean): void {
    switch (dpad) {
      case 'left': this.virtLeft = active; break;
      case 'right': this.virtRight = active; break;
      case 'up': this.virtUp = active; break;
      case 'down': this.virtDown = active; break;
      case 'fire': this.virtFire = active; break;
      case 'menu': this.virtMenu = active; break;
    }
  }

  get effective(): InputState {
    return {
      left: this.state.left || this.virtLeft,
      right: this.state.right || this.virtRight,
      up: this.state.up || this.virtUp,
      down: this.state.down || this.virtDown,
      fire: this.state.fire || this.virtFire,
      menu: this.state.menu || this.virtMenu,
    };
  }

  attach(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  detach(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  clearMenu(): void {
    this.state.menu = false;
    this.menuPressed = false;
    this.virtMenu = false;
  }
}
