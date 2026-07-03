import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AustralianState, MortgageRateEntry, RatesCache, StateRateEntry } from './scrapers/types.js';
import { MORTGAGE_RATE_SOURCE_URL, SEED_BRACKETS, SEED_MORTGAGE_RATE, SOURCE_URLS } from './scrapers/seed.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = join(__dirname, 'data', 'rates-cache.json');

function seedCache(): RatesCache {
  const now = new Date().toISOString();
  const stampDuty = {} as Record<AustralianState, StateRateEntry>;
  (Object.keys(SEED_BRACKETS) as AustralianState[]).forEach((state) => {
    stampDuty[state] = {
      brackets: SEED_BRACKETS[state],
      source: 'seed',
      sourceUrl: SOURCE_URLS[state],
      fetchedAt: now,
    };
  });
  return {
    stampDuty,
    mortgageRate: {
      rate: SEED_MORTGAGE_RATE,
      source: 'seed',
      sourceUrl: MORTGAGE_RATE_SOURCE_URL,
      fetchedAt: now,
    },
  };
}

let cache: RatesCache = loadCache();

function loadCache(): RatesCache {
  if (existsSync(CACHE_PATH)) {
    try {
      return JSON.parse(readFileSync(CACHE_PATH, 'utf-8')) as RatesCache;
    } catch {
      // fall through to seed
    }
  }
  return seedCache();
}

function persist() {
  mkdirSync(dirname(CACHE_PATH), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

export function getCache(): RatesCache {
  return cache;
}

export function updateStampDutyState(state: AustralianState, entry: StateRateEntry) {
  cache = { ...cache, stampDuty: { ...cache.stampDuty, [state]: entry } };
  persist();
}

export function updateMortgageRate(entry: MortgageRateEntry) {
  cache = { ...cache, mortgageRate: entry };
  persist();
}
