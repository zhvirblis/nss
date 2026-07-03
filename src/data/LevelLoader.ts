import type { LevelData } from '../core/types';
import level0 from '../data/levels/level0.json';
import level1 from '../data/levels/level1.json';
import level2 from '../data/levels/level2.json';
import level3 from '../data/levels/level3.json';
import level4 from '../data/levels/level4.json';

const levels: LevelData[] = [
  level0 as LevelData,
  level1 as LevelData,
  level2 as LevelData,
  level3 as LevelData,
  level4 as LevelData,
];

export function getLevelData(index: number): LevelData {
  return levels[index];
}

export const TOTAL_LEVELS = levels.length;
