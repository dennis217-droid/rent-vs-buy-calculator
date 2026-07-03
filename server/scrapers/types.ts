export type AustralianState = 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'ACT';

export interface DutyBracket {
  threshold: number;
  base: number;
  rate: number; // marginal rate, e.g. 0.035 for $3.50 per $100
  flatOnTotal?: boolean; // if true, duty = rate * price (not marginal) while in this bracket
}

export type RateSource = 'live' | 'cached-live' | 'seed';

export interface StateRateEntry {
  brackets: DutyBracket[];
  source: RateSource;
  sourceUrl: string;
  fetchedAt: string; // ISO timestamp of when this entry's data was obtained
}

export interface MortgageRateEntry {
  rate: number; // annual %, e.g. 6.8
  source: RateSource;
  sourceUrl: string;
  fetchedAt: string;
}

export interface RatesCache {
  stampDuty: Record<AustralianState, StateRateEntry>;
  mortgageRate: MortgageRateEntry;
}

export interface StateScraper {
  state: AustralianState;
  sourceUrl: string;
  scrape: () => Promise<DutyBracket[]>;
}
