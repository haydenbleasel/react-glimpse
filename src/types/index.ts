export type GlimpseData = {
  image: string | null;
  title: string | null;
  description: string | null;
  url: string | null;
};

export type GlimpseCache = Record<string, GlimpseData>;

export type GlimpseFetcher = (url: string) => Promise<GlimpseData>;

export type GlimpseState = {
  data: GlimpseData;
  setData: (data: GlimpseData) => void;
  offset: { x: number; y: number };
  setOffset: (offset: { x: number; y: number }) => void;
  url: string | null;
  setUrl: (url: string | null) => void;
  cache: GlimpseCache;
  setCache: (cache: GlimpseCache) => void;
  reset: () => void;
};
