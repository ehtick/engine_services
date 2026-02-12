import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export interface ThatOpenConfig {
  accessToken: string;
  apiUrl: string;
}

const CONFIG_DIR = join(homedir(), '.thatopen');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export function readConfig(): ThatOpenConfig | null {
  if (!existsSync(CONFIG_FILE)) return null;
  try {
    const raw = readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(raw) as ThatOpenConfig;
  } catch {
    return null;
  }
}

export function writeConfig(config: ThatOpenConfig): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function requireConfig(): ThatOpenConfig {
  const config = readConfig();
  if (!config) {
    console.error('Not logged in. Run `thatopen login` first.');
    process.exit(1);
  }
  return config;
}
