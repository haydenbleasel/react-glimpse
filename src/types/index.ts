export type GlimpseData = {
  image: string | null;
  title: string | null;
  description: string | null;
  url: string | null;
};

export type GlimpseCache = Record<string, GlimpseData>;

export type GlimpseFetcher = (url: string) => Promise<GlimpseData>;
