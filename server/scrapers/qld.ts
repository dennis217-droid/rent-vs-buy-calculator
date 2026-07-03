import * as cheerio from 'cheerio';
import type { DutyBracket, StateScraper } from './types.js';
import { SOURCE_URLS } from './seed.js';

// Queensland Revenue Office publishes rates as a definition-list style
// breakdown, e.g. "$1,050 plus $3.50 for each $100, or part of $100, over
// $75,000". The first (nil) bracket has no "plus" clause.
const MARGINAL_RE =
  /\$?([\d,.]+)\s*plus\s*\$?([\d.]+)\s*(?:for each|per)\s*\$100.{0,30}?over\s*\$?([\d,]+)/gi;

function parseText(text: string): DutyBracket[] {
  const clean = text.replace(/,/g, '');
  const brackets: DutyBracket[] = [];

  if (/not more than \$?5000.{0,20}nil/i.test(clean)) {
    brackets.push({ threshold: 0, base: 0, rate: 0 });
  }
  const firstRate = clean.match(/\$?([\d.]+)\s*(?:for each|per)\s*\$100.{0,30}?over\s*\$?5000/i);
  if (firstRate) {
    brackets.push({ threshold: 5000, base: 0, rate: Number(firstRate[1]) / 100 });
  }

  let match: RegExpExecArray | null;
  while ((match = MARGINAL_RE.exec(clean)) !== null) {
    brackets.push({
      threshold: Number(match[3]),
      base: Number(match[1]),
      rate: Number(match[2]) / 100,
    });
  }
  return brackets;
}

async function scrape(): Promise<DutyBracket[]> {
  const res = await fetch(SOURCE_URLS.QLD, {
    headers: { 'User-Agent': 'Mozilla/5.0 (rent-vs-buy-calculator rate sync)' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`QLD scrape failed: HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const bodyText = $('main').text() || $('body').text();

  const brackets = parseText(bodyText);
  if (brackets.length < 3) {
    throw new Error('QLD scrape: could not parse enough brackets from page');
  }
  return brackets
    .filter((b, i, arr) => arr.findIndex((x) => x.threshold === b.threshold) === i)
    .sort((a, b) => a.threshold - b.threshold);
}

export const qldScraper: StateScraper = { state: 'QLD', sourceUrl: SOURCE_URLS.QLD, scrape };
