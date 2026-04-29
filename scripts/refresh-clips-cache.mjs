#!/usr/bin/env node
/**
 * Scrapes OG metadata for each clip's sourceUrl and writes the result to
 * src/data/clips-cache.json. Intended to be run locally before committing
 * a new clip. Idempotent: cached URLs are skipped unless --force is passed.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import ogs from 'open-graph-scraper';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CLIPS_DIR = join(ROOT, 'src/content/clips');
const CACHE_FILE = join(ROOT, 'src/data/clips-cache.json');

const force = process.argv.includes('--force');

async function loadCache() {
  try {
    const content = await readFile(CACHE_FILE, 'utf8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function saveCache(cache) {
  const content = JSON.stringify(cache, null, 2) + '\n';
  await writeFile(CACHE_FILE, content, 'utf8');
}

async function listClipSourceUrls() {
  const entries = await readdir(CLIPS_DIR);
  const urls = [];
  for (const entry of entries) {
    if (!entry.endsWith('.md') && !entry.endsWith('.mdx')) continue;
    const full = join(CLIPS_DIR, entry);
    const raw = await readFile(full, 'utf8');
    const { data } = matter(raw);
    if (typeof data.sourceUrl === 'string') {
      urls.push(data.sourceUrl);
    }
  }
  return urls;
}

function normalizeImageUrl(maybe, baseUrl) {
  if (!maybe) return undefined;
  try {
    return new URL(maybe, baseUrl).toString();
  } catch {
    return undefined;
  }
}

async function fetchHtml(sourceUrl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(sourceUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; halfmoon.day clips-cache-refresh)',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function scrape(sourceUrl) {
  try {
    const html = await fetchHtml(sourceUrl);
    const { result } = await ogs({ html });
    const ogImageRaw =
      result.ogImage?.[0]?.url ?? result.twitterImage?.[0]?.url;
    return {
      ogImage: normalizeImageUrl(ogImageRaw, sourceUrl),
      ogTitle: result.ogTitle ?? result.twitterTitle,
      ogDescription: result.ogDescription ?? result.twitterDescription,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    const message =
      err?.result?.error || err?.message || String(err);
    console.warn(`  ⚠ failed to scrape ${sourceUrl}: ${message}`);
    return {
      failed: true,
      fetchedAt: new Date().toISOString(),
    };
  }
}

async function main() {
  const cache = await loadCache();
  const urls = await listClipSourceUrls();

  console.log(`Found ${urls.length} clip(s).`);

  let updated = 0;
  for (const url of urls) {
    const hasEntry = Object.prototype.hasOwnProperty.call(cache, url);
    if (hasEntry && !force) {
      console.log(`  ✓ cached: ${url}`);
      continue;
    }
    console.log(`  ↻ fetching: ${url}${force && hasEntry ? ' (forced)' : ''}`);
    cache[url] = await scrape(url);
    updated += 1;
  }

  if (updated > 0) {
    await saveCache(cache);
    console.log(`\nUpdated cache with ${updated} entr${updated === 1 ? 'y' : 'ies'}.`);
  } else {
    console.log(`\nCache is up to date.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
