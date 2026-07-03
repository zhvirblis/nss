import { GameLoop } from './core/GameLoop';
import { StateManager } from './core/StateManager';
import { InputManager } from './core/InputManager';
import { AssetManager } from './core/AssetManager';
import { StorageManager } from './core/StorageManager';
import { SCREEN_W, SCREEN_H, TICK_MS } from './core/types';
import type { GameState } from './core/types';
import { Renderer } from './rendering/Renderer';
import { GameCanvas } from './game/GameCanvas';
import { AudioManager } from './audio/AudioManager';
import { Menu } from './ui/Menu';
import type { MenuAction } from './ui/Menu';
import { SplashScreen } from './ui/SplashScreen';
import { createVirtualGamepad } from './ui/Gamepad';

async function main() {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const container = document.getElementById('game-container')!;

  const renderer = new Renderer(canvas);
  const loop = new GameLoop();
  const state = new StateManager();
  const input = new InputManager();
  const assets = new AssetManager();
  const storage = new StorageManager();
  const audio = new AudioManager();
  const splash = new SplashScreen();

  renderer.resize();
  window.addEventListener('resize', () => renderer.resize());

  input.attach();

  const gamepad = createVirtualGamepad(input);
  container.appendChild(gamepad);

  await assets.loadAll();
  await audio.init();

  const allAssets = assets.images;
  const game = new GameCanvas(renderer, audio, allAssets);

  let menu: Menu | null = null;
  let transitionTimer = 0;
  let transitionTarget: GameState | null = null;
  let prevInput = { up: false, down: false, fire: false, menu: false };

  const settings = storage.loadSettings();
  audio.enabled = settings.soundEnabled;

  // --- State change handler ---
  state.onChange((from, to) => {
    if (from === 'menu' && menu) { menu.destroy(); menu = null; }
    if (to === 'splash') splash.reset();
    if (to === 'menu') initMenu();
  });

  // --- Splash sequence ---
  state.set('splash');

  // --- Menu setup ---
  function initMenu(): void {
    const items: MenuAction[] = [
      { id: 'play', label: 'Play' },
    ];
    const save = storage.loadSave();
    if (save) items.push({ id: 'continue', label: 'Continue' });
    items.push(
      { id: 'difficulty', label: settings.difficulty === 0 ? 'Difficulty: Easy' : 'Difficulty: Hard' },
      { id: 'sound', label: settings.soundEnabled ? 'Sound: ON' : 'Sound: OFF' },
      { id: 'topscores', label: 'Top Score' },
      { id: 'instructions', label: 'Instructions' },
      { id: 'credits', label: 'Credits' },
      { id: 'quit', label: 'Quit' },
    );
    menu = new Menu(items);
  }

  // --- Game loop ---
  loop.onUpdate = (dt: number) => {
    const inp = input.effective;

    if (state.is('splash')) {
      splash.update(dt);
      if (splash.elapsed >= 2500) {
        state.set('menu');
      }
      return;
    }

    if (state.is('menu')) {
      if (menu) {
        if (inp.up && !prevInput.up) menu.up();
        if (inp.down && !prevInput.down) menu.down();
        if (inp.fire && !prevInput.fire) {
          const action = menu.current;
          if (action) handleMenuAction(action.id);
        }
        if (inp.fire) {
          // handled
        }
      }
      prevInput = { up: inp.up, down: inp.down, fire: inp.fire, menu: inp.menu };
      return;
    }

    if (state.is('playing') || state.is('startDelay')) {
      const transition = game.update(inp);

      if (transition === 'won') {
        // Level clear
        audio.play(0);
        transitionTarget = 'levelClear';
        transitionTimer = 0;
        state.set('transitions');
      }
      if (transition === 'gameover') {
        transitionTarget = 'gameOver';
        transitionTimer = 0;
        state.set('transitions');
      }
      if (transition === 'finished') {
        transitionTarget = 'gameComplete';
        transitionTimer = 0;
        state.set('transitions');
      }

      if (inp.menu && !prevInput.menu) {
        transitionTarget = 'paused';
        transitionTimer = 0;
        state.set('transitions');
      }
    }

    if (state.is('transitions')) {
      transitionTimer += dt;
      if (transitionTarget === 'paused') {
        state.set('paused');
      } else if (transitionTarget === 'levelClear') {
        if (transitionTimer >= 4000) {
          game.nextLevel();
          if (game.finishedGame) {
            transitionTarget = 'gameComplete';
            transitionTimer = 0;
          } else {
            state.set('startDelay');
            transitionTarget = null;
          }
        }
      } else if (transitionTarget === 'gameOver') {
        if (transitionTimer >= 4000) {
          const top = storage.loadTopScore();
          if (game.player.score > top.score) {
            storage.saveTopScore({ score: game.player.score, time: game.totalTime });
          }
          state.set('menu');
          transitionTarget = null;
        }
      } else if (transitionTarget === 'gameComplete') {
        if (transitionTimer >= 5000) {
          const top = storage.loadTopScore();
          if (game.player.score > top.score) {
            storage.saveTopScore({ score: game.player.score, time: game.totalTime });
          }
          state.set('menu');
          transitionTarget = null;
        }
      }
    }

    if (state.is('paused')) {
      if ((inp.fire || inp.menu) && !prevInput.fire && !prevInput.menu) {
        state.set('playing');
        game.pausedTime = performance.now();
      }
      prevInput = { up: inp.up, down: inp.down, fire: inp.fire, menu: inp.menu };
      return;
    }

    prevInput = { up: inp.up, down: inp.down, fire: inp.fire, menu: inp.menu };
  };

  loop.onRender = (_alpha: number) => {
    renderer.clear();

    if (state.is('splash')) {
      const img = allAssets.get('bsg');
      if (img) splash.render(renderer, img);
      else { renderer.fillRect(0, 0, SCREEN_W, SCREEN_H, '#000066'); }
      return;
    }

    if (state.is('menu')) {
      const title = allAssets.get('titlesm');
      if (menu) menu.render(renderer, title ?? undefined);
      else initMenu();
      return;
    }

    if (state.is('startDelay')) {
      game.startDelay = true;
      game.startDelayPeriod();
      state.set('playing');
    }

    if (state.is('playing') || state.is('paused')) {
      game.render();
      if (state.is('paused')) {
        renderer.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        renderer.ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
        renderer.ctx.fillStyle = '#FFFFFF';
        renderer.ctx.font = '8px monospace';
        renderer.ctx.textAlign = 'center';
        renderer.ctx.fillText('PAUSED', SCREEN_W / 2, SCREEN_H / 2);
      }
    }

    if (state.is('transitions')) {
      game.render();
      if (transitionTarget === 'levelClear') {
        if (transitionTimer > 1000) {
          renderer.ctx.fillStyle = 'rgba(0,0,0,0.5)';
          renderer.ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
          renderer.ctx.fillStyle = '#FFFFFF';
          renderer.ctx.font = '8px monospace';
          renderer.ctx.textAlign = 'center';
          renderer.ctx.fillText('LEVEL CLEAR!', SCREEN_W / 2, SCREEN_H / 2 - 10);
          renderer.ctx.fillText(`Score: ${game.player.score}`, SCREEN_W / 2, SCREEN_H / 2);
          renderer.ctx.fillText(`Time: ${formatTime(game.totalTime)}`, SCREEN_W / 2, SCREEN_H / 2 + 10);
        }
      }
      if (transitionTarget === 'gameOver') {
        renderer.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        renderer.ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
        renderer.ctx.fillStyle = '#FFFFFF';
        renderer.ctx.font = '8px monospace';
        renderer.ctx.textAlign = 'center';
        renderer.ctx.fillText('GAME OVER', SCREEN_W / 2, SCREEN_H / 2);
        renderer.ctx.fillText(`Final Score: ${game.player.score}`, SCREEN_W / 2, SCREEN_H / 2 + 10);
      }
      if (transitionTarget === 'gameComplete') {
        game.render();
        renderer.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        renderer.ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
        renderer.ctx.fillStyle = '#FFFFFF';
        renderer.ctx.font = '8px monospace';
        renderer.ctx.textAlign = 'center';
        renderer.ctx.fillText('GAME COMPLETE!', SCREEN_W / 2, SCREEN_H / 2 - 10);
        renderer.ctx.fillText(`Final Score: ${game.player.score}`, SCREEN_W / 2, SCREEN_H / 2);
      }
    }

    renderer.present();
  };

  function handleMenuAction(id: string): void {
    switch (id) {
      case 'play':
        game.startGame();
        state.set('startDelay');
        break;
      case 'continue': {
        const save = storage.loadSave();
        if (save) {
          game.continueGame(save);
          state.set('startDelay');
        }
        break;
      }
      case 'difficulty':
        settings.difficulty = settings.difficulty === 0 ? 1 : 0;
        storage.saveSettings(settings);
        if (menu) {
          const idx = menu.items.findIndex(i => i.id === 'difficulty');
          if (idx >= 0) menu.items[idx].label = settings.difficulty === 0 ? 'Difficulty: Easy' : 'Difficulty: Hard';
        }
        break;
      case 'sound':
        settings.soundEnabled = !settings.soundEnabled;
        audio.enabled = settings.soundEnabled;
        storage.saveSettings(settings);
        if (menu) {
          const idx = menu.items.findIndex(i => i.id === 'sound');
          if (idx >= 0) menu.items[idx].label = settings.soundEnabled ? 'Sound: ON' : 'Sound: OFF';
        }
        break;
      case 'topscores': {
        const top = storage.loadTopScore();
        const fast = storage.loadFastestTime();
        const msg = `Top Score: ${top.score}\nBest Time: ${formatTime(fast)}`;
        // Use the canvas as a temporary overlay for a few seconds
        const origRender = loop.onRender;
        let t = 0;
        const timeoutId = setInterval(() => {
          t += TICK_MS;
          if (t >= 3000) {
            clearInterval(timeoutId);
            loop.onRender = origRender;
          }
        }, TICK_MS);
        loop.onRender = (_a) => {
          renderer.clear();
          renderer.fillRect(0, 0, SCREEN_W, SCREEN_H, '#000066');
          renderer.ctx.fillStyle = '#FFFFFF';
          renderer.ctx.font = '8px monospace';
          renderer.ctx.textAlign = 'center';
          const lines = msg.split('\n');
          lines.forEach((line, i) => {
            renderer.ctx.fillText(line, SCREEN_W / 2, SCREEN_H / 2 - 10 + i * 12);
          });
          renderer.present();
        };
        break;
      }
      case 'instructions': {
        const instrText = 'Arrow keys / WASD to move\nUp/W or Space to Jump\nZ/Space to Shoot\nCollect coins, avoid spikes\nand monsters!\nReach the flag to clear\nthe level.\n\nPress Fire to return.';
        const origRender = loop.onRender;
        let showing = true;
        const checkInput = () => {
          if (showing && (input.effective.fire || input.effective.menu)) {
            showing = false;
            loop.onRender = origRender;
          }
          if (showing) requestAnimationFrame(checkInput);
        };
        loop.onRender = (_a) => {
          renderer.clear();
          renderer.fillRect(0, 0, SCREEN_W, SCREEN_H, '#000066');
          renderer.ctx.fillStyle = '#FFFFFF';
          renderer.ctx.font = '7px monospace';
          renderer.ctx.textAlign = 'center';
          const lines = instrText.split('\n');
          lines.forEach((line, i) => {
            renderer.ctx.fillText(line, SCREEN_W / 2, 15 + i * 12);
          });
          renderer.present();
        };
        requestAnimationFrame(checkInput);
        break;
      }
      case 'credits': {
        const creditText = 'New Skool Skater\n\n(c) 2002 Blue Sphere Games Ltd.\n\nWritten by David Winchurch\n\nGraphics by Mark Jones\n\nHTML5 Port 2026';
        const origRender = loop.onRender;
        let showing = true;
        const checkInput = () => {
          if (showing && (input.effective.fire || input.effective.menu)) {
            showing = false;
            loop.onRender = origRender;
          }
          if (showing) requestAnimationFrame(checkInput);
        };
        loop.onRender = (_a) => {
          renderer.clear();
          renderer.fillRect(0, 0, SCREEN_W, SCREEN_H, '#000066');
          renderer.ctx.fillStyle = '#FFFFFF';
          renderer.ctx.font = '7px monospace';
          renderer.ctx.textAlign = 'center';
          const lines = creditText.split('\n');
          lines.forEach((line, i) => {
            renderer.ctx.fillText(line, SCREEN_W / 2, 20 + i * 14);
          });
          renderer.present();
        };
        requestAnimationFrame(checkInput);
        break;
      }
      case 'quit':
        break;
    }
  }

  // --- Start the loop ---
  loop.start();
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

main().catch(console.error);
