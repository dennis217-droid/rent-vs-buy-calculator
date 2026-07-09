import Calculator from '../components/Calculator';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import EmbedSnippet from '../components/EmbedSnippet';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="sr-only">Rent vs Buy Calculator</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-400 sm:text-base">
          Compare long-term net wealth from buying a home vs renting and investing, with
          Australian state stamp duty and LMI built in.
        </p>
        <Calculator />
        <EmbedSnippet />
      </main>

      <SiteFooter />
    </div>
  );
}
