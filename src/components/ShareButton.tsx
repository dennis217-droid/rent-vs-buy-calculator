import { useState } from 'react';
import type { CalculationResult, CalculatorInputs } from '../lib/calculator';
import { formatCurrency } from '../lib/calculator';
import { inputsToSearchParams } from '../lib/shareState';

interface ShareButtonProps {
  inputs: CalculatorInputs;
  result: CalculationResult;
}

export default function ShareButton({ inputs, result }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const buildShareUrl = () => {
    const params = inputsToSearchParams(inputs);
    const url = new URL(window.location.href);
    url.search = params.toString();
    return url.toString();
  };

  const buildShareText = () => {
    const winner = result.verdict === 'buy' ? 'Buying' : 'Renting & investing';
    return `${winner} comes out ${formatCurrency(result.differenceAmount)} ahead over ${inputs.years} years in my rent vs buy comparison —`;
  };

  const handleShare = async () => {
    const url = buildShareUrl();
    window.history.replaceState(null, '', `${window.location.pathname}?${new URL(url).search.slice(1)}`);

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Rent vs Buy Calculator', text: buildShareText(), url });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silently no-op, URL is already in the address bar
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 ring-1 ring-inset ring-slate-700 transition-colors hover:bg-slate-700 hover:text-white"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5l6.8 3.9M15.4 6.6l-6.8 3.9" strokeLinecap="round" />
      </svg>
      {copied ? 'Link copied!' : 'Share my result'}
    </button>
  );
}
