import { useHoverDirty, useMouse, useWindowScroll } from 'react-use';
import { Root } from '@radix-ui/react-portal';
import { useEffect } from 'react';
import type { FC, ReactNode, RefObject } from 'react';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type GlimpseData = {
  image?: string | null;
  title?: string | null;
  description?: string | null;
  url?: string | null;
};

type GlimpseState = {
  data: GlimpseData;
  setData: (data: GlimpseData) => void;
};

const useGlimpse = create<GlimpseState>()(
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
      }),
      {
        name: 'glimpse-storage',
      }
    )
  )
);

const fetchGlimpseData = async (endpoint: string, url: string) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  const json = (await response.json()) as GlimpseData;

  if (json.error) {
    throw new Error(json.error);
  }

  return json.data;
};

const Dialog: FC<{
  endpoint: string;
  linkRef: RefObject<Element>;
  className?: string;
  children?: ReactNode;
}> = ({ endpoint, linkRef, className = '', children }) => {
  const { docX, docY } = useMouse(linkRef);
  const isHovering = useHoverDirty(linkRef);
  const { x: scrollX, y: scrollY } = useWindowScroll();
  const relativeX = docX - scrollX;
  const relativeY = docY - scrollY;
  const { data, setData } = useGlimpse();

  useEffect(() => {
    if (!isHovering) {
      return;
    }

    const url = linkRef.current?.getAttribute('href');

    if (!url) {
      return;
    }

    fetchGlimpseData(endpoint, url)
      .then(setData)
      .catch((error) => {
        console.log(error);
      });
  }, [endpoint, isHovering, linkRef, setData]);

  if (!isHovering || !data.image) {
    return null;
  }

  return (
    <Root>
      <span
        className={className}
        style={{
          left: relativeX,
          top: relativeY,
          opacity: relativeX && relativeY ? 1 : 0,
        }}
      >
        {children}
      </span>
    </Root>
  );
};

const Image: FC<{
  className?: string;
  height?: number;
}> = ({ className = '', height = 174 }) => {
  const { data } = useGlimpse();

  if (!data.image) {
    return null;
  }

  return (
    <div style={{ height }}>
      <img
        src={data.image}
        alt={`Preview of ${data.url ?? 'a website'}`}
        className={className}
      />
    </div>
  );
};

const Title: FC<{ className?: string }> = ({ className }) => {
  const { data } = useGlimpse();

  return <p className={className}>{data.title}</p>;
};

const Description: FC<{ className?: string }> = ({ className = '' }) => {
  const { data } = useGlimpse();

  return <p className={className}>{data.description}</p>;
};

const Link: FC<{ className?: string }> = ({ className = '' }) => {
  const { data } = useGlimpse();
  const { hostname } = data.url ? new URL(data.url) : { hostname: '' };

  return <span className={className}>{hostname}</span>;
};

const LinkPreview = {
  Dialog,
  Image,
  Title,
  Description,
  Link,
};

export default LinkPreview;
