import * as cheerio from 'cheerio';
import type { DutyBracket, StateScraper } from './types.js';
import { SOURCE_URLS } from './seed.js';

// Revenue NSW publishes rates as an HTML table with columns "Thresholds for
// dutiable value" / "Transfer duty rates", e.g.:
//   "$0 to $18,000"          -> "$1.25 for every $100 (minimum $20)"
//   "$18,001 to $38,000"     -> "$225 plus $1.50 for every $100 over $18,000"
//   "Over $1,290,000"        -> "$52,237 plus $5.50 for every $100 over $1,290,000"
// Thresholds are CPI-indexed annually, so exact values change each financial year.
function parseRateCell(rangeText: string, rateText: string): DutyBracket | null {
  const rangeClean = rangeText.replace(/,/g, '').trim();
  const rateClean = rateText.replace(/,/g, '').trim();

  const isFirstBand = /^\$?0\b/.test(rangeClean);

  const marginalMatch = rateClean.match(
    /\$?([\d.]+)\s+plus\s+\$?([\d.]+)\s+for every\s+\$100\s+over\s+\$?([\d.]+)/i,
  );
  if (marginalMatch) {
    return {
      threshold: Number(marginalMatch[3]),
      base: Number(marginalMatch[1]),
      rate: Number(marginalMatch[2]) / 100,
    };
  }

  if (isFirstBand) {
    const firstBandMatch = rateClean.match(/\$?([\d.]+)\s+for every\s+\$100/i);
    if (firstBandMatch) {
      return { threshold: 0, base: 0, rate: Number(firstBandMatch[1]) / 100 };
    }
  }

  return null;
}

async function scrape(): Promise<DutyBracket[]> {
  const res = await fetch(SOURCE_URLS.NSW, {
    headers: { 'User-Agent': 'Mozilla/5.0 (rent-vs-buy-calculator rate sync)' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`NSW scrape failed: HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const brackets: DutyBracket[] = [];
  $('table').each((_, table) => {
    const headerText = $(table).find('th').text().toLowerCase();
    if (!headerText.includes('threshold') || brackets.length > 0) return;
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
    throw new Error('NSW scrape: could not parse enough brackets from page');
  }
  return brackets.sort((a, b) => a.threshold - b.threshold);
}

export const nswScraper: StateScraper = { state: 'NSW', sourceUrl: SOURCE_URLS.NSW, scrape };
