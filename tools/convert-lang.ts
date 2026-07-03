import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const langPath = join(__dirname, '..', 'src', 'data', 'lang');
const outPath = join(__dirname, '..', 'src', 'data', 'lang.json');

const buf = readFileSync(langPath);
let offset = 0;

const readByte = () => buf[offset++];
const readShort = () => { const v = (buf[offset] << 8) | buf[offset + 1]; offset += 2; return v; };
const readUTF = () => {
  const len = readShort();
  const str = buf.toString('utf8', offset, offset + len);
  offset += len;
  return str;
};

readByte(); // header skip

const wordCount = 38;
const words: string[] = [];
for (let i = 0; i < wordCount; i++) words.push(readUTF());
const tsFont = readByte();
const pkFont = readByte();
const expiryDays = readByte();
const expiryMessage = readUTF();

const numDiffNames = readByte();
const difficultyNames: string[] = [];
for (let i = 0; i < numDiffNames; i++) difficultyNames.push(readUTF());
const credits = readUTF();
const demoMessage = readUTF();

const numInstructions = readByte();
const instructions: string[] = [];
for (let i = 0; i < numInstructions; i++) instructions.push(readUTF());

const numCanvasStrings = readByte();
const langA: number[] = [];
const langT: string[] = [];
for (let i = 0; i < numCanvasStrings; i++) {
  langA.push(readByte());
  langT.push(readUTF());
}

const out = { words, tsFont, pkFont, expiryDays, expiryMessage, difficultyNames, credits, demoMessage, instructions, langA, langT };
writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log('Converted lang -> lang.json');
