import type { RampEntry } from './types';

export class AssetManager {
  images = new Map<string, HTMLImageElement>();

  private loaded = false;

  async loadAll(): Promise<void> {
    if (this.loaded) return;
    const spriteNames = [
      'Tiles', 'PlayerImages', 'JumpingMonsterImages', 'FlyingMonsterImages',
      'LineMonsterImages', 'InvincibilityImages', 'EndScreen', 'ShotImage',
      'Scores', 'Status', 'bsg', 'titlesm',
    ];
    await Promise.all(
      spriteNames.map(name => this.loadImage(name, `assets/sprites/${name}.png`))
    );
    this.loaded = true;
  }

  private loadImage(key: string, src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => { this.images.set(key, img); resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  }

  getImage(key: string): HTMLImageElement {
    const img = this.images.get(key);
    if (!img) throw new Error(`Image not loaded: ${key}`);
    return img;
  }
}

let rampData: RampEntry[] | null = null;

export function getRampData(): RampEntry[] {
  if (rampData) return rampData;

  const heightMaps: number[][] = [];
  const angles: number[][] = [];

  for (let i = 0; i < 35; i++) { heightMaps.push([]); angles.push([]); }

  heightMaps[35] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
  heightMaps[36] = [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8];
  heightMaps[37] = [9,9,10,10,11,11,12,12,13,13,14,14,15,15,16,16];
  heightMaps[38] = [1,1,1,1,1,2,2,2,2,3,3,3,4,4,5,5];
  heightMaps[39] = [6,6,7,8,9,10,11,12,13,14,16,18,20,23,27,32];
  heightMaps[40] = [0,0,0,0,0,0,0,0,0,0,0,2,4,7,11,16];
  heightMaps[50] = [16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1];
  heightMaps[51] = [8,8,7,7,6,6,5,5,4,4,3,3,2,2,1,1];
  heightMaps[52] = [16,16,15,15,14,14,13,13,12,12,11,11,10,10,9,9];
  heightMaps[53] = [5,5,4,4,3,3,3,2,2,2,2,1,1,1,1,1];
  heightMaps[54] = [32,27,23,20,18,16,14,13,12,11,10,9,8,7,6,6];
  heightMaps[55] = [16,11,7,4,2,0,0,0,0,0,0,0,0,0,0,0];

  angles[35] = [45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45];
  angles[36] = [27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27];
  angles[37] = [27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27];
  angles[38] = [0,0,0,0,0,0,0,0,0,27,27,27,27,27,27,27];
  angles[39] = [27,27,45,45,45,45,45,45,45,45,63,63,63,90,90,90];
  angles[40] = [0,0,0,0,0,0,0,0,0,0,0,63,63,90,90,90];
  angles[50] = [315,315,315,315,315,315,315,315,315,315,315,315,315,315,315,315];
  angles[51] = [333,333,333,333,333,333,333,333,333,333,333,333,333,333,333,333];
  angles[52] = [333,333,333,333,333,333,333,333,333,333,333,333,333,333,333,333];
  angles[53] = [333,333,333,333,333,333,333,0,0,0,0,0,0,0,0,0];
  angles[54] = [270,270,270,297,297,297,315,315,315,315,315,315,315,315,333,333];
  angles[55] = [270,270,270,297,297,297,0,0,0,0,0,0,0,0,0,0];

  rampData = heightMaps.map((hm, i) => ({
    heightMap: hm,
    angles: angles[i],
  }));

  return rampData;
}

const sinTable = [0,4,8,13,17,22,26,31,35,40,44,48,53,57,61,66,70,74,79,83,87,91,95,100,104,108,112,116,120,124,127,131,135,139,143,146,150,154,157,161,164,167,171,174,177,181,184,187,190,193,196,198,201,204,207,209,212,214,217,219,221,223,226,228,230,232,233,235,237,238,240,242,243,244,246,247,248,249,250,251,252,252,253,254,254,255,255,255,255,255,256];

const cosTable = [256,255,255,255,255,255,254,254,253,252,252,251,250,249,248,247,246,244,243,242,240,238,237,235,233,232,230,228,226,223,221,219,217,214,212,209,207,204,201,198,196,193,190,187,184,181,177,174,171,167,164,161,157,154,150,146,143,139,135,131,128,124,120,116,112,108,104,100,95,91,87,83,79,74,70,66,61,57,53,48,44,40,35,31,26,22,17,13,8,4,0];

export function getSin(angle: number): number {
  if (angle <= 90) return sinTable[angle];
  if (angle <= 180) return sinTable[180 - angle];
  if (angle <= 270) return -sinTable[angle - 180];
  return -sinTable[360 - angle];
}

export function getCos(angle: number): number {
  if (angle <= 90) return cosTable[angle];
  if (angle <= 180) return -cosTable[180 - angle];
  if (angle <= 270) return -cosTable[angle - 180];
  return cosTable[360 - angle];
}
