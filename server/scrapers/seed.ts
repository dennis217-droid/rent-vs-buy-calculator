import type { AustralianState, DutyBracket } from './types.js';

// Ultimate fallback rates — the same indicative 2024/25 general owner-occupier
// figures the app originally shipped with. Used when the cache file doesn't
// exist yet and a live scrape hasn't succeeded for a state.
export const SEED_BRACKETS: Record<AustralianState, DutyBracket[]> = {
  NSW: [
    { threshold: 0, base: 0, rate: 0.0125 },
    { threshold: 17000, base: 212, rate: 0.015 },
    { threshold: 37000, base: 512, rate: 0.0175 },
    { threshold: 97000, base: 1562, rate: 0.035 },
    { threshold: 364000, base: 10912, rate: 0.045 },
    { threshold: 1212000, base: 49036, rate: 0.055 },
    { threshold: 3636000, base: 182362, rate: 0.07 },
  ],
  VIC: [
    { threshold: 0, base: 0, rate: 0.014 },
    { threshold: 25000, base: 350, rate: 0.024 },
    { threshold: 130000, base: 2870, rate: 0.06 },
    { threshold: 960000, base: 0, rate: 0.055, flatOnTotal: true },
    { threshold: 2000000, base: 110000, rate: 0.065 },
  ],
  QLD: [
    { threshold: 0, base: 0, rate: 0 },
    { threshold: 5000, base: 0, rate: 0.015 },
    { threshold: 75000, base: 1050, rate: 0.035 },
    { threshold: 540000, base: 17325, rate: 0.045 },
    { threshold: 1000000, base: 38025, rate: 0.0575 },
  ],
  WA: [
    { threshold: 0, base: 0, rate: 0.019 },
    { threshold: 120000, base: 2280, rate: 0.0285 },
    { threshold: 150000, base: 3135, rate: 0.038 },
    { threshold: 360000, base: 11115, rate: 0.0475 },
    { threshold: 725000, base: 28453, rate: 0.0515 },
  ],
  SA: [
    { threshold: 0, base: 0, rate: 0.01 },
    { threshold: 12000, base: 120, rate: 0.02 },
    { threshold: 30000, base: 480, rate: 0.03 },
    { threshold: 50000, base: 1080, rate: 0.035 },
    { threshold: 100000, base: 2830, rate: 0.04 },
    { threshold: 200000, base: 6830, rate: 0.0425 },
    { threshold: 250000, base: 8955, rate: 0.0475 },
    { threshold: 300000, base: 11330, rate: 0.05 },
    { threshold: 500000, base: 21330, rate: 0.055 },
  ],
  ACT: [
    { threshold: 0, base: 0, rate: 0.0028 },
    { threshold: 260000, base: 728, rate: 0.022 },
    { threshold: 300000, base: 1608, rate: 0.034 },
    { threshold: 500000, base: 8408, rate: 0.0432 },
    { threshold: 750000, base: 19208, rate: 0.059 },
    { threshold: 1000000, base: 33958, rate: 0.064 },
    { threshold: 1455000, base: 0, rate: 0.0454, flatOnTotal: true },
  ],
};

export const SOURCE_URLS: Record<AustralianState, string> = {
  NSW: 'https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/transfer-duty/understanding-transfer-duty/calculate-transfer-duty',
  VIC: 'https://www.sro.vic.gov.au/about-us/rates-and-statistics/current-rates/land-transfer-duty-non-principal-place-residence-current-rates',
  QLD: 'https://qro.qld.gov.au/duties/transfer-duty/calculating/rates/',
  WA: 'https://www.wa.gov.au/organisation/department-of-treasury-and-finance/transfer-duty-assessment',
  SA: 'https://www.revenuesa.sa.gov.au/stamp-duty-land/calculate-stamp-duty',
  ACT: 'https://www.revenue.act.gov.au/rates-and-property-charges/conveyance-duty-stamp-duty/conveyance-duty-for-non-commercial-property',
};

// RBA F5 "Housing loans; Banks; Variable; Discounted; Owner-occupier" —
// their published proxy for the average rate actually paid, as opposed to
// the higher advertised/standard rate.
export const SEED_MORTGAGE_RATE = 6.3;
export const MORTGAGE_RATE_SOURCE_URL = 'https://www.rba.gov.au/statistics/tables/csv/f5-data.csv';
