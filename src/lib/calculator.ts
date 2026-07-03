export type AustralianState = 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'ACT';

export interface CalculatorInputs {
  propertyPrice: number;
  deposit: number;
  state: AustralianState;
  weeklyRent: number;
  mortgageRate: number; // annual %, e.g. 6.0
  propertyGrowthRate: number; // annual %
  rentGrowthRate: number; // annual %
  investmentReturnRate: number; // annual %
  years: number;
}

export interface YearSnapshot {
  year: number;
  buyerNetWealth: number;
  renterNetWealth: number;
  buyerPropertyValue: number;
  buyerLoanBalance: number;
  renterInvestmentBalance: number;
  annualRent: number;
}

export interface BuyBreakdown {
  deposit: number;
  stampDuty: number;
  lmi: number;
  upfrontCosts: number;
  finalPropertyValue: number;
  propertyCapitalGrowth: number;
  remainingLoanBalance: number;
  totalPrincipalRepaid: number;
  totalInterestPaid: number;
  totalMortgagePayments: number;
  totalMaintenancePaid: number;
  totalCouncilRatesPaid: number;
  sellingCosts: number;
  netWealth: number;
}

export interface RentBreakdown {
  initialInvestment: number;
  totalContributions: number;
  totalRentPaid: number;
  investmentGrowth: number;
  finalBalance: number;
  netWealth: number;
}

export interface CalculationResult {
  stampDuty: number;
  lmi: number;
  loanAmount: number;
  lvr: number;
  upfrontBuyerCash: number;
  monthlyMortgagePayment: number;
  timeline: YearSnapshot[];
  finalBuyerNetWealth: number;
  finalRenterNetWealth: number;
  verdict: 'buy' | 'rent';
  differenceAmount: number;
  buyBreakdown: BuyBreakdown;
  rentBreakdown: RentBreakdown;
}

export const ASSUMPTIONS = {
  maintenanceRatePct: 1.2, // % of current property value p.a.
  councilRatesAnnual: 1800, // $ p.a. at purchase, indexed with property growth
  sellingCostsPct: 2.2, // % of property value, deducted from buyer net wealth
  loanTermYears: 30, // standard P&I mortgage term
};

// --- Stamp duty ---------------------------------------------------------
// Progressive transfer duty brackets per state, indicative 2024/25 general
// (non first-home-buyer, non-concession) owner-occupier rates. Each bracket
// gives the base duty owed at the threshold plus the marginal rate applied
// to the amount of the price above that threshold, up to the next bracket.

export interface DutyBracket {
  threshold: number;
  base: number;
  rate: number; // marginal rate, e.g. 0.035 for $3.50 per $100
  flatOnTotal?: boolean; // if true, duty = rate * price (not marginal) while in this bracket
}

export type RateSource = 'live' | 'cached-live' | 'seed';

export interface RateMeta {
  source: RateSource;
  sourceUrl: string;
  fetchedAt: string;
}

export interface RatesState {
  brackets: Record<AustralianState, DutyBracket[]>;
  meta: Partial<Record<AustralianState, RateMeta>>;
  mortgageRate: { rate: number; meta: RateMeta } | null;
}

// Ultimate client-side fallback for the mortgage rate default, used only if
// the rates backend is entirely unreachable. Mirrors server/scrapers/seed.ts.
export const FALLBACK_MORTGAGE_RATE = 6.3;

function dutyFromBrackets(price: number, brackets: DutyBracket[]): number {
  let bracket = brackets[0];
  for (const b of brackets) {
    if (price >= b.threshold) bracket = b;
    else break;
  }
  if (bracket.flatOnTotal) {
    return Math.max(price * bracket.rate, 0);
  }
  const duty = bracket.base + (price - bracket.threshold) * bracket.rate;
  return Math.max(duty, 0);
}

