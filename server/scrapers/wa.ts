import * as cheerio from 'cheerio';
import type { DutyBracket, StateScraper } from './types.js';
import { SOURCE_URLS } from './seed.js';

// RevenueWA (via wa.gov.au) publishes the general transfer duty rate as an
// HTML table with columns "Dutiable value" / "Rate" under a "General rate"
// heading, e.g.:
//   "$0 - $120,000"        -> "$1.90 per $100 or part thereof"
//   "$120,001 - $150,000"  -> "$2,280 + $2.85 per $100 or part thereof above $120,000"
// The page also has a "Concessional rate" table with the same headers, so we
// must take the first matching table (General rate comes first on the page).
function parseRateCell(rangeText: string, rateText: string): DutyBracket | null {
  const rangeClean = rangeText.replace(/,/g, '').trim();
  const rateClean = rateText.replace(/,/g, '').trim();

  const isFirstBand = /^\$?0\b/.test(rangeClean);

  const marginalMatch = rateClean.match(/\$?([\d.]+)\s*\+\s*\$?([\d.]+)\s*per\s*\$100.{0,20}?above\s*\$?([\d.]+)/i);
  if (marginalMatch) {
    return {
      threshold: Number(marginalMatch[3]),
      base: Number(marginalMatch[1]),
      rate: Number(marginalMatch[2]) / 100,
    };
  }

  if (isFirstBand) {
    const firstBandMatch = rateClean.match(/\$?([\d.]+)\s*per\s*\$100/i);
    if (firstBandMatch) {
      return { threshold: 0, base: 0, rate: Number(firstBandMatch[1]) / 100 };
    }
  }

  return null;
}

async function scrape(): Promise<DutyBracket[]> {
  const res = await fetch(SOURCE_URLS.WA, {
    headers: { 'User-Agent': 'Mozilla/5.0 (rent-vs-buy-calculator rate sync)' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`WA scrape failed: HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const brackets: DutyBracket[] = [];
  $('table').each((_, table) => {
    const headers = $(table).find('th').map((__, th) => $(th).text().toLowerCase()).get();
    const looksRight = headers.some((h) => h.includes('dutiable value')) && headers.some((h) => h.trim() === 'rate');
    if (!looksRight || brackets.length > 0) return;
    $(table)
      .find('tbody tr')
      .each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length < 2) return;
        const bracket = parseRateCell($(cells[0]).text(), $(cells[1]).text());
        if (bracket) brackets.push(bracket);
      });
  });

  if (brackets.length < 3) {
    throw new Error('WA scrape: could not parse enough brackets from page');
  }
  return brackets.sort((a, b) => a.threshold - b.threshold);
}

export const waScraper: StateScraper = { state: 'WA', sourceUrl: SOURCE_URLS.WA, scrape };
