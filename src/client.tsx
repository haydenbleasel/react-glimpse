/* eslint-disable id-length */
import { Root } from '@radix-ui/react-portal';
import { useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useEventListener } from '@react-hookz/web';
import { useWindowScroll } from 'react-use';

type GlimpseData = {
  image: string | null;
  title: string | null;
  description: string | null;
  url: string | null;
};

type GlimpseState = {
  data: GlimpseData;
  setData: (data: GlimpseData) => void;
  offset: { x: number; y: number };
  setOffset: (offset: { x: number; y: number }) => void;
  url: string | null;
  setUrl: (url: string | null) => void;
  cache: Record<string, GlimpseData>;
  updateCache: (data: GlimpseData) => void;
};

const useGlimpseStore = create<GlimpseState>()(
  devtools(
    persist(
      (set) => ({
        data: {
          image: null,
          title: null,
          description: null,
          url: null,
        },
        setData: (data) => set({ data }),
        offset: { x: 0, y: 0 },
        setOffset: (offset) => set({ offset }),
        url: null,
        setUrl: (url) => set({ url }),
        cache: {},
        updateCache: (data) =>
          set((state) => {
            if (!data.url) {
              return state;
            }

            if (!(data.url in state.cache)) {
              state.cache[data.url] = data;
            }

            return state;
          }),
      }),
      {
        name: 'glimpse-storage',
      }
    )
  )
);

export const useGlimpse = (
  fetcher: (url: string) => Promise<GlimpseData>
): GlimpseData => {
  const { data, setData, setOffset, setUrl, url, updateCache, cache } =
    useGlimpseStore();
  const { x: scrollX, y: scrollY } = useWindowScroll();

  console.log({ cache });

  const hoverHandler: EventListener = (event) => {
    const target = event.target as HTMLElement;
    const parent = target.parentElement;
    let link: HTMLAnchorElement | null = null;
    const mouseEvent = event as MouseEvent;

    if (target.tagName === 'A') {
      link = target as HTMLAnchorElement;
    } else if (parent?.tagName === 'A') {
      link = parent as HTMLAnchorElement;
    } else {
      setOffset({ x: 0, y: 0 });
      setUrl(null);
      return;
    }

    const newUrl = link.getAttribute('href');

    if (newUrl !== url) {
      setOffset({ x: 0, y: 0 });
      setUrl(null);
    }

    if (!newUrl || url === newUrl) {
      return;
    }

    // const rect = link.getBoundingClientRect();
    const relativeX = mouseEvent.pageX - scrollX;
    const relativeY = mouseEvent.pageY - scrollY;

    setOffset({ x: relativeX, y: relativeY });
    setUrl(newUrl);
  };

  useEventListener(
    typeof window === 'undefined' ? null : window,
    'mousemove',
    hoverHandler,
    { passive: true }
  );

  useEffect(() => {
    if (!url) {
      return;
    }

    console.log(cache, 'cache');

    if (url in cache) {
      setData(cache[url]);
      return;
    }

    // eslint-disable-next-line no-console
    fetcher(url).then(updateCache).catch(console.error);
  }, [url, fetcher, setData, cache, updateCache]);

  useEffect(() => {
    // create cache from all links on the page

    if (typeof window === 'undefined') {
      return;
    }

    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a'));

    links.forEach((link) => {
      const href = link.getAttribute('href');

      if (!href) {
        return;
      }

      if (href in cache) {
        return;
      }

      fetcher(href)
        .then((newData) => {
          updateCache(href, newData);

          return newData;
        })
        .catch(console.error);
    });
  }, [cache, fetcher, updateCache]);

  return data;
};

export const Glimpse: FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const { offset, data } = useGlimpseStore();

  if ((!offset.x && !offset.y) || !data.image) {
    return null;
  }

  return (
    <Root
      className={className}
      style={{
        left: offset.x,
        top: offset.y,
      }}
    >
      {children}
    </Root>
  );
};
