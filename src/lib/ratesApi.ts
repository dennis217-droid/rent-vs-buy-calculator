import type { AustralianState, DutyBracket, RateMeta, RatesState, RateSource } from './calculator';

interface StampDutyApiEntry {
  brackets: DutyBracket[];
  source: RateSource;
  sourceUrl: string;
  fetchedAt: string;
}

interface MortgageRateApiEntry {
  rate: number;
  source: RateSource;
  sourceUrl: string;
  fetchedAt: string;
}

interface RatesApiResponse {
  stampDuty: Record<AustralianState, StampDutyApiEntry>;
  mortgageRate: MortgageRateApiEntry;
}

export async function fetchRates(): Promise<RatesState> {
  const res = await fetch('/api/rates', { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Rates API returned HTTP ${res.status}`);
  const data = (await res.json()) as RatesApiResponse;

  const brackets = {} as Record<AustralianState, DutyBracket[]>;
  const meta: RatesState['meta'] = {};
  (Object.keys(data.stampDuty) as AustralianState[]).forEach((state) => {
    brackets[state] = data.stampDuty[state].brackets;
    meta[state] = {
      source: data.stampDuty[state].source,
      sourceUrl: data.stampDuty[state].sourceUrl,
      fetchedAt: data.stampDuty[state].fetchedAt,
    };
  });

  const mortgageRateMeta: RateMeta = {
    source: data.mortgageRate.source,
    sourceUrl: data.mortgageRate.sourceUrl,
    fetchedAt: data.mortgageRate.fetchedAt,
  };

  return {
    brackets,
    meta,
    mortgageRate: { rate: data.mortgageRate.rate, meta: mortgageRateMeta },
  };
}
