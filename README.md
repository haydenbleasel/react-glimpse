# Glimpse

Glimpse is a fast, unstyled link preview React component. It uses a combination of server-side and client-side rendering to provide an interactive preview of a link. The server-side component fetches the link's metadata while the client-side component creates a local cache and renders the preview.

![Example of Glimpse](/example.png)

## Installation

```bash
yarn add react-glimpse
```

## Usage

### Server

Here's an example of the server code using Next.js' [Edge API Routes](https://nextjs.org/docs/api-routes/edge-api-routes):

```ts
import type { NextRequest } from 'next/server';
import glimpse from 'react-glimpse/server';

const headers = {
  'content-type': 'application/json',
};

export const config = {
  runtime: 'experimental-edge',
};

const handler = async (req: NextRequest): Promise<Response> => {
  const { url } = (await req.json()) as { url?: string };

  if (!url) {
    return new Response(JSON.stringify({}), { status: 400, headers });
  }

  try {
    const data = await glimpse(url);

    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch () {
    return new Response(JSON.stringify({}), { status: 500, headers });
  }
};

export default handler;
```

### Client

Here's an example of the client code using Next.js' Link component:

```tsx
'use client';

import type { FC } from 'react';
import { Glimpse, useGlimpse } from 'react-glimpse/client';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

const fetcher = async (url: string) => {
  const response = await fetch('/api/glimpse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
    }),
  });

  return response.json();
};

const LinkPreview: FC = () => {
  const data = useGlimpse(fetcher);

  if (!data?.image) {
    return null;
  }

  return (
    <Glimpse className="pointer-events-none fixed z-20 flex w-[316px] translate-x-2 translate-y-2 flex-col rounded-lg bg-zinc-900/90 p-3 shadow-lg backdrop-blur-md transition-opacity group-hover:-translate-y-2 dark:bg-zinc-800 print:hidden">
      <Image
        className="m-0 h-[174px] w-full rounded-sm object-cover"
        src={data.image}
        width={316}
        height={174}
        alt=""
        unoptimized
      />
      <p
        className={`text-md mt-2 block font-medium leading-normal text-white ${
          data.description ? 'line-clamp-1' : 'line-clamp-3'
        }`}
      >
        {data.title}
      </p>
      <p className="line-clamp-2 block text-sm leading-normal text-zinc-300">
        {data.description}
      </p>
      <span className="flex items-center gap-1">
        <p className="line-clamp-1 block text-sm leading-normal text-zinc-400">
          {data.url}
        </p>
        <ArrowUpRight width={12} height={12} className="text-zinc-400" />
      </span>
    </Glimpse>
  );
};

export default LinkPreview;
```

Then you can just import the `LinkPreview` component into your higher-level component with:

```tsx
<LinkPreview />
```

## Styling

Glimpse is unstyled by default. You can style it using the `className` prop on the `Glimpse` component.
