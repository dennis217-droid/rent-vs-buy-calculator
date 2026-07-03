import * as cheerio from 'cheerio';
import type { AustralianState, DutyBracket } from './types.js';

// Best-effort generic parser for state pages whose exact markup wasn't
// confirmed during research (WA, SA, ACT). Looks for the common
// "$<base> plus $<rate> per $100 ... over $<threshold>" phrasing that most
// revenue offices use, plus a zero-threshold flat/first-band rate. Expected
// to fail more often than the NSW/QLD/VIC scrapers — the cache/seed fallback
// is the primary safety net for these three states, not this parser.
const MARGINAL_RE =
  /\$?([\d,.]+)\s*plus\s*\$?([\d.]+)\s*(?:cents\s*)?(?:for each|per)\s*\$100.{0,30}?(?:over|exceeding)\s*\$?([\d,]+)/gi;
const FIRST_BAND_RE = /\$?([\d.]+)\s*(?:cents\s*)?(?:for each|per)\s*\$100.{0,10}?\bup to\b.{0,20}?\$?([\d,]+)/i;
const FLAT_PCT_RE = /^([\d.]+)%\s*of\s*(?:the\s*)?(?:dutiable|total)\s*value/i;

export async function scrapeGenericMarginalPage(state: AustralianState, url: string): Promise<DutyBracket[]> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (rent-vs-buy-calculator rate sync)' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`${state} scrape failed: HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const text = ($('main').text() || $('body').text()).replace(/,/g, '');

  const brackets: DutyBracket[] = [];

  const firstBand = text.match(FIRST_BAND_RE);
  if (firstBand) {
    brackets.push({ threshold: 0, base: 0, rate: Number(firstBand[1]) / 100 });
  }

  const flat = text.match(FLAT_PCT_RE);
  if (flat && brackets.length === 0) {
    brackets.push({ threshold: 0, base: 0, rate: Number(flat[1]) / 100 });
  }

  let match: RegExpExecArray | null;
  while ((match = MARGINAL_RE.exec(text)) !== null) {
    brackets.push({
      threshold: Number(match[3]),
      base: Number(match[1]),
      rate: Number(match[2]) / 100,
    });
  }

  const deduped = brackets
    .filter((b, i, arr) => arr.findIndex((x) => x.threshold === b.threshold) === i)
    .sort((a, b) => a.threshold - b.threshold);

  if (deduped.length < 3) {
    throw new Error(`${state} scrape: could not parse enough brackets from page`);
  }
  return deduped;
}
