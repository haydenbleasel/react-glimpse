import { parse } from 'node-html-parser';

export type PreviewResponse = {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
};

const fetchLinkPreviewData = async (url: string): Promise<PreviewResponse> => {
  const response = await fetch(url);
  const data = await response.text();
  const dom = parse(data);

  const title = dom.querySelector('title')?.text ?? null;
  const description =
    dom.querySelector('meta[name="description"]')?.attributes.content ?? null;
  const image =
    dom.querySelector('meta[property="og:image"]')?.attributes.content ?? null;

  return {
    url,
    title,
    description,
    image,
  };
};

export default fetchLinkPreviewData;
