import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AustralianState, CalculatorInputs, RatesState } from '../lib/calculator';
import { ASSUMPTIONS, FALLBACK_STAMP_DUTY_BRACKETS, runCalculation } from '../lib/calculator';
import { fetchRates } from '../lib/ratesApi';
import VerdictCard from './VerdictCard';
import ResultsChart from './ResultsChart';
import NetWealthBreakdown from './NetWealthBreakdown';

const STATES: AustralianState[] = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT'];

type RatesStatus =
  | { kind: 'loading' }
  | { kind: 'loaded'; rates: RatesState }
  | { kind: 'unavailable' };

function sourceLabel(source: 'live' | 'cached-live' | 'seed') {
  switch (source) {
    case 'live':
      return 'Live';
    case 'cached-live':
      return 'Cached';
    case 'seed':
      return 'Built-in';
  }
}

function sourceBadgeClass(source: 'live' | 'cached-live' | 'seed') {
  switch (source) {
    case 'live':
      return 'bg-emerald-500/10 text-emerald-400 ring-emerald-400/20';
    case 'cached-live':
      return 'bg-sky-500/10 text-sky-400 ring-sky-400/20';
    case 'seed':
      return 'bg-slate-500/10 text-slate-400 ring-slate-400/20';
  }
}

const DEFAULT_INPUTS: CalculatorInputs = {
  propertyPrice: 800000,
  deposit: 160000,
  state: 'NSW',
  weeklyRent: 550,
  mortgageRate: 6.0,
  propertyGrowthRate: 5.0,
  rentGrowthRate: 4.0,
  investmentReturnRate: 7.0,
  years: 20,
};

const inputBaseClass =
  'w-full flex-1 rounded-md border-0 bg-transparent py-1.5 px-2.5 text-sm text-slate-100 focus:outline-none [color-scheme:dark]';
const fieldShellClass =
  'mt-1 flex h-9 items-center rounded-md border border-slate-700 bg-slate-800 transition-colors focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400/20';
const labelClass = 'text-[11px] font-semibold uppercase tracking-wide text-slate-500';
const groupLabelClass = 'text-[11px] font-semibold uppercase tracking-wide text-slate-500';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
}

function NumberField({ label, value, onChange, prefix, suffix, step = 1, min = 0 }: NumberFieldProps) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <div className={fieldShellClass}>
        {prefix && <span className="pl-2.5 text-sm text-slate-500">{prefix}</span>}
        <input
          type="number"
          className={inputBaseClass}
          value={value}
          step={step}
          min={min}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {suffix && <span className="pr-2.5 text-sm text-slate-500">{suffix}</span>}
      </div>
    </label>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm shadow-black/20">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
          {icon}
        </div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      {children}
    </section>
  );
}

const ICONS = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M3 11l9-7 9 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  key: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <circle cx="8" cy="15" r="4" />
      <path d="M10.5 12.5L20 3M17 6l2 2M14 9l2 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  trending: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 15l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-5M12 8h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  breakdown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
};

