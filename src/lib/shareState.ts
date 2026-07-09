import type { AustralianState, CalculatorInputs } from './calculator';

const PARAM_KEYS: Record<keyof CalculatorInputs, string> = {
  propertyPrice: 'price',
  deposit: 'dep',
  state: 'st',
  weeklyRent: 'rent',
  mortgageRate: 'rate',
  propertyGrowthRate: 'pg',
  rentGrowthRate: 'rg',
  investmentReturnRate: 'ir',
  years: 'yrs',
};

const VALID_STATES: AustralianState[] = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT'];

export function inputsToSearchParams(inputs: CalculatorInputs): URLSearchParams {
  const params = new URLSearchParams();
  (Object.keys(PARAM_KEYS) as (keyof CalculatorInputs)[]).forEach((key) => {
    params.set(PARAM_KEYS[key], String(inputs[key]));
  });
  return params;
}

export function hasShareParams(params: URLSearchParams): boolean {
  return params.has(PARAM_KEYS.propertyPrice);
}

export function searchParamsToInputs(params: URLSearchParams, fallback: CalculatorInputs): CalculatorInputs {
  const num = (key: string, current: number): number => {
    const raw = params.get(key);
    if (raw === null) return current;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : current;
  };

  const stateRaw = params.get(PARAM_KEYS.state);
  const state = VALID_STATES.includes(stateRaw as AustralianState) ? (stateRaw as AustralianState) : fallback.state;

  return {
    propertyPrice: num(PARAM_KEYS.propertyPrice, fallback.propertyPrice),
    deposit: num(PARAM_KEYS.deposit, fallback.deposit),
    state,
    weeklyRent: num(PARAM_KEYS.weeklyRent, fallback.weeklyRent),
    mortgageRate: num(PARAM_KEYS.mortgageRate, fallback.mortgageRate),
    propertyGrowthRate: num(PARAM_KEYS.propertyGrowthRate, fallback.propertyGrowthRate),
    rentGrowthRate: num(PARAM_KEYS.rentGrowthRate, fallback.rentGrowthRate),
    investmentReturnRate: num(PARAM_KEYS.investmentReturnRate, fallback.investmentReturnRate),
    years: num(PARAM_KEYS.years, fallback.years),
  };
}
