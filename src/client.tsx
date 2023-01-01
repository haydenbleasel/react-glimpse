import { useHoverDirty, useMouse, useWindowScroll } from 'react-use';
import { Root } from '@radix-ui/react-portal';
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

const Dialog: FC<{
  data: GlimpseData | undefined;
  linkRef: RefObject<Element>;
  className?: string;
  children?: ReactNode;
}> = ({ data, linkRef, className = '', children }) => {
  const { docX, docY } = useMouse(linkRef);
  const isHovering = useHoverDirty(linkRef);
  const { x: scrollX, y: scrollY } = useWindowScroll();
  const relativeX = docX - scrollX;
  const relativeY = docY - scrollY;
  const glimpse = useGlimpse();

  if (data) {
    glimpse.setData(data);
  }

  if (!isHovering || !data?.image) {
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
