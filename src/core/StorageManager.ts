import type { SaveData, Settings, TopScore } from './types';

const KEYS = {
  settings: 'nss_settings',
  save: 'nss_save',
  topScore: 'nss_topscore',
  fastestTime: 'nss_fastesttime',
} as const;

export class StorageManager {
  loadSettings(): Settings {
    try {
      const raw = localStorage.getItem(KEYS.settings);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return { soundEnabled: true, vibrateEnabled: false };
  }

  saveSettings(settings: Settings): void {
    try {
      localStorage.setItem(KEYS.settings, JSON.stringify(settings));
    } catch { /* ignore */ }
  }

  loadSave(): SaveData | null {
    try {
      const raw = localStorage.getItem(KEYS.save);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return null;
  }

  saveSave(data: SaveData): void {
    try {
      localStorage.setItem(KEYS.save, JSON.stringify(data));
    } catch { /* ignore */ }
  }

  deleteSave(): void {
    try {
      localStorage.removeItem(KEYS.save);
    } catch { /* ignore */ }
  }

  loadTopScore(): TopScore {
    try {
      const raw = localStorage.getItem(KEYS.topScore);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return { score: 0, time: 0 };
  }

  saveTopScore(score: TopScore): void {
    try {
      localStorage.setItem(KEYS.topScore, JSON.stringify(score));
    } catch { /* ignore */ }
  }

  loadFastestTime(): number {
    try {
      const raw = localStorage.getItem(KEYS.fastestTime);
      if (raw) return parseInt(raw, 10);
    } catch { /* ignore */ }
    return 99999;
  }

  saveFastestTime(time: number): void {
    try {
      localStorage.setItem(KEYS.fastestTime, String(time));
    } catch { /* ignore */ }
  }
}
