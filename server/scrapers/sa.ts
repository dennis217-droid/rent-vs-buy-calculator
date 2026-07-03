import type { StateScraper } from './types.js';
import { SOURCE_URLS } from './seed.js';
import { scrapeGenericMarginalPage } from './generic.js';

// Note: RevenueSA's site returned an HTTP 403 to a fetch attempt during
// research (likely bot protection). This scraper will very likely fail and
// fall back to the cached/seed rate — that's expected, not a bug.
export const saScraper: StateScraper = {
  state: 'SA',
  sourceUrl: SOURCE_URLS.SA,
  scrape: () => scrapeGenericMarginalPage('SA', SOURCE_URLS.SA),
};
