import { Link } from 'react-router-dom';
import { STATE_LANDING_PAGES } from '../lib/stateLandingContent';

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">By state</p>
            <ul className="mt-3 space-y-2 text-sm">
              {STATE_LANDING_PAGES.map((page) => (
                <li key={page.slug}>
                  <Link to={`/${page.slug}`} className="text-slate-400 hover:text-indigo-400">
                    {page.state} stamp duty calculator
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tool</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-indigo-400">
                  Rent vs buy calculator
                </Link>
              </li>
              <li>
                <Link to="/embed" className="text-slate-400 hover:text-indigo-400">
                  Embed on your site
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-xs leading-relaxed text-slate-600">
          Indicative estimates for educational purposes only — not financial advice. Stamp duty and
          mortgage rate figures are sourced live where possible; always confirm exact figures with
          your state revenue office and lender.
        </p>
      </div>
    </footer>
  );
}
