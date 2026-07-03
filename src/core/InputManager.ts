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

  // --- Gamepad support ---
  private gamepadIndex: number | null = null;

  private onGamepadConnected = (e: GamepadEvent): void => {
    this.gamepadIndex = e.gamepad.index;
  };

  private onGamepadDisconnected = (e: GamepadEvent): void => {
    if (this.gamepadIndex === e.gamepad.index) {
      this.gamepadIndex = null;
    }
  };

  private gpLeft = false;
  private gpRight = false;
  private gpUp = false;
  private gpDown = false;
  private gpFire = false;
  private gpMenu = false;

  private pollGamepad(): void {
    if (this.gamepadIndex === null) return;
    const gamepads = navigator.getGamepads();
    const gp = gamepads[this.gamepadIndex];
    if (!gp) return;

    const btns = gp.buttons;
    this.gpLeft = !!(btns[14]?.pressed || gp.axes[0] < -0.5);
    this.gpRight = !!(btns[15]?.pressed || gp.axes[0] > 0.5);
    this.gpUp = !!(btns[12]?.pressed || gp.axes[1] < -0.5);
    this.gpDown = !!(btns[13]?.pressed || gp.axes[1] > 0.5);
    this.gpUp = this.gpUp || !!btns[0]?.pressed;
    this.gpFire = !!btns[3]?.pressed;
    this.gpMenu = !!(btns[8]?.pressed || btns[9]?.pressed);
  }

  get effective(): InputState {
    this.pollGamepad();
    return {
      left: this.state.left || this.virtLeft || this.gpLeft,
      right: this.state.right || this.virtRight || this.gpRight,
      up: this.state.up || this.virtUp || this.gpUp,
      down: this.state.down || this.virtDown || this.gpDown,
      fire: this.state.fire || this.virtFire || this.gpFire,
      menu: this.state.menu || this.virtMenu || this.gpMenu,
    };
  }

  attach(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('gamepadconnected', this.onGamepadConnected);
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected);
  }

  detach(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('gamepadconnected', this.onGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected);
  }

  clearMenu(): void {
    this.state.menu = false;
    this.menuPressed = false;
    this.virtMenu = false;
    this.gpMenu = false;
  }
}
