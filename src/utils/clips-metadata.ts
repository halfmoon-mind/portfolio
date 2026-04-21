import cache from '../data/clips-cache.json';

export type ClipMetadata = {
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
};

type CacheEntry = {
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  fetchedAt: string;
  failed?: boolean;
};

type Cache = Record<string, CacheEntry>;

export function getClipMetadata(sourceUrl: string): ClipMetadata | null {
  const entry = (cache as Cache)[sourceUrl];
  if (!entry || entry.failed) return null;
  return {
    ogImage: entry.ogImage,
    ogTitle: entry.ogTitle,
    ogDescription: entry.ogDescription,
  };
}

export function getSourceDomain(sourceUrl: string): string {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, '');
  } catch {
    return sourceUrl;
  }
}
