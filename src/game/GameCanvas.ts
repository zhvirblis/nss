import { SCREEN_W, GAME_H, HALF_GAME_W } from '../core/types';
import type { InputState } from '../core/types';
import { TileMap } from './TileMap';
import { Player } from './Player';
import { Camera } from './Camera';
import { Renderer } from '../rendering/Renderer';
import { SpriteSheet } from '../rendering/SpriteSheet';
import { TileRenderer } from '../rendering/TileRenderer';
import { HUDRenderer } from '../rendering/HUDRenderer';
import { ScreenRenderer } from '../rendering/ScreenRenderer';
import { AudioManager } from '../audio/AudioManager';
import { getLevelData, TOTAL_LEVELS } from '../data/LevelLoader';
import { Monster } from '../entities/Monster';
import { JumpingMonster } from '../entities/JumpingMonster';
import { FlyingMonster } from '../entities/FlyingMonster';
import { LineMonster } from '../entities/LineMonster';

export class GameCanvas {
  player: Player;
  tileMap!: TileMap;
  camera: Camera;
  monsters: (Monster | null)[] = [];
  renderer: Renderer;
  tileRenderer!: TileRenderer;
  hudRenderer!: HUDRenderer;
  screenRenderer: ScreenRenderer;
  audio: AudioManager;

  currentLevel = 0;
  totalTime = 0;
  timer = 0;
  startTime = 0;
  pausedTime = 0;
  lastTimerValue = 0;

  levelClear = false;
  gameover = false;
  won = false;
  finishedGame = false;
  startDelay = true;
  keyPressed = false;
  gameRunning = false;
  dyingTimer = 0;
  dyingFallTimer = 0;

  private playerSheet!: SpriteSheet;
  private scoreSheet!: SpriteSheet;
  private invincibilitySheet!: SpriteSheet;
  private shotSheet!: SpriteSheet;

  private imgAssets!: Map<string, HTMLImageElement>;

  constructor(renderer: Renderer, audio: AudioManager, assets: Map<string, HTMLImageElement>) {
    this.renderer = renderer;
    this.audio = audio;
    this.imgAssets = assets;
    this.player = new Player();
    this.camera = new Camera();
    this.screenRenderer = new ScreenRenderer(renderer);
    this.initSprites(assets);
  }

  private initSprites(assets: Map<string, HTMLImageElement>): void {
    const tilesImg = assets.get('Tiles')!;
    this.tileRenderer = new TileRenderer(new SpriteSheet(tilesImg));
    this.playerSheet = new SpriteSheet(assets.get('PlayerImages')!);
    this.scoreSheet = new SpriteSheet(assets.get('Scores')!);
    this.invincibilitySheet = new SpriteSheet(assets.get('InvincibilityImages')!);
    this.shotSheet = new SpriteSheet(assets.get('ShotImage')!);
    this.hudRenderer = new HUDRenderer(assets.get('Status')!);
  }

  startGame(): void {
    this.currentLevel = 0;
    this.player.score = 0;
    this.player.lives = 5;
    this.player.totalCoins = 0;
    this.totalTime = 0;
    this.finishedGame = false;
    this.loadLevel();
  }

  continueGame(save: { currentLevel: number; lives: number; score: number; totalTime: number }): void {
    this.currentLevel = save.currentLevel;
    this.player.lives = save.lives;
    this.player.score = save.score;
    this.totalTime = save.totalTime;
    this.finishedGame = false;
    this.loadLevel();
  }

  loadLevel(): void {
    const data = getLevelData(this.currentLevel);
    this.tileMap = new TileMap(data.tiles.map(row => [...row]));
    this.camera.setBounds(this.tileMap.pixelsWide(), this.tileMap.pixelsTall());
    this.camera.reset();

    const pStartX = data.playerStartX << 4;
    const pStartY = (data.playerStartY << 4) + 16;
    this.player.initLevel(pStartX, pStartY);

    this.monsters = [];
    for (const spawn of data.monsters) {
      const imgKey = spawn.type === 1 ? 'JumpingMonsterImages'
        : spawn.type === 2 ? 'FlyingMonsterImages'
        : 'LineMonsterImages';
      const img = this.imgAssets.get(imgKey) ?? null;

      switch (spawn.type) {
        case 1:
          if (img) this.monsters.push(new JumpingMonster(img as HTMLImageElement, this.tileMap, spawn.data[0], spawn.data[1], spawn.data[2], spawn.data[3], spawn.data[4], this.tileMap.pixelsTall()));
          break;
        case 2:
          if (img) this.monsters.push(new FlyingMonster(img as HTMLImageElement, spawn.data[0], spawn.data[1], spawn.data[2], spawn.data[3], spawn.data[4], this.tileMap.pixelsTall()));
          break;
        case 3: {
          if (img) {
            const numNodes = spawn.data[0];
            const nodes: number[][] = [];
            let idx = 1;
            for (let n = 0; n < numNodes; n++) {
              nodes.push([spawn.data[idx] * 16, spawn.data[idx + 1] * 16]);
              idx += 2;
            }
            const speed = spawn.data[idx];
            this.monsters.push(new LineMonster(img, nodes, nodes[0][0], nodes[0][1], 0, 0, speed, this.tileMap.pixelsTall()));
          }
          break;
        }
      }
    }

    this.timer = 0;
    this.startTime = 0;
    this.pausedTime = 0;
    this.lastTimerValue = 0;
    this.levelClear = false;
    this.gameover = false;
    this.won = false;
    this.startDelay = true;
    this.keyPressed = false;
    this.gameRunning = false;
    this.dyingTimer = 0;
    this.dyingFallTimer = 0;
  }

