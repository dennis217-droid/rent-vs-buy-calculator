import type { CalculationResult } from '../lib/calculator';
import { formatCurrency } from '../lib/calculator';

interface VerdictCardProps {
  result: CalculationResult;
  years: number;
}

export default function VerdictCard({ result, years }: VerdictCardProps) {
  const isBuy = result.verdict === 'buy';
  const accent = isBuy
    ? { bar: 'bg-indigo-500', pill: 'bg-indigo-500/10 text-indigo-400 ring-indigo-400/20', text: 'text-indigo-400' }
    : { bar: 'bg-emerald-500', pill: 'bg-emerald-500/10 text-emerald-400 ring-emerald-400/20', text: 'text-emerald-400' };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm shadow-black/20">
      <div className={`h-1.5 w-full ${accent.bar}`} />
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${accent.pill}`}
          >
            After {years} years
          </span>
        </div>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
          {isBuy ? 'Buying' : 'Renting & Investing'} comes out ahead
        </h2>
        <p className="mt-1 text-base text-slate-400">
          by <span className={`font-semibold ${accent.text}`}>{formatCurrency(result.differenceAmount)}</span>
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-800/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Buy: Net Wealth</p>
            <p className="mt-1 text-lg font-bold text-indigo-400">
              {formatCurrency(result.finalBuyerNetWealth)}
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Rent &amp; Invest: Net Wealth
            </p>
            <p className="mt-1 text-lg font-bold text-emerald-400">
              {formatCurrency(result.finalRenterNetWealth)}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-slate-800 pt-5 sm:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Stamp Duty</p>
            <p className="mt-0.5 font-semibold text-slate-200">{formatCurrency(result.stampDuty)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">LMI</p>
            <p className="mt-0.5 font-semibold text-slate-200">{formatCurrency(result.lmi)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">LVR</p>
            <p className="mt-0.5 font-semibold text-slate-200">{(result.lvr * 100).toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Monthly Repayment</p>
            <p className="mt-0.5 font-semibold text-slate-200">
              {formatCurrency(result.monthlyMortgagePayment)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
