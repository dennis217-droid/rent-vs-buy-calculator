import { useParams } from 'react-router-dom';
import Calculator from '../components/Calculator';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { STATE_LANDING_PAGES } from '../lib/stateLandingContent';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import HomePage from './HomePage';

export default function StateLandingPage() {
  const { slug } = useParams();
  const page = STATE_LANDING_PAGES.find((p) => p.slug === slug);

  useDocumentMeta(page?.title ?? 'Rent vs Buy Calculator', page?.description ?? '');

  if (!page) return <HomePage />;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{page.heading}</h1>
        <p className="mt-3 mb-8 max-w-3xl text-sm leading-relaxed text-slate-400 sm:text-base">
          {page.intro}
        </p>
        <Calculator initialState={page.state} />
      </main>

      <SiteFooter />
    </div>
  );
}
