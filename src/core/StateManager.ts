import type { GameState } from './types';

export type StateChangeCallback = (from: GameState, to: GameState) => void;

export class StateManager {
  private current: GameState = 'splash';
  private previous: GameState = 'splash';
  private listeners: StateChangeCallback[] = [];

  get state(): GameState {
    return this.current;
  }

  get prior(): GameState {
    return this.previous;
  }

  set(state: GameState): void {
    if (state === this.current) return;
    this.previous = this.current;
    this.current = state;
    for (const cb of this.listeners) {
      cb(this.previous, this.current);
    }
  }

  onChange(cb: StateChangeCallback): void {
    this.listeners.push(cb);
  }

  is(...states: GameState[]): boolean {
    return states.includes(this.current);
  }
}
