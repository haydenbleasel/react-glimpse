# Glimpse

Glimpse is a fast, unstyled link preview React component. It uses a combination of server-side and client-side rendering to provide an interactive preview of a link.

![Example of Glimpse](/example.png)

## Installation

```bash
yarn add glimpse
```

## Usage

### Server

Here's an example of the server code using Next.js' [Edge API Routes](https://nextjs.org/docs/api-routes/edge-api-routes):

```ts
import type { NextRequest } from 'next/server';
import glimpse from '@haydenbleasel/glimpse/server';
import parseError from '../../utils/parseError';

const res = (status: ResponseInit['status'], data: object): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });

export const config = {
  runtime: 'experimental-edge',
};

const handler = async (req: NextRequest): Promise<Response> => {
  const { url } = (await req.json()) as { url?: string };

  if (!url) {
    return res(400, { error: 'No URL provided' });
  }

  try {
    const data = await glimpse(url);

    return res(200, { data });
  } catch (error) {
    const message = parseError(error);

    return res(500, { error: message });
  }
};

export default handler;
```

### Client

Here's an example of the client code using Next.js' Link component:

```tsx
import Link from 'next/link';
import type { LinkProps } from 'next/link';
import type { FC } from 'react';
import { useRef } from 'react';
import { ArrowUpRight } from 'react-feather';
import Glimpse from '@haydenbleasel/glimpse/client';
import { useMountEffect, useAsync } from '@react-hookz/web';

const LinkPreview: FC<LinkProps> = ({ children, href, ...props }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [data, { execute }] = useAsync(async () => {
    const response = await fetch('/api/link-preview', {
      method: 'POST',
      body: JSON.stringify({
        url: href,
      }),
    });

    const json = (await response.json()) as {
      error?: string;
      data: {
        title?: string | null;
        description?: string | null;
        image?: string | null;
        url?: string | null;
      };
    };

    if (json.error) {
      throw new Error(json.error);
    }

    return json.data;
  });

  useMountEffect(execute);

  return (
    <span ref={ref} className="group inline-block" tabIndex={-1} role="link">
      <Glimpse.Dialog linkRef={ref} data={data.result}>
        <Glimpse.Image />
        <Glimpse.Title />
        <Glimpse.Description />
        <span className="flex items-center gap-1">
          <Glimpse.Link />
          <ArrowUpRight width={12} height={12} className="text-neutral-400" />
        </span>
      </Glimpse.Dialog>
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-md inline font-normal text-neutral-900 transition-colors hover:text-neutral-500 dark:text-white dark:hover:text-neutral-300"
        {...props}
      >
        {children}
        <ArrowUpRight
          size={14}
          className="ml-[2px] inline -translate-y-[2px]"
        />
      </Link>
    </span>
  );
};

export default LinkPreview;
```
