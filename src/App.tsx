import Calculator from './components/Calculator';

function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
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
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Rent vs Buy Calculator
              </h1>
              <p className="text-sm text-slate-400">
                Australian property &amp; investment comparison
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-slate-400 sm:text-base">
          Compare long-term net wealth from buying a home vs renting and investing, with
          Australian state stamp duty and LMI built in.
        </p>
        <Calculator />
      </main>
    </div>
  );
}

export default App;
