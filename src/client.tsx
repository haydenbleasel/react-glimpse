/* eslint-disable id-length */
import { Root } from '@radix-ui/react-portal';
import { useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import { useEventListener } from '@react-hookz/web';
import { useWindowScroll } from 'react-use';
import createCache from './lib/createCache';
import type { GlimpseData } from './types';
import useGlimpseStore from './lib/useGlimpseStore';

export const useGlimpse = (
  fetcher: (url: string) => Promise<GlimpseData>
): GlimpseData | null => {
  const { data, setData, setOffset, setUrl, url, setCache, cache, reset } =
    useGlimpseStore();
  const { x: scrollX, y: scrollY } = useWindowScroll();

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
      reset();
      return;
    }

    const newUrl = link.getAttribute('href');

    if (!newUrl?.startsWith('http') || link.hasAttribute('data-no-glimpse')) {
      reset();
      return;
    }

    if (newUrl !== url) {
      reset();
    }

    const relativeX = mouseEvent.pageX - scrollX;
    const relativeY = mouseEvent.pageY - scrollY;

    setOffset({ x: relativeX, y: relativeY });
    setUrl(newUrl);
    setData(cache[newUrl]);
  };

  useEventListener(
    typeof window === 'undefined' ? null : window,
    'mousemove',
    hoverHandler,
    { passive: true }
  );

  useEffect(() => {
    // create cache from all links on the page
    if (Object.keys(cache).length) {
      return;
    }

    // eslint-disable-next-line no-console
    createCache(fetcher).then(setCache).catch(console.error);
  }, [cache, fetcher, setCache]);

  return data;
};

export const Glimpse: FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const { offset, data } = useGlimpseStore();

  if ((!offset.x && !offset.y) || !data?.image) {
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
