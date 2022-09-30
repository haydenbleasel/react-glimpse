import { useHoverDirty, useMouse, useWindowScroll } from 'react-use';
import { Root } from '@radix-ui/react-portal';
import type { FC, ReactNode, RefObject } from 'react';
import { useContext, createContext } from 'react';

type LinkPreviewProps = {
  image?: string | null;
  title?: string | null;
  description?: string | null;
  url?: string | null;
};

const LinkPreviewContextDefaults = {
  image: null,
  title: null,
  description: null,
  url: null,
};

const LinkPreviewContext = createContext<LinkPreviewProps>(
  LinkPreviewContextDefaults
);

const Dialog: FC<{
  data: LinkPreviewProps | undefined;
  linkRef: RefObject<Element>;
  className?: string;
  children?: ReactNode;
}> = ({
  data,
  linkRef,
  className = 'pointer-events-none fixed z-20 flex w-[316px] translate-x-2 translate-y-2 flex-col rounded-lg bg-neutral-900/90 p-3 shadow-lg backdrop-blur-md transition-opacity group-hover:-translate-y-2 dark:bg-neutral-800 print:hidden',
  children,
}) => {
  const { docX, docY } = useMouse(linkRef);
  const isHovering = useHoverDirty(linkRef);
  const { x: scrollX, y: scrollY } = useWindowScroll();
  const relativeX = docX - scrollX;
  const relativeY = docY - scrollY;

  if (!isHovering || !data?.image) {
    return null;
  }

  return (
    <LinkPreviewContext.Provider value={data}>
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
    </LinkPreviewContext.Provider>
  );
};

const Image: FC<{
  className?: string;
  height?: number;
}> = ({
  className = 'w-full m-0 h-[174px] rounded-sm object-cover',
  height = 174,
}) => {
  const { url, image } = useContext(LinkPreviewContext);

  if (!image) {
    return null;
  }

  return (
    <div style={{ height }}>
      <img
        src={image}
        alt={`Preview of ${url ?? 'a website'}`}
        className={className}
      />
    </div>
  );
};

const Title: FC<{ className?: string }> = ({ className }) => {
  const { title, description } = useContext(LinkPreviewContext);
  const defaultClassName = `text-md mt-2 block font-medium leading-normal text-white ${
    description ? 'line-clamp-1' : 'line-clamp-3'
  }`;

  return <p className={className ?? defaultClassName}>{title}</p>;
};

const Description: FC<{ className?: string }> = ({
  className = 'line-clamp-2 block text-sm leading-normal text-neutral-300',
}) => {
  const { description } = useContext(LinkPreviewContext);

  return <p className={className}>{description}</p>;
};

const Link: FC<{ className?: string }> = ({
  className = 'line-clamp-1 block text-sm leading-normal text-neutral-400',
}) => {
  const { url } = useContext(LinkPreviewContext);
  const { hostname } = url ? new URL(url) : { hostname: '' };

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
