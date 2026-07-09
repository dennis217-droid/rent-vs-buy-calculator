import { useState } from 'react';

export default function EmbedSnippet() {
  const [copied, setCopied] = useState(false);
  const snippet = `<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed" width="100%" height="1400" style="border:0;border-radius:12px;" title="Rent vs Buy Calculator"></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — user can still select the text manually
    }
  };

  return (
    <details className="group rounded-2xl border border-slate-800 bg-slate-900 shadow-sm shadow-black/20">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-white">Embed this calculator on your site</h2>
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
        <p className="text-sm leading-relaxed text-slate-400">
          Free to embed on mortgage broker sites, finance blogs, or anywhere else. Paste this
          snippet into your page:
        </p>
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-950 p-3">
          <code className="flex-1 overflow-x-auto whitespace-pre-wrap break-all text-xs text-slate-300">
            {snippet}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-300 ring-1 ring-inset ring-slate-700 hover:bg-slate-700 hover:text-white"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </details>
  );
}
