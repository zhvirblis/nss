export const SCREEN_W = 176;
export const SCREEN_H = 208;
export const STATUS_H = 7;
export const GAME_H = SCREEN_H - STATUS_H;
export const HALF_GAME_W = SCREEN_W / 2;
export const HALF_GAME_H = GAME_H / 2;
export const TILE_SIZE = 16;
export const TICK_MS = 66.67;
export const FPS_15 = 1000 / 15;

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  fire: boolean;
  menu: boolean;
}

export interface SaveData {
  currentLevel: number;
  lives: number;
  score: number;
  totalTime: number;
}

export interface Settings {
  difficulty: number;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
}

export interface TopScore {
  score: number;
  time: number;
}

export interface LevelData {
  width: number;
  height: number;
  playerStartX: number;
  playerStartY: number;
  tiles: number[][];
  monsters: MonsterSpawn[];
}

export interface MonsterSpawn {
  type: number;
  data: number[];
}

export interface RampEntry {
  heightMap: number[];
  angles: number[];
}

export interface ScoreAnim {
  index: number;
  x: number;
  y: number;
  counter: number;
}

export type GameState = 'splash' | 'menu' | 'startDelay' | 'playing' | 'paused' | 'dying' | 'levelClear' | 'gameOver' | 'gameComplete' | 'instructions' | 'credits' | 'topScores' | 'transitions';

export interface StringBundle {
  words: string[];
  tsFont: number;
  pkFont: number;
  expiryDays: number;
  expiryMessage: string;
  difficultyNames: string[];
  credits: string;
  demoMessage: string;
  instructions: string[];
  langA: number[];
  langT: string[];
}