  startDelayPeriod(): void {
    this.startDelay = false;
    this.gameRunning = true;
  }

  update(input: InputState): string | null {
    if (this.startDelay) {
      return null;
    }

    // Won - level complete
    if (this.won) {
      this.totalTime += this.timer;
      return 'won';
    }

    if (this.gameover) {
      return 'gameover';
    }

    if (this.finishedGame) {
      return 'finished';
    }

    if (!this.keyPressed && !input.left && !input.right && !input.up && !input.down && !input.fire) {
      return null;
    }
    this.keyPressed = true;

    if (!this.gameRunning) {
      return null;
    }

    // Timer
    if (this.startTime === 0) {
      this.startTime = performance.now();
    }
    if (this.pausedTime > 0) {
      this.startTime += performance.now() - this.pausedTime;
      this.pausedTime = 0;
    }
    this.lastTimerValue = this.timer;
    this.timer = Math.floor((performance.now() - this.startTime) / 1000);

    // Dying state
    if (this.player.dead) {
      this.dyingTimer++;
      if (this.player.y > this.tileMap.pixelsTall() + 50) {
        if (this.player.lives <= 0) {
          this.gameover = true;
          this.audio.play(1);
          return 'gameover';
        }
        this.player.respawn();
        for (const m of this.monsters) {
          if (m) m.reset();
        }
        this.dyingTimer = 0;
      }
      return null;
    }

    const result = this.player.update(
      this.tileMap,
      input.left,
      input.right,
      input.up,
      input.down,
      input.fire,
      66.67
    );

    if (result.died) {
      this.audio.play(1);
      return null;
    }

    if (result.collected) {
      const ct = result.ct;
      const col = result.cx;
      const row = result.cy;
      this.tileMap.setTile(col, row, 0);

      if (ct === 90) {
        if (this.player.lives < 99) this.player.lives++;
        this.player.score += 5000;
        this.player.scoreAnims.push({ index: 5, x: (col << 4) + 8, y: row << 4, counter: 0 });
        this.audio.play(2);
      } else if (ct === 91) {
        this.player.origX = col << 4;
        this.player.origY = (row << 4) + 15;
      } else if (ct === 92) {
        this.audio.play(2);
        this.player.invincible = true;
        this.player.invincibilityCounter = 0;
        this.player.invincibilityScoreAdj = 0;
      } else if (ct >= 93 && ct <= 95) {
        this.won = true;
        this.totalTime += this.timer;
        return 'won';
      } else if (ct === 99) {
        this.player.coins++;
        this.player.totalCoins++;
        this.player.score += 5;
        if (this.player.totalCoins >= 100) {
          this.player.totalCoins = 0;
          if (this.player.lives < 99) this.player.lives++;
          this.player.score += 5000;
          this.player.scoreAnims.push({ index: 5, x: (col << 4) + 8, y: row << 4, counter: 0 });
          this.audio.play(2);
        }
      }
    }

    // Handle shots vs monsters
    for (const monster of this.monsters) {
      if (!monster) continue;
      monster.checkActive(this.camera.xOff, this.camera.yOff, SCREEN_W, GAME_H);
      monster.move(this.tileMap);

      if (monster.active) {
        for (const shot of this.player.shots) {
          if (shot && monster.shotCollide(
            shot[0] >> 8, shot[1] >> 8,
            shot[2] >> 8, shot[3] >> 8
          )) {
            this.audio.play(5);
            this.player.score += 100;
            this.player.scoreAnims.push({ index: 0, x: monster.x + monster.halfW, y: monster.y - 10, counter: 0 });
          }
        }

        if (monster.collide(
          this.player.x + this.player.halfW,
          this.player.y - this.player.halfH
        )) {
          if (this.player.invincible) {
            this.audio.play(5);
            monster.dying = true;
            monster.dy = -8;
            monster.dx = 0;
            monster.currentMove = 4;
            const sAdj = this.player.invincibilityScoreAdj;
            this.player.score += [100, 200, 500, 1000, 2000, 5000][sAdj] ?? 100;
            this.player.scoreAnims.push({ index: sAdj, x: monster.x + monster.halfW, y: monster.y - 10, counter: 0 });
            if (sAdj === 5) {
              if (this.player.lives < 99) this.player.lives++;
              this.audio.play(2);
            }
            if (this.player.invincibilityScoreAdj < 5) {
              this.player.invincibilityScoreAdj++;
            }
          } else {
            this.player.die();
            this.audio.play(1);
            return null;
          }
        }
      }
    }

    // Clean dead monsters
    this.monsters = this.monsters.filter(m => m && !m.dead);

    // Shots cleanup
    this.player.shots = this.player.shots.filter(s => s !== null);

    // Camera
    this.camera.update(
      this.player.x, this.player.y,
      this.player.dx, this.player.dy,  // pDX is unused in camera
      this.player.halfW, this.player.halfH,
      this.player.currentMove,
      this.player.angle,
      input.down
    );

    // Score animations
    for (const anim of this.player.scoreAnims) {
      anim.counter += 2;
    }
    this.player.scoreAnims = this.player.scoreAnims.filter(a => a.counter < 40);

    return null;
  }