// Ultimate client-side fallback, used only if the rates backend is entirely
// unreachable (e.g. dev server not started). Mirrors server/scrapers/seed.ts.
export const FALLBACK_STAMP_DUTY_BRACKETS: Record<AustralianState, DutyBracket[]> = {
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

export function calculateStampDuty(
  price: number,
  state: AustralianState,
  brackets: Record<AustralianState, DutyBracket[]> = FALLBACK_STAMP_DUTY_BRACKETS,
): number {
  if (price <= 0) return 0;
  return Math.round(dutyFromBrackets(price, brackets[state]));
}

// --- Lenders Mortgage Insurance -----------------------------------------
// Simplified LVR-banded premium, approximating typical indicative insurer
// rate cards. Applied as a % of the loan amount. Real premiums vary by
// lender, insurer, and loan size.

interface LmiBand {
  maxLvr: number;
  rate: number;
}

const LMI_BANDS: LmiBand[] = [
  { maxLvr: 0.85, rate: 0.01 },
  { maxLvr: 0.9, rate: 0.018 },
  { maxLvr: 0.95, rate: 0.031 },
  { maxLvr: 1.01, rate: 0.042 },
];

export function calculateLMI(loanAmount: number, propertyPrice: number): number {
  if (propertyPrice <= 0) return 0;
  const lvr = loanAmount / propertyPrice;
  if (lvr <= 0.8) return 0;
  const band = LMI_BANDS.find((b) => lvr <= b.maxLvr) ?? LMI_BANDS[LMI_BANDS.length - 1];
  return Math.round(loanAmount * band.rate);
}

// --- Mortgage amortization -----------------------------------------------

function monthlyMortgagePayment(loanAmount: number, annualRatePct: number, termYears: number): number {
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (loanAmount <= 0) return 0;
  if (r === 0) return loanAmount / n;
  return (loanAmount * r) / (1 - Math.pow(1 + r, -n));
}

// --- Core model ------------------------------------------------------------

export function runCalculation(
  inputs: CalculatorInputs,
  stampDutyBrackets: Record<AustralianState, DutyBracket[]> = FALLBACK_STAMP_DUTY_BRACKETS,
): CalculationResult {
  const {
    propertyPrice,
    deposit,
    state,
    weeklyRent,
    mortgageRate,
    propertyGrowthRate,
    rentGrowthRate,
    investmentReturnRate,
    years,
  } = inputs;

  const loanAmount = Math.max(propertyPrice - deposit, 0);
  const lvr = propertyPrice > 0 ? loanAmount / propertyPrice : 0;
  const stampDuty = calculateStampDuty(propertyPrice, state, stampDutyBrackets);
  const lmi = calculateLMI(loanAmount, propertyPrice);
  const upfrontBuyerCash = deposit + stampDuty + lmi;

  const payment = monthlyMortgagePayment(loanAmount, mortgageRate, ASSUMPTIONS.loanTermYears);
  const monthlyRate = mortgageRate / 100 / 12;
  const investmentMonthlyRate = investmentReturnRate / 100 / 12;

  const timeline: YearSnapshot[] = [];

  let propertyValue = propertyPrice;
  let loanBalance = loanAmount;
  let renterInvestmentBalance = upfrontBuyerCash;
  let currentAnnualRent = weeklyRent * 52;

  let totalInterestPaid = 0;
  let totalMaintenancePaid = 0;
  let totalCouncilRatesPaid = 0;
  let totalRentPaid = 0;
  let totalContributions = 0;

  timeline.push({
    year: 0,
    buyerNetWealth: propertyValue - loanBalance - (ASSUMPTIONS.sellingCostsPct / 100) * propertyValue,
    renterNetWealth: renterInvestmentBalance,
    buyerPropertyValue: propertyValue,
    buyerLoanBalance: loanBalance,
    renterInvestmentBalance,
    annualRent: currentAnnualRent,
  });

  for (let year = 1; year <= years; year++) {
    propertyValue *= 1 + propertyGrowthRate / 100;
    const maintenanceAnnual = (ASSUMPTIONS.maintenanceRatePct / 100) * propertyValue;
    const councilRatesAnnual =
      ASSUMPTIONS.councilRatesAnnual * Math.pow(1 + propertyGrowthRate / 100, year);
    const maintenanceMonthly = maintenanceAnnual / 12;
    const councilRatesMonthly = councilRatesAnnual / 12;

    for (let m = 0; m < 12; m++) {
      const interestPortion = loanBalance * monthlyRate;
      const principalPortion = Math.min(payment - interestPortion, loanBalance);
      loanBalance = Math.max(loanBalance - principalPortion, 0);
      totalInterestPaid += interestPortion;
      totalMaintenancePaid += maintenanceMonthly;
      totalCouncilRatesPaid += councilRatesMonthly;

      const monthlyRent = currentAnnualRent / 12;
      totalRentPaid += monthlyRent;
      const buyerMonthlyCash = payment + maintenanceMonthly + councilRatesMonthly;
      const contribution = Math.max(buyerMonthlyCash - monthlyRent, 0);
      totalContributions += contribution;

      renterInvestmentBalance =
        renterInvestmentBalance * (1 + investmentMonthlyRate) + contribution;
    }

    currentAnnualRent *= 1 + rentGrowthRate / 100;

    const buyerNetWealth =
      propertyValue - loanBalance - (ASSUMPTIONS.sellingCostsPct / 100) * propertyValue;

    timeline.push({
      year,
      buyerNetWealth,
      renterNetWealth: renterInvestmentBalance,
      buyerPropertyValue: propertyValue,
      buyerLoanBalance: loanBalance,
      renterInvestmentBalance,
      annualRent: currentAnnualRent,
    });
  }

  const final = timeline[timeline.length - 1];
  const verdict: 'buy' | 'rent' = final.buyerNetWealth >= final.renterNetWealth ? 'buy' : 'rent';
  const differenceAmount = Math.abs(final.buyerNetWealth - final.renterNetWealth);

  const sellingCosts = (ASSUMPTIONS.sellingCostsPct / 100) * final.buyerPropertyValue;
  const totalPrincipalRepaid = loanAmount - final.buyerLoanBalance;

  const buyBreakdown: BuyBreakdown = {
    deposit,
    stampDuty,
    lmi,
    upfrontCosts: upfrontBuyerCash,
    finalPropertyValue: final.buyerPropertyValue,
    propertyCapitalGrowth: final.buyerPropertyValue - propertyPrice,
    remainingLoanBalance: final.buyerLoanBalance,
    totalPrincipalRepaid,
    totalInterestPaid,
    totalMortgagePayments: totalInterestPaid + totalPrincipalRepaid,
    totalMaintenancePaid,
    totalCouncilRatesPaid,
    sellingCosts,
    netWealth: final.buyerNetWealth,
  };

  const rentBreakdown: RentBreakdown = {
    initialInvestment: upfrontBuyerCash,
    totalContributions,
    totalRentPaid,
    investmentGrowth: final.renterInvestmentBalance - upfrontBuyerCash - totalContributions,
    finalBalance: final.renterInvestmentBalance,
    netWealth: final.renterNetWealth,
  };

  return {
    stampDuty,
    lmi,
    loanAmount,
    lvr,
    upfrontBuyerCash,
    monthlyMortgagePayment: payment,
    timeline,
    finalBuyerNetWealth: final.buyerNetWealth,
    finalRenterNetWealth: final.renterNetWealth,
    verdict,
    differenceAmount,
    buyBreakdown,
    rentBreakdown,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(value);
}
