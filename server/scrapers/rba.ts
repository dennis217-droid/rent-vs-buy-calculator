import { MORTGAGE_RATE_SOURCE_URL } from './seed.js';

// RBA publishes table F5 (Indicator Lending Rates) as an open CSV, no key
// required. Header rows are Title/Description/Frequency/Type/Units/Source/
// Publication date/Series ID, then one row per month with the date first
// followed by each series in a fixed column order matching the header. The
// "Housing loans; Banks; Variable; Discounted; Owner-occupier" series
// (FILRHLBVD) is column index 4 (1-indexed, i.e. index 4 after the date).
const TARGET_SERIES_ID = 'FILRHLBVD';

export async function scrapeMortgageRate(): Promise<number> {
  const res = await fetch(MORTGAGE_RATE_SOURCE_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (rent-vs-buy-calculator rate sync)' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`RBA scrape failed: HTTP ${res.status}`);
  const csv = await res.text();
  const lines = csv.split('\n').map((l) => l.trim()).filter(Boolean);

  const seriesIdLine = lines.find((l) => l.startsWith('Series ID'));
  if (!seriesIdLine) throw new Error('RBA scrape: could not find Series ID row');
  const seriesIds = seriesIdLine.split(',').map((s) => s.trim());
  const colIndex = seriesIds.indexOf(TARGET_SERIES_ID);
  if (colIndex === -1) throw new Error('RBA scrape: target series not found in header');

  const dataLines = lines.filter((l) => /^\d{2}\/\d{2}\/\d{4},/.test(l));
  if (dataLines.length === 0) throw new Error('RBA scrape: no data rows found');

  for (let i = dataLines.length - 1; i >= 0; i--) {
    const cols = dataLines[i].split(',');
    const value = cols[colIndex]?.trim();
    if (value) {
      const rate = Number(value);
      if (!Number.isNaN(rate)) return rate;
    }
  }
  throw new Error('RBA scrape: no recent non-empty value found for target series');
}
