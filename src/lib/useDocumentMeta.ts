import { useEffect } from 'react';

// Overrides the static <title>/description from index.html for the lifetime
// of the mounted route, restoring the previous values on unmount. Search
// engines that execute JS (Googlebot) pick this up; simpler crawlers that
// don't run JS see the default home-page meta baked into index.html instead.
export function useDocumentMeta(title: string, description: string) {
  useEffect(() => {
    const prevTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const prevDescription = meta?.getAttribute('content') ?? '';

    document.title = title;
    meta?.setAttribute('content', description);

    return () => {
      document.title = prevTitle;
      meta?.setAttribute('content', prevDescription);
    };
  }, [title, description]);
}
