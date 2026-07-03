import * as cheerio from 'cheerio';
import type { DutyBracket, StateScraper } from './types.js';
import { SOURCE_URLS } from './seed.js';

// SRO Victoria publishes current land transfer duty rates as a plain HTML
// table with columns "Dutiable value range" / "Rate", e.g.:
//   "$0 - $25,000"           -> "1.4% of the dutiable value of the property"
//   ">$25,000 - $130,000"    -> "$350 plus 2.4% of the dutiable value in excess of $25,000"
//   ">$960,000 - $2,000,000" -> "5.5% of the dutiable value"  (flat, not marginal)
//   "More than $2,000,000"   -> "$110,000 plus 6.5% of the dutiable value in excess of $2,000,000"
function parseRateCell(rangeText: string, rateText: string): DutyBracket | null {
  const thresholdMatch = rangeText.replace(/,/g, '').match(/\$?(\d+)/);
  if (!thresholdMatch) return null;
  const threshold = rangeText.trim().startsWith('$0') ? 0 : Number(thresholdMatch[1]);

  const clean = rateText.replace(/,/g, '');

  const marginalMatch = clean.match(
    /\$?([\d.]+)\s+plus\s+([\d.]+)%\s+of\s+the\s+dutiable\s+value\s+in\s+excess\s+of\s+\$?([\d.]+)/i,
  );
  if (marginalMatch) {
    return {
      threshold: Number(marginalMatch[3]),
      base: Number(marginalMatch[1]),
      rate: Number(marginalMatch[2]) / 100,
    };
  }

  const flatMatch = clean.match(/^([\d.]+)%\s+of\s+the\s+dutiable\s+value/i);
  if (flatMatch) {
    return { threshold, base: 0, rate: Number(flatMatch[1]) / 100, flatOnTotal: threshold > 0 };
  }

  return null;
}

async function scrape(): Promise<DutyBracket[]> {
  const res = await fetch(SOURCE_URLS.VIC, {
    headers: { 'User-Agent': 'Mozilla/5.0 (rent-vs-buy-calculator rate sync)' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`VIC scrape failed: HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const brackets: DutyBracket[] = [];
  $('table').each((_, table) => {
    const headerText = $(table).find('th').text().toLowerCase();
    if (!headerText.includes('dutiable value') || brackets.length > 0) return;
    $(table)
      .find('tbody tr')
      .each((_, row) => {
        const rangeCell = $(row).find('th');
        const rateCell = $(row).find('td');
        if (rangeCell.length === 0 || rateCell.length === 0) return;
        const bracket = parseRateCell(rangeCell.text(), rateCell.text());
        if (bracket) brackets.push(bracket);
      });
  });

  if (brackets.length < 3) {
    throw new Error('VIC scrape: could not parse enough brackets from page');
  }
  return brackets.sort((a, b) => a.threshold - b.threshold);
}

export const vicScraper: StateScraper = { state: 'VIC', sourceUrl: SOURCE_URLS.VIC, scrape };
