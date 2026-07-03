import express from 'express';
import { getCache } from './cache.js';
import { refreshAllRates } from './scrapers/index.js';

const PORT = Number(process.env.PORT) || 5178;
const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

const app = express();

app.get('/api/rates', (_req, res) => {
  res.json(getCache());
});

app.post('/api/rates/refresh', async (_req, res) => {
  const result = await refreshAllRates();
  res.json({ ...result, cache: getCache() });
});

app.listen(PORT, () => {
  console.log(`[rates] server listening on http://localhost:${PORT}`);
  // Serve seed/cached data instantly; refresh in the background so startup
  // isn't blocked on 6 external HTTP calls.
  refreshAllRates().then(({ succeeded, failed }) => {
    console.log(`[rates] initial scrape: ${succeeded.length} live, ${failed.length} fell back to cache`, {
      succeeded,
      failed,
    });
  });
  setInterval(() => {
    refreshAllRates().then(({ succeeded, failed }) => {
      console.log(`[rates] scheduled scrape: ${succeeded.length} live, ${failed.length} fell back to cache`);
    });
  }, REFRESH_INTERVAL_MS);
});
