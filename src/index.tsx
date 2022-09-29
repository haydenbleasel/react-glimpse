import { useMouse, useWindowScroll } from 'react-use';
import { Root } from '@radix-ui/react-portal';
import type { FC, ReactNode, RefObject } from 'react';
import { useContext, useEffect, useState, createContext } from 'react';

const LoadingIcon: FC = () => (
  <svg
    className="h-5 w-5 animate-spin text-neutral-400"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const Placeholder: FC<{ className?: string }> = ({ className = '' }) => (
  <span
    className={`flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 ${className}`}
  >
    <LoadingIcon />
  </span>
);

type LinkPreviewContextProps = {
  image: string | null;
  title: string | null;
  description: string | null;
  url: string | null;
};

const LinkPreviewContextDefaults = {
  image: null,
  title: null,
  description: null,
  url: null,
};

const LinkPreviewContext = createContext<LinkPreviewContextProps>(
  LinkPreviewContextDefaults
);

const Dialog: FC<{
  url: string;
  linkRef: RefObject<Element>;
  className?: string;
  children?: ReactNode;
}> = ({
  url,
  linkRef,
  className = 'pointer-events-none fixed z-20 flex w-[316px] translate-x-2 translate-y-2 flex-col rounded-lg bg-neutral-900/90 p-3 shadow-lg backdrop-blur-md transition-opacity group-hover:-translate-y-2 dark:bg-neutral-800 print:hidden',
  children,
}) => {
  const { docX, docY } = useMouse(linkRef);
  const { x: scrollX, y: scrollY } = useWindowScroll();
  const [data, setData] = useState<LinkPreviewContextProps>(
    LinkPreviewContextDefaults
  );

  useEffect(() => {
    const loadData = async () => {
      const response = await fetch(url);
      const text = await response.text();
      const dom = new DOMParser();

      const doc = dom.parseFromString(text, 'text/html');
      const title = doc.querySelector('title')?.textContent ?? null;
      const description =
        doc
          .querySelector('meta[name="description"]')
          ?.attributes.getNamedItem('content')?.value ?? null;
      const image =
        doc
          .querySelector('meta[property="og:image"]')
          ?.attributes.getNamedItem('content')?.value ?? null;

      setData({
        url,
        title,
        description,
        image,
      });
    };

    loadData().catch(console.error);
  }, [data, url]);

  const relativeX = docX - scrollX;
  const relativeY = docY - scrollY;

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
  height: number;
}> = ({
  className = 'm-0 h-[174px] rounded-sm object-cover',
  height = 174,
}) => {
  const { url, image } = useContext(LinkPreviewContext);

  return (
    <div style={{ height }}>
      {image ? (
        <img
          src={image}
          alt={`Preview of ${url ?? 'a website'}`}
          className={className}
        />
      ) : (
        <Placeholder className="h-full w-full rounded-sm" />
      )}
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
  const { hostname } = new URL(url ?? '');

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

/*
 *<LinkPreview.Dialog>
 *  <LinkPreview.Image className="" />
 *  <LinkPreview.Title className="" />
 *  <LinkPreview.Description className="" />
 *</LinkPreview.Dialog>
 */
