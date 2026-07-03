import * as cheerio from 'cheerio';
import type { DutyBracket, StateScraper } from './types.js';
import { SOURCE_URLS } from './seed.js';

// ACT Revenue Office publishes owner-occupier conveyance duty rates as an
// HTML table (id starting "table...") titled "Table 1 Eligible owner
// occupier transaction", e.g.:
//   "Up to $260 000"          -> "$0.28 per $100 or part of thereof up to $260,000"
//   "$260 001 to $300 000"    -> "$728 plus $2.20 per $100 or part thereof by which the value exceeds $260,000"
//   "More than $1 455 000"    -> "A flat rate of $4.54 per $100 applied to the total transaction value"
// Numbers use a mix of commas and non-breaking spaces as thousands separators.
function normalizeNumber(text: string): string {
  return text.replace(/[, \s]/g, '');
}

function parseRateCell(rangeText: string, rateText: string): DutyBracket | null {
  const rangeClean = normalizeNumber(rangeText).trim();
  const rateClean = normalizeNumber(rateText).trim();
  const isFirstBand = /^upto/i.test(rangeClean);

  const flatMatch = rateClean.match(/flatrateof\$?([\d.]+)per\$100/i);
  if (flatMatch) {
    const thresholdMatch = rangeClean.match(/\$?(\d+)/);
    return {
      threshold: thresholdMatch ? Number(thresholdMatch[1]) : 0,
      base: 0,
      rate: Number(flatMatch[1]) / 100,
      flatOnTotal: true,
    };
  }

  const marginalMatch = rateClean.match(/\$?([\d.]+)plus\$?([\d.]+)per\$100.{0,60}?exceeds\$?([\d.]+)/i);
  if (marginalMatch) {
    return {
      threshold: Number(marginalMatch[3]),
      base: Number(marginalMatch[1]),
      rate: Number(marginalMatch[2]) / 100,
    };
  }

  if (isFirstBand) {
    const firstBandMatch = rateClean.match(/\$?([\d.]+)per\$100/i);
    if (firstBandMatch) {
      return { threshold: 0, base: 0, rate: Number(firstBandMatch[1]) / 100 };
    }
  }

  return null;
}

async function scrape(): Promise<DutyBracket[]> {
  const res = await fetch(SOURCE_URLS.ACT, {
    headers: { 'User-Agent': 'Mozilla/5.0 (rent-vs-buy-calculator rate sync)' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`ACT scrape failed: HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const brackets: DutyBracket[] = [];
  $('table').each((_, table) => {
    const headerText = $(table).find('th').text().toLowerCase();
    if (!headerText.includes('owner occupier') || brackets.length > 0) return;
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
    throw new Error('ACT scrape: could not parse enough brackets from page');
  }
  return brackets.sort((a, b) => a.threshold - b.threshold);
}

export const actScraper: StateScraper = { state: 'ACT', sourceUrl: SOURCE_URLS.ACT, scrape };