export default function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [ratesStatus, setRatesStatus] = useState<RatesStatus>({ kind: 'loading' });
  const [mortgageRateTouched, setMortgageRateTouched] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchRates()
      .then((rates) => {
        if (cancelled) return;
        setRatesStatus({ kind: 'loaded', rates });
        if (!mortgageRateTouched && rates.mortgageRate) {
          setInputs((prev) => ({ ...prev, mortgageRate: rates.mortgageRate!.rate }));
        }
      })
      .catch(() => {
        if (!cancelled) setRatesStatus({ kind: 'unavailable' });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stampDutyBrackets =
    ratesStatus.kind === 'loaded' ? ratesStatus.rates.brackets : FALLBACK_STAMP_DUTY_BRACKETS;

  const result = useMemo(
    () => runCalculation(inputs, stampDutyBrackets),
    [inputs, stampDutyBrackets],
  );

  const update = <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const depositPct = inputs.propertyPrice > 0 ? (inputs.deposit / inputs.propertyPrice) * 100 : 0;

  return (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <SectionCard icon={ICONS.home} title="Your Numbers">
          <div>
            <p className={groupLabelClass}>Property &amp; Loan</p>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <NumberField
                label="Property Price"
                value={inputs.propertyPrice}
                onChange={(v) => update('propertyPrice', v)}
                prefix="$"
                step={10000}
              />
              <NumberField
                label={`Deposit (${depositPct.toFixed(0)}%)`}
                value={inputs.deposit}
                onChange={(v) => update('deposit', v)}
                prefix="$"
                step={5000}
              />
              <label className="block">
                <span className={labelClass}>State</span>
                <div className={fieldShellClass}>
                  <select
                    className={`${inputBaseClass} cursor-pointer appearance-none`}
                    value={inputs.state}
                    onChange={(e) => update('state', e.target.value as AustralianState)}
                  >
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-2.5 h-4 w-4 shrink-0 text-slate-500"
                  >
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </label>
              <NumberField
                label={ratesStatus.kind === 'loaded' && !mortgageRateTouched ? 'Rate (live RBA)' : 'Mortgage Rate'}
                value={inputs.mortgageRate}
                onChange={(v) => {
                  setMortgageRateTouched(true);
                  update('mortgageRate', v);
                }}
                suffix="%"
                step={0.1}
              />
            </div>
          </div>

          <div className="mt-4 border-t border-slate-800 pt-4">
            <p className={groupLabelClass}>Renting</p>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <NumberField
                label="Weekly Rent"
                value={inputs.weeklyRent}
                onChange={(v) => update('weeklyRent', v)}
                prefix="$"
                step={10}
              />
              <NumberField
                label="Rent Growth"
                value={inputs.rentGrowthRate}
                onChange={(v) => update('rentGrowthRate', v)}
                suffix="%"
                step={0.1}
              />
            </div>
          </div>

          <div className="mt-4 border-t border-slate-800 pt-4">
            <p className={groupLabelClass}>Growth &amp; Return Assumptions</p>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <NumberField
                label="Property Growth"
                value={inputs.propertyGrowthRate}
                onChange={(v) => update('propertyGrowthRate', v)}
                suffix="%"
                step={0.1}
              />
              <NumberField
                label="Investment Return"
                value={inputs.investmentReturnRate}
                onChange={(v) => update('investmentReturnRate', v)}
                suffix="%"
                step={0.1}
              />
              <NumberField
                label="Time Horizon"
                value={inputs.years}
                onChange={(v) => update('years', Math.max(1, Math.round(v)))}
                suffix="yrs"
                step={1}
                min={1}
              />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <VerdictCard result={result} years={inputs.years} />
        <SectionCard icon={ICONS.chart} title="Net Wealth Over Time">
          <ResultsChart timeline={result.timeline} />
        </SectionCard>
      </div>
    </div>

    <SectionCard icon={ICONS.breakdown} title="Detailed Breakdown">
      <NetWealthBreakdown buy={result.buyBreakdown} rent={result.rentBreakdown} years={inputs.years} />
    </SectionCard>

    <details className="group rounded-2xl border border-slate-800 bg-slate-900 shadow-sm shadow-black/20">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
            {ICONS.info}
          </div>
          <h3 className="text-base font-semibold text-white">
            Assumptions baked into this calculator
          </h3>
        </div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>

      <div className="px-6 pb-6">
        <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Live data freshness
          </p>
          {ratesStatus.kind === 'loading' && (
            <p className="mt-2 text-sm text-slate-400">Checking for live rates…</p>
          )}
          {ratesStatus.kind === 'unavailable' && (
            <p className="mt-2 text-sm text-amber-400">
              Rates backend unreachable — using the built-in fallback rates baked into the app.
            </p>
          )}
          {ratesStatus.kind === 'loaded' && (
            <ul className="mt-3 space-y-2 text-sm">
              {ratesStatus.rates.mortgageRate && (
                <li className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-300">Mortgage rate (RBA)</span>
                  <span className="flex items-center gap-2 text-slate-500">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${sourceBadgeClass(ratesStatus.rates.mortgageRate.meta.source)}`}
                    >
                      {sourceLabel(ratesStatus.rates.mortgageRate.meta.source)}
                    </span>
                    {new Date(ratesStatus.rates.mortgageRate.meta.fetchedAt).toLocaleDateString('en-AU')}
                  </span>
                </li>
              )}
              {STATES.map((s) => {
                const meta = ratesStatus.rates.meta[s];
                if (!meta) return null;
                return (
                  <li key={s} className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-300">{s} stamp duty</span>
                    <span className="flex items-center gap-2 text-slate-500">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${sourceBadgeClass(meta.source)}`}
                      >
                        {sourceLabel(meta.source)}
                      </span>
                      {new Date(meta.fetchedAt).toLocaleDateString('en-AU')}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-400">
          <li>
            Stamp duty is fetched live from each state revenue office's published rate page where
            possible (see freshness table above); when a live fetch fails it falls back to the
            last successfully fetched value, or a built-in indicative rate as a last resort.
            Always confirm exact figures with your state revenue office, as concessions and
            thresholds can differ from the general rate used here.
          </li>
          <li>
            Mortgage rate defaults to the RBA's published average discounted owner-occupier
            variable rate (updated monthly) — edit it freely to model your own rate.
          </li>
          <li>
            Lenders Mortgage Insurance (LMI) applies only when LVR exceeds 80%, using an
            approximate LVR-banded premium as a % of the loan amount. Actual premiums vary by
            lender and insurer — there is no public data source for this.
          </li>
          <li>
            Property growth, rent growth and investment return are{' '}
            <strong className="font-semibold text-slate-200">
              not sourced from any data feed
            </strong>{' '}
            — they're illustrative starting assumptions for you to adjust based on your own
            view. (No suitable live source was found: ABS's residential property price index API
            returns data that stops at 2021, and forward-looking investment returns aren't
            something any data provider publishes as a "current rate.")
          </li>
          <li>Maintenance: {ASSUMPTIONS.maintenanceRatePct}% of current property value per year.</li>
          <li>
            Council rates: {formatAud(ASSUMPTIONS.councilRatesAnnual)} per year at purchase,
            indexed with property growth.
          </li>
          <li>
            Selling costs: {ASSUMPTIONS.sellingCostsPct}% of property value, deducted from the
            buyer's net wealth (agent fees, marketing, etc.).
          </li>
          <li>Mortgage: standard {ASSUMPTIONS.loanTermYears}-year principal &amp; interest loan.</li>
          <li>
            Renter invests the deposit, stamp duty and LMI the buyer would have paid upfront,
            plus the monthly difference between the buyer's mortgage/holding costs and rent, at
            the specified investment return rate.
          </li>
          <li>
            All growth rates compound annually; investment and mortgage calculations compound
            monthly.
          </li>
        </ul>
      </div>
    </details>
  </div>
  );
}

function formatAud(value: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(value);
}
