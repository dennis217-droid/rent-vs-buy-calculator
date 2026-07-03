import type { StateScraper } from './types.js';
import { nswScraper } from './nsw.js';
import { vicScraper } from './vic.js';
import { qldScraper } from './qld.js';
import { waScraper } from './wa.js';
import { saScraper } from './sa.js';
import { actScraper } from './act.js';
import { scrapeMortgageRate } from './rba.js';
import { MORTGAGE_RATE_SOURCE_URL } from './seed.js';
import { getCache, updateMortgageRate, updateStampDutyState } from '../cache.js';

export const SCRAPERS: StateScraper[] = [nswScraper, vicScraper, qldScraper, waScraper, saScraper, actScraper];

export async function refreshAllRates(): Promise<{ succeeded: string[]; failed: string[] }> {
  const succeeded: string[] = [];
  const failed: string[] = [];

  const results = await Promise.allSettled(
    SCRAPERS.map(async (scraper) => {
      const brackets = await scraper.scrape();
      return { state: scraper.state, brackets };
    }),
  );

  results.forEach((result, i) => {
    const scraper = SCRAPERS[i];
    if (result.status === 'fulfilled') {
      updateStampDutyState(scraper.state, {
        brackets: result.value.brackets,
        source: 'live',
        sourceUrl: scraper.sourceUrl,
        fetchedAt: new Date().toISOString(),
      });
      succeeded.push(scraper.state);
    } else {
      // Keep whatever is already cached (seed or a previous successful
      // scrape) but mark it as cached-live if it wasn't already a seed.
      const existing = getCache().stampDuty[scraper.state];
      if (existing.source === 'live') {
        updateStampDutyState(scraper.state, { ...existing, source: 'cached-live' });
      }
      console.warn(`[rates] ${scraper.state} scrape failed:`, (result.reason as Error).message);
      failed.push(scraper.state);
    }
  });

  try {
    const rate = await scrapeMortgageRate();
    updateMortgageRate({
      rate,
      source: 'live',
      sourceUrl: MORTGAGE_RATE_SOURCE_URL,
      fetchedAt: new Date().toISOString(),
    });
    succeeded.push('MORTGAGE_RATE');
  } catch (err) {
    const existing = getCache().mortgageRate;
    if (existing.source === 'live') {
      updateMortgageRate({ ...existing, source: 'cached-live' });
    }
    console.warn('[rates] MORTGAGE_RATE scrape failed:', (err as Error).message);
    failed.push('MORTGAGE_RATE');
  }

  return { succeeded, failed };
}
