import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const levelsDir = join(__dirname, '..', 'src', 'data', 'Levels');
const outDir = join(__dirname, '..', 'src', 'data', 'levels');

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

function convertLevel(filePath: string): void {
  const buf = readFileSync(filePath);
  let offset = 0;

  const readInt = () => {
    const val = (buf[offset] << 24) | (buf[offset + 1] << 16) | (buf[offset + 2] << 8) | buf[offset + 3];
    offset += 4;
    return val;
  };

  const readByte = () => buf[offset++];

  const width = readInt();
  const height = readInt();
  const playerStartX = readInt();
  const playerStartY = readInt();

  const tiles: number[][] = Array.from({ length: height }, () => new Array(width).fill(0));
  for (let col = 0; col < width; col++) {
    for (let row = 0; row < height; row++) {
      tiles[row][col] = readByte();
    }
  }

  const numMonsters = readByte();
  const monsters: { type: number; data: number[] }[] = [];

  for (let m = 0; m < numMonsters; m++) {
    const type = readByte();
    switch (type) {
      case 1:
        monsters.push({ type: 1, data: [readByte(), readByte(), readByte(), readByte(), readByte()] });
        break;
      case 2:
        monsters.push({ type: 2, data: [readByte(), readByte(), readByte(), readByte(), readByte()] });
        break;
      case 3: {
        const numNodes = readByte();
        const nodes: number[] = [];
        for (let n = 0; n < numNodes; n++) nodes.push(readByte(), readByte());
        nodes.push(readByte());
        monsters.push({ type: 3, data: [numNodes, ...nodes] });
        break;
      }
    }
  }

  const baseName = filePath.replace(/\\/g, '/').split('/').pop()!.replace('.txt', '');
  const out = { width, height, playerStartX, playerStartY, tiles, monsters };
  writeFileSync(join(outDir, `${baseName}.json`), JSON.stringify(out));
  console.log(`Converted: ${baseName}`);
}

const files = readdirSync(levelsDir).filter(f => f.endsWith('.txt'));
for (const f of files) convertLevel(join(levelsDir, f));
console.log('Done.');
