import { Link } from 'react-router-dom';

export default function SiteHeader() {
  return (
    <header className="border-b border-slate-800 bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500">
            <svg
              className="h-5 w-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 21h18" />
              <path d="M5 21V9l7-5 7 5v12" />
              <path d="M9 21v-6h6v6" />
              <path d="M14 10.5l4 2" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-white sm:text-2xl">Rent vs Buy Calculator</p>
            <p className="text-sm text-slate-400">Australian property &amp; investment comparison</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
