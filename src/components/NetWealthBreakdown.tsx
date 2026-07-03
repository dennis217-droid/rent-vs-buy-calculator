import type { BuyBreakdown, RentBreakdown } from '../lib/calculator';
import { formatCurrency } from '../lib/calculator';

interface NetWealthBreakdownProps {
  buy: BuyBreakdown;
  rent: RentBreakdown;
  years: number;
}

interface Row {
  label: string;
  value: number;
  sign?: 'positive' | 'negative';
  emphasis?: boolean;
  indent?: boolean;
}

function BreakdownColumn({
  title,
  accentClass,
  rows,
  totalLabel,
  totalValue,
}: {
  title: string;
  accentClass: string;
  rows: Row[];
  totalLabel: string;
  totalValue: number;
}) {
  return (
    <div>
      <h4 className={`text-sm font-semibold ${accentClass}`}>{title}</h4>
      <dl className="mt-3 space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex items-baseline justify-between gap-3 text-sm ${row.indent ? 'pl-3' : ''}`}
          >
            <dt className="text-slate-400">{row.label}</dt>
            <dd
              className={`shrink-0 font-medium tabular-nums ${
                row.sign === 'negative'
                  ? 'text-rose-400'
                  : row.sign === 'positive'
                    ? 'text-emerald-400'
                    : 'text-slate-200'
              }`}
            >
              {row.sign === 'negative' && '−'}
              {row.sign === 'positive' && '+'}
              {formatCurrency(Math.abs(row.value))}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-slate-800 pt-3">
        <dt className="text-sm font-semibold text-white">{totalLabel}</dt>
        <dd className={`text-base font-bold tabular-nums ${accentClass}`}>
          {formatCurrency(totalValue)}
        </dd>
      </div>
    </div>
  );
}

export default function NetWealthBreakdown({ buy, rent, years }: NetWealthBreakdownProps) {
  const buyRows: Row[] = [
    { label: 'Final property value', value: buy.finalPropertyValue },
    { label: `Capital growth over ${years}yr`, value: buy.propertyCapitalGrowth, sign: 'positive', indent: true },
    { label: 'Remaining loan balance', value: buy.remainingLoanBalance, sign: 'negative' },
    { label: 'Selling costs (2.2%)', value: buy.sellingCosts, sign: 'negative' },
  ];

  const rentRows: Row[] = [
    { label: 'Initial investment (upfront cash)', value: rent.initialInvestment },
    { label: 'Ongoing contributions invested', value: rent.totalContributions },
    { label: 'Investment growth', value: rent.investmentGrowth, sign: 'positive' },
  ];

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      <BreakdownColumn
        title="Buy: how the equity builds up"
        accentClass="text-indigo-400"
        rows={buyRows}
        totalLabel="Net Wealth"
        totalValue={buy.netWealth}
      />
      <BreakdownColumn
        title="Rent & Invest: how the portfolio builds up"
        accentClass="text-emerald-400"
        rows={rentRows}
        totalLabel="Net Wealth"
        totalValue={rent.netWealth}
      />

      <div className="border-t border-slate-800 pt-4 sm:col-span-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Cumulative cash paid over {years} years
        </h4>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500">Mortgage interest</p>
            <p className="mt-0.5 font-semibold text-slate-200">{formatCurrency(buy.totalInterestPaid)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Mortgage principal</p>
            <p className="mt-0.5 font-semibold text-slate-200">{formatCurrency(buy.totalPrincipalRepaid)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Maintenance</p>
            <p className="mt-0.5 font-semibold text-slate-200">{formatCurrency(buy.totalMaintenancePaid)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Council rates</p>
            <p className="mt-0.5 font-semibold text-slate-200">{formatCurrency(buy.totalCouncilRatesPaid)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total rent paid</p>
            <p className="mt-0.5 font-semibold text-slate-200">{formatCurrency(rent.totalRentPaid)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Upfront: deposit</p>
            <p className="mt-0.5 font-semibold text-slate-200">{formatCurrency(buy.deposit)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Upfront: stamp duty</p>
            <p className="mt-0.5 font-semibold text-slate-200">{formatCurrency(buy.stampDuty)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Upfront: LMI</p>
            <p className="mt-0.5 font-semibold text-slate-200">{formatCurrency(buy.lmi)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
