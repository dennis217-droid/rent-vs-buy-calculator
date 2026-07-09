import Calculator from '../components/Calculator';
import { useDocumentMeta } from '../lib/useDocumentMeta';

// Chrome-free variant intended for use inside an <iframe> on third-party
// sites. Deliberately skips SiteHeader/SiteFooter to stay compact, but keeps
// a small attribution link back to the full site — that backlink is the
// whole point of offering an embeddable widget.
export default function EmbedPage() {
  useDocumentMeta(
    'Rent vs Buy Calculator (Embed)',
    'Embeddable Australian rent vs buy calculator widget.',
  );

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Calculator />
        <p className="mt-6 text-center text-xs text-slate-600">
          Powered by{' '}
          <a
            href="/"
            target="_blank"
            rel="noopener"
            className="font-medium text-indigo-400 hover:text-indigo-300"
          >
            Rent vs Buy Calculator
          </a>
        </p>
      </div>
    </div>
  );
}
