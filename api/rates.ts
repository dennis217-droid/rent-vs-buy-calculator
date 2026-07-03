import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AustralianState, RatesCache, StateRateEntry } from '../server/scrapers/types.js';
import { SCRAPERS } from '../server/scrapers/index.js';
import { scrapeMortgageRate } from '../server/scrapers/rba.js';
import { MORTGAGE_RATE_SOURCE_URL, SEED_BRACKETS, SEED_MORTGAGE_RATE, SOURCE_URLS } from '../server/scrapers/seed.js';

// Vercel serverless functions are stateless between invocations (no
// persistent disk, no long-running background interval like the local dev
// Express server has), so this scrapes fresh on every cold invocation and
// relies on the CDN Cache-Control header below to avoid re-scraping on
// every request. Each source falls back independently to its seed value on
// failure — never a hard error for the whole endpoint.
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const now = new Date().toISOString();

  const stampDutyResults = await Promise.allSettled(
    SCRAPERS.map(async (scraper) => ({ state: scraper.state, brackets: await scraper.scrape() })),
  );

  const stampDuty = {} as Record<AustralianState, StateRateEntry>;
  stampDutyResults.forEach((result, i) => {
    const scraper = SCRAPERS[i];
    if (result.status === 'fulfilled') {
      stampDuty[scraper.state] = {
        brackets: result.value.brackets,
        source: 'live',
        sourceUrl: scraper.sourceUrl,
        fetchedAt: now,
      };
    } else {
      console.warn(`[rates] ${scraper.state} scrape failed:`, (result.reason as Error).message);
      stampDuty[scraper.state] = {
        brackets: SEED_BRACKETS[scraper.state],
        source: 'seed',
        sourceUrl: SOURCE_URLS[scraper.state],
        fetchedAt: now,
      };
    }
  });

  let mortgageRate: RatesCache['mortgageRate'];
  try {
    const rate = await scrapeMortgageRate();
    mortgageRate = { rate, source: 'live', sourceUrl: MORTGAGE_RATE_SOURCE_URL, fetchedAt: now };
  } catch (err) {
    console.warn('[rates] MORTGAGE_RATE scrape failed:', (err as Error).message);
    mortgageRate = { rate: SEED_MORTGAGE_RATE, source: 'seed', sourceUrl: MORTGAGE_RATE_SOURCE_URL, fetchedAt: now };
  }

  const cache: RatesCache = { stampDuty, mortgageRate };

  // Let Vercel's edge cache serve this for up to an hour so we don't
  // re-scrape six government sites on every single page load.
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.status(200).json(cache);
}
