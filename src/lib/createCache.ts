import type { GlimpseCache, GlimpseFetcher } from '../types';

const createCache = async (fetcher: GlimpseFetcher): Promise<GlimpseCache> => {
  const cache: GlimpseCache = {};
  if (typeof window === 'undefined') {
    return {};
  }

  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a'));

  const promises = links.map(async (link) => {
    const href = link.getAttribute('href');

    if (!href || href in cache) {
      return null;
    }

    const newData = await fetcher(href);

    return { [href]: newData };
  });

  const newCache = await Promise.all(promises);

  newCache.forEach((data) => {
    if (data) {
      Object.assign(cache, data);
    }
  });

  return cache;
};

export default createCache;
