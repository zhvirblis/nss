export class AudioManager {
  private ctx: AudioContext | null = null;
  private buffers: AudioBuffer[] = [];
  private _enabled = true;

  get enabled(): boolean { return this._enabled; }
  set enabled(v: boolean) { this._enabled = v; }

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  async init(): Promise<void> {
    this.buffers = [
      await this.createMelody(this.wonNotes()),
      await this.createMelody(this.deadNotes()),
      await this.createMelody(this.bonusNotes()),
      await this.createBeep(200, 0.1),
      await this.createBeep(400, 0.1),
      await this.createBeep(600, 0.1),
    ];
  }

  play(index: number): void {
    if (!this._enabled || index < 0 || index >= this.buffers.length) return;
    try {
      const ctx = this.getContext();
      const src = ctx.createBufferSource();
      src.buffer = this.buffers[index];
      src.connect(ctx.destination);
      src.start(0);
    } catch { /* ignore */ }
  }

  private async createMelody(notes: [number, number][]): Promise<AudioBuffer> {
    const sampleRate = 8000;
    let totalLen = 0;
    for (const [, dur] of notes) totalLen += Math.floor(dur * sampleRate);
    const buffer = this.getContext().createBuffer(1, totalLen, sampleRate);
    const data = buffer.getChannelData(0);
    let offset = 0;

    for (const [freq, dur] of notes) {
      const len = Math.floor(dur * sampleRate);
      for (let i = 0; i < len; i++) {
        const t = i / sampleRate;
        let sample = Math.sin(2 * Math.PI * freq * t) * 0.3;
        const envelope = Math.min(1, (len - i) / (sampleRate * 0.02));
        sample *= envelope;
        data[offset + i] = sample;
      }
      offset += len;
    }
    return buffer;
  }

  private async createBeep(freq: number, dur: number): Promise<AudioBuffer> {
    const sampleRate = 8000;
    const len = Math.floor(dur * sampleRate);
    const buffer = this.getContext().createBuffer(1, len, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const t = i / sampleRate;
      data[i] = Math.sin(2 * Math.PI * freq * t) * 0.3;
    }
    return buffer;
  }

  private wonNotes(): [number, number][] {
    return [
      [523, 0.15], [659, 0.15], [784, 0.15], [1047, 0.3],
      [784, 0.15], [1047, 0.4],
    ];
  }

  private deadNotes(): [number, number][] {
    return [
      [392, 0.2], [349, 0.2], [330, 0.2], [262, 0.4],
    ];
  }

  private bonusNotes(): [number, number][] {
    return [
      [440, 0.1], [554, 0.1], [659, 0.15],
      [880, 0.15], [1109, 0.2],
    ];
  }
}