  render(): void {
    const ctx = this.renderer.ctx;

    if (this.finishedGame) {
      this.screenRenderer.drawEndScreen();
      const endImg = this.imgAssets.get('EndScreen');
      if (endImg) {
        ctx.drawImage(endImg, HALF_GAME_W - 88, 0, 176, 208);
      }
      return;
    }

    this.renderer.fillSky();
    this.tileRenderer.render(ctx, this.tileMap.tiles, this.camera.xOff, this.camera.yOff);

    // Player
    if (!this.player.dead) {
      const sx = this.player.angleOff * this.player.width;
      const sy = this.player.currentMove * (this.player.height + 8);
      this.playerSheet.draw(ctx, sx, sy, this.player.width, this.player.height + 8,
        this.camera.xOff + this.player.x,
        this.camera.yOff + this.player.y - this.player.height);

      if (this.player.invincible) {
        this.invincibilitySheet.draw(ctx,
          this.player.invincibilityFrame * 22, 0, 22, 22,
          this.camera.xOff + this.player.x - 3,
          this.camera.yOff + this.player.y - this.player.height - 3);
      }
    }

    // Monsters
    for (const monster of this.monsters) {
      if (monster) monster.render(ctx, this.camera.xOff, this.camera.yOff);
    }

    // Score animations
    for (const anim of this.player.scoreAnims) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(
        this.camera.xOff + anim.x - 11,
        this.camera.yOff + anim.y - anim.counter,
        22, 7
      );
      ctx.clip();
      this.scoreSheet.draw(ctx, 0, anim.index * 7, 22, 7,
        this.camera.xOff + anim.x - 11,
        this.camera.yOff + anim.y - anim.counter - anim.index * 7);
      ctx.restore();
    }

    // Shots
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (const shot of this.player.shots) {
      if (shot) {
        this.shotSheet.draw(ctx, 0, 0, 4, 4,
          this.camera.xOff + (shot[0] >> 8),
          this.camera.yOff + (shot[2] >> 8));
      }
    }

    // HUD
    this.hudRenderer.render(ctx, this.player.score, this.player.lives, this.player.totalCoins, this.timer);

    // Overlays
    if (this.startDelay) {
      this.screenRenderer.drawLevelStart(this.currentLevel);
    }
    if (this.player.dead) {
      // dying - no overlay
    }
    if (this.gameover) {
      this.screenRenderer.drawGameOver();
    }
  }

  getSaveData(): { currentLevel: number; lives: number; score: number; totalTime: number } {
    return {
      currentLevel: this.currentLevel,
      lives: this.player.lives,
      score: this.player.score,
      totalTime: this.totalTime,
    };
  }

  nextLevel(): void {
    this.currentLevel++;
    if (this.currentLevel >= TOTAL_LEVELS) {
      this.finishedGame = true;
    } else {
      this.loadLevel();
    }
  }
}
