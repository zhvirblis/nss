import type { InputManager } from '../core/InputManager';

export function createVirtualGamepad(input: InputManager): HTMLElement {
  const container = document.createElement('div');
  container.id = 'gamepad';
  container.style.cssText = `
    position: absolute; bottom: 10px; left: 0; right: 0;
    display: flex; justify-content: space-between; padding: 0 10px;
    pointer-events: none; z-index: 10;
  `;

  const dpad = document.createElement('div');
  dpad.style.cssText = `
    position: relative; width: 120px; height: 120px; pointer-events: auto;
  `;

  const btnUp = btn('^', 'up', dpad, 'top: 0; left: 40px;');
  const btnDown = btn('v', 'down', dpad, 'bottom: 0; left: 40px;');
  const btnLeft = btn('<', 'left', dpad, 'top: 40px; left: 0;');
  const btnRight = btn('>', 'right', dpad, 'top: 40px; right: 0;');

  const actions = document.createElement('div');
  actions.style.cssText = `
    display: flex; gap: 10px; align-items: flex-end;
    pointer-events: none; padding-bottom: 10px;
  `;

  const btnJump = document.createElement('div');
  btnJump.textContent = 'JUMP';
  btnJump.style.cssText = `
    pointer-events: auto; width: 60px; height: 60px; border-radius: 50%;
    background: rgba(255,255,255,0.3); border: 2px solid rgba(255,255,255,0.6);
    display: flex; align-items: center; justify-content: center;
    font: bold 10px monospace; color: white; touch-action: none;
  `;

  const btnShoot = document.createElement('div');
  btnShoot.textContent = 'SHOOT';
  btnShoot.style.cssText = `
    pointer-events: auto; width: 50px; height: 50px; border-radius: 50%;
    background: rgba(255,0,0,0.3); border: 2px solid rgba(255,0,0,0.6);
    display: flex; align-items: center; justify-content: center;
    font: bold 8px monospace; color: white; touch-action: none;
  `;

  attachTouch(btnUp, 'up', input);
  attachTouch(btnDown, 'down', input);
  attachTouch(btnLeft, 'left', input);
  attachTouch(btnRight, 'right', input);
  attachTouch(btnJump, 'up', input);
  attachTouch(btnShoot, 'fire', input);

  actions.appendChild(btnJump);
  actions.appendChild(btnShoot);
  container.appendChild(dpad);
  container.appendChild(actions);

  return container;
}

function btn(label: string, _action: string, parent: HTMLElement, pos: string): HTMLElement {
  const el = document.createElement('div');
  el.textContent = label;
  el.style.cssText = `
    position: absolute; width: 40px; height: 40px; border-radius: 6px;
    background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.5);
    display: flex; align-items: center; justify-content: center;
    font: bold 14px monospace; color: white; touch-action: none;
    ${pos}
  `;
  parent.appendChild(el);
  return el;
}

function attachTouch(el: HTMLElement, action: string, input: InputManager): void {
  el.addEventListener('touchstart', (e) => {
    e.preventDefault();
    input.setVirtual(action, true);
  }, { passive: false });
  el.addEventListener('touchend', (e) => {
    e.preventDefault();
    input.setVirtual(action, false);
  }, { passive: false });
  el.addEventListener('touchcancel', () => input.setVirtual(action, false));
  el.addEventListener('mousedown', () => input.setVirtual(action, true));
  el.addEventListener('mouseup', () => input.setVirtual(action, false));
  el.addEventListener('mouseleave', () => input.setVirtual(action, false));
}
