import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { YearSnapshot } from '../lib/calculator';
import { formatCurrency } from '../lib/calculator';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

interface ResultsChartProps {
  timeline: YearSnapshot[];
}

export default function ResultsChart({ timeline }: ResultsChartProps) {
  const data = {
    labels: timeline.map((t) => `Yr ${t.year}`),
    datasets: [
      {
        label: 'Buy: Net Wealth',
        data: timeline.map((t) => Math.round(t.buyerNetWealth)),
        borderColor: '#818cf8',
        backgroundColor: 'rgba(129, 140, 248, 0.1)',
        pointBackgroundColor: '#818cf8',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2.5,
      },
      {
        label: 'Rent & Invest: Net Wealth',
        data: timeline.map((t) => Math.round(t.renterNetWealth)),
        borderColor: '#34d399',
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        pointBackgroundColor: '#34d399',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
          padding: 16,
          font: { size: 12, weight: 600 as const },
          color: '#cbd5e1',
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        titleFont: { size: 12, weight: 600 as const },
        bodyFont: { size: 12 },
        callbacks: {
          label: (ctx: TooltipItem<'line'>) =>
            `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 11 } },
      },
      y: {
        grid: { color: '#1e293b' },
        border: { display: false },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          callback: (value: string | number) => formatCurrency(Number(value)),
        },
      },
    },
  };

  return (
    <div className="h-72 w-full sm:h-96">
      <Line data={data} options={options} />
    </div>
  );
}
