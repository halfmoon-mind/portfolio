# Clips Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `clips` content collection so the author can publish "article link + commentary" posts (like shared-in-Slack reads) with auto-fetched OG metadata.

**Architecture:** A new Astro content collection with its own list page (`/clips`), detail page (`/clips/[slug]`), and dedicated layout visually distinct from blog posts. Origin-site OG metadata (image, title, description) is scraped by a **manual local CLI script** (`yarn clips:refresh`) and cached in a git-committed JSON file. Astro pages only **read** the cache — the Netlify build makes zero external network calls. Missing cache entries render with a placeholder thumbnail (no build failure).

**Tech Stack:** Astro 5, MDX, TypeScript, `open-graph-scraper` + `gray-matter` (devDependencies for the CLI script), yarn.

**Related Spec:** `docs/superpowers/specs/2026-04-21-clips-feature-design.md`

**Package Manager:** This project uses **yarn** (see `yarn.lock`). All commands below use `yarn`, not `npm`.

**Testing Note:** This project has no test framework (no vitest/jest/etc. in `devDependencies`). Each task's verification step is either (a) running a CLI script and inspecting its output, (b) `yarn build` succeeding, or (c) `yarn dev` visual check. Introducing a test framework is out of scope.

---

## File Structure

### New files
| Path | Responsibility |
|---|---|
| `src/content/clips/reviews-dead.md` | Sample/first clip (the latent.space commentary) |
| `src/data/clips-cache.json` | OG metadata cache, keyed by `sourceUrl`. Committed to git. |
| `src/utils/clips-metadata.ts` | **Read-only** cache accessor + domain helper used by Astro pages. No network. |
| `scripts/refresh-clips-cache.mjs` | Node CLI: reads clip frontmatter, scrapes missing URLs, writes cache. Manual local execution only. |
| `src/layouts/ClipPost.astro` | Clip-detail layout: source card, quote, body. Visually distinct from `BlogPost.astro`. |
| `src/pages/clips/index.astro` | Clip list page (card grid). |
| `src/pages/clips/[slug].astro` | Clip detail page (thin wrapper around `ClipPost`). |

### Modified files
| Path | Change |
|---|---|
| `src/content.config.ts` | Add `clips` collection schema and export. |
| `src/components/Header.astro` | Insert `Clips` nav link between `TIL` and `Portfolio`. |
| `src/pages/index.astro` | Add "최근 Clips" section (3 most recent). |
| `src/pages/rss.xml.js` | Merge `blog` + `clips` in RSS feed, sorted by `pubDate`. |
| `package.json` | Add `clips:refresh` script + `open-graph-scraper` and `gray-matter` devDependencies. |
| `CLAUDE.md` | Document `clips` collection + new author workflow. |

---

## Task Order Rationale

1. **Schema + sample clip (Task 1):** Data foundation. Nothing else compiles without the schema + at least one sample file.
2. **Empty cache file (Task 2):** Required by the cache-reading util. Must exist before `src/utils` imports it.
3. **Cache-reading util (Task 3):** Used by all clip pages. Lives separately from the CLI so pages can import without pulling in Node-only scraping deps.
4. **Deps + package.json (Task 4):** Adds `open-graph-scraper` and `gray-matter`, required for Task 5.
5. **Scraper CLI (Task 5):** Produces the first real cache entries by scraping the sample clip. Proves the end-to-end data path.
6. **Layout (Task 6):** Detail page's rendering surface. Depends on schema + cache util.
7. **Detail page (Task 7):** Uses the layout + collection.
8. **List page (Task 8):** Uses the util + collection.
9. **Header nav (Task 9):** Exposes `/clips` to visitors.
10. **Home integration (Task 10):** Surfaces recent clips on home page.
11. **RSS integration (Task 11):** Surfaces clips in RSS feed.
12. **CLAUDE.md (Task 12):** Docs update, done last so it reflects the finished implementation.

---

## Task 1: Add `clips` collection schema and sample file

**Files:**
- Modify: `src/content.config.ts`
- Create: `src/content/clips/reviews-dead.md`

- [ ] **Step 1: Edit `src/content.config.ts` to add the `clips` collection**

Full updated file content:

```typescript
import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
  }),
});

const portfolio = defineCollection({
  loader: glob({ base: './src/content/portfolio', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
    githubUrl: z.string().optional(),
    liveUrl: z.string().optional(),
  }),
});

const til = defineCollection({
  loader: glob({ base: './src/content/til', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    heroImage: z.string().optional(),
  }),
});

const clips = defineCollection({
  loader: glob({ base: './src/content/clips', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    sourceUrl: z.string().url(),
    sourceTitle: z.string().optional(),
    quote: z.string().optional(),
    tags: z.array(z.string()).optional(),
    heroImage: z.string().optional(),
  }),
});

export const collections = { blog, portfolio, til, clips };
```

- [ ] **Step 2: Create `src/content/clips/reviews-dead.md` with the sample content**

```markdown
---
title: 코드는 사람이 검토해서는 안 된다
description: AI가 작성하는 코드가 늘어날수록, 명세와 자동 검증이 리뷰를 대체할 수 있을까?
pubDate: 2026-04-21
sourceUrl: https://www.latent.space/p/reviews-dead
quote: 코드는 사람이 작성해서는 안 됩니다. 코드는 사람이 검토해서는 안 됩니다.
tags: [ai, code-review, testing]
---

AI가 생성하는 코드의 수가 기하급수적으로 증가하면서 대부분의 개발자라면 코드 리뷰에 많은 공을 들이는 케이스가 많아질 것으로 예상합니다.

최근에 제가 가지고 있는 생각 중에 하나는 기획 단계에서 적절한 명세를 던져준다면, 코드 리뷰라는 것이 필요할까? 적절한 테스트를 만들고 명세대로 나오는지에 대해서 검증만 하면 실제 구현단은 보지 않아도 되는 것이 아닌가?에 대한 고민이 있었습니다.

해당 글에서 재밌게 읽었던 구절 중에 하나로 여러 layer, 그리고 다양한 검증 장치를 통해서 원하는 명세대로 짜는 것은 자율적으로 맡겨서 세부 사항에 대해서는 관여하지 않지만 무엇을 원하는 것에 대해서 집중해서 작성하는 것을 작성자는 얘기하는 것 같아요.

단, 여기서 중요한 것은 LLM에게 통과/실패를 검증하는 것이 아니라 실제로 테스트를 통해서 진행해야한다는 것인 것 같습니다. LLM 자체가 내뱉는 말들이 단순히 확률적인 내용이라 실제로 원하는대로 동작하지 않거나 실패하지만 통과라도 얘기하는 경우가 흔하게 발생하기 때문입니다.

엔지니어가 의도한 대로 잘 진행 되었는지 다양한 방식으로 검증하되, 이러한 검증 방식을 자동화를 진행하여서 병목을 해결하자라는 내용도 포함되어 있는 것으로 이해했어요.

AI가 아직까지는 모든 영역을 커버하지 못하지만 여러가지 방법으로 테스크를 쪼갠다거나, 명세를 구체화해서 실제 구현에 대해서는 관여하지 않고 맡긴다거나 하는 방식으로 활용할 방안을 고민해보면 좋을 것 같습니다!
```

- [ ] **Step 3: Sync Astro to validate schema**

Run: `yarn astro sync`
Expected: exits 0 with no schema errors. Console may print "Types generated".

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts src/content/clips/reviews-dead.md
git commit -m "feat(clips): add clips content collection with sample post"
```

---

## Task 2: Create empty cache file

**Files:**
- Create: `src/data/clips-cache.json`

- [ ] **Step 1: Create the cache file**

Path: `src/data/clips-cache.json`

Content (literal JSON):

```json
{}
```

(Just an empty object with a trailing newline.)

- [ ] **Step 2: Verify it parses as JSON**

Run: `node -e "console.log(require('./src/data/clips-cache.json'))"`
Expected output: `{}`

- [ ] **Step 3: Commit**

```bash
git add src/data/clips-cache.json
git commit -m "feat(clips): add empty OG metadata cache file"
```

---

## Task 3: Cache-read utility

**Files:**
- Create: `src/utils/clips-metadata.ts`

- [ ] **Step 1: Create `src/utils/clips-metadata.ts`**

Full file content:

```typescript
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
```

- [ ] **Step 2: Verify TypeScript resolves the import**

Run: `yarn astro sync`
Expected: exits 0, no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/utils/clips-metadata.ts
git commit -m "feat(clips): add cache-read utility for OG metadata"
```

---

## Task 4: Install scraping dependencies and add script entry

**Files:**
- Modify: `package.json`
- Modify: `yarn.lock` (auto-updated)

- [ ] **Step 1: Install `open-graph-scraper` and `gray-matter` as devDependencies**

Run: `yarn add -D open-graph-scraper gray-matter`
Expected: both packages appear under `devDependencies` in `package.json`, `yarn.lock` updates.

- [ ] **Step 2: Add the `clips:refresh` script**

Edit `package.json` so its `scripts` block looks like:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "clips:refresh": "node scripts/refresh-clips-cache.mjs"
}
```

- [ ] **Step 3: Verify script is registered**

Run: `yarn run`
Expected: output lists `clips:refresh` in the available scripts.

- [ ] **Step 4: Commit**

```bash
git add package.json yarn.lock
git commit -m "chore: add open-graph-scraper and gray-matter for clips cache refresh"
```

---

## Task 5: OG scraper CLI

**Files:**
- Create: `scripts/refresh-clips-cache.mjs`

- [ ] **Step 1: Create `scripts/refresh-clips-cache.mjs`**

Full file content:

```javascript
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

async function scrape(sourceUrl) {
  try {
    const { result } = await ogs({
      url: sourceUrl,
      timeout: 10000,
      fetchOptions: {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; halfmoon.day clips-cache-refresh)',
        },
      },
    });
    const ogImageRaw =
      result.ogImage?.[0]?.url ?? result.twitterImage?.[0]?.url;
    return {
      ogImage: normalizeImageUrl(ogImageRaw, sourceUrl),
      ogTitle: result.ogTitle ?? result.twitterTitle,
      ogDescription: result.ogDescription ?? result.twitterDescription,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
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
```

- [ ] **Step 2: Run the script to populate the cache for the sample clip**

Run: `yarn clips:refresh`
Expected output (approximately):
```
Found 1 clip(s).
  ↻ fetching: https://www.latent.space/p/reviews-dead
Updated cache with 1 entry.
```

If the network fetch fails (firewall / timeout), the script should still exit 0 and write `{"failed": true, ...}` for the URL. That is acceptable — the pages handle missing metadata with a placeholder.

- [ ] **Step 3: Inspect the updated cache**

Run: `cat src/data/clips-cache.json`
Expected: valid JSON with the `sourceUrl` as a key, an `ogImage` URL (or `failed: true`), and a `fetchedAt` ISO timestamp.

- [ ] **Step 4: Verify idempotency (second run must not re-fetch)**

Run: `yarn clips:refresh`
Expected output (approximately):
```
Found 1 clip(s).
  ✓ cached: https://www.latent.space/p/reviews-dead
Cache is up to date.
```

- [ ] **Step 5: Commit**

```bash
git add scripts/refresh-clips-cache.mjs src/data/clips-cache.json
git commit -m "feat(clips): add OG metadata refresh script and initial cache"
```

---

## Task 6: ClipPost layout

**Files:**
- Create: `src/layouts/ClipPost.astro`

- [ ] **Step 1: Create `src/layouts/ClipPost.astro`**

Full file content:

```astro
---
import type { CollectionEntry } from 'astro:content';
import BaseHead from '../components/BaseHead.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import FormattedDate from '../components/FormattedDate.astro';
import { getClipMetadata, getSourceDomain } from '../utils/clips-metadata';

type Props = CollectionEntry<'clips'>['data'];
const { title, description, pubDate, sourceUrl, sourceTitle, quote, tags, heroImage } = Astro.props;

const meta = getClipMetadata(sourceUrl);
const displayHero = heroImage ?? meta?.ogImage;
const displaySourceTitle = sourceTitle ?? meta?.ogTitle ?? sourceUrl;
const displaySourceDescription = meta?.ogDescription;
const sourceDomain = getSourceDomain(sourceUrl);

const currentUrl = new URL(Astro.url.pathname, Astro.site).toString();
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  image: displayHero ? new URL(displayHero, Astro.site).toString() : undefined,
  datePublished: pubDate.toISOString(),
  author: { '@type': 'Person', name: '심상현' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': currentUrl },
  isBasedOn: { '@type': 'CreativeWork', url: sourceUrl },
};
---

<html lang="ko">
  <head>
    <BaseHead title={title} description={description} image={displayHero} article={true} />
    <script type="application/ld+json" set:html={JSON.stringify(articleSchema)} />
  </head>
  <body>
    <Header />
    <main>
      <article>
        {displayHero && (
          <div class="hero-banner">
            <img src={displayHero} alt="" />
          </div>
        )}
        <div class="prose">
          <a class="source-card" href={sourceUrl} target="_blank" rel="noopener noreferrer">
            <div class="source-card-label">📰 원본 아티클</div>
            <div class="source-card-title">{displaySourceTitle}</div>
            {displaySourceDescription && (
              <div class="source-card-desc">{displaySourceDescription}</div>
            )}
            <div class="source-card-domain">{sourceDomain} ↗</div>
          </a>

          <header class="clip-header">
            <h1>{title}</h1>
            <div class="clip-meta">
              <FormattedDate date={pubDate} />
              {tags && tags.length > 0 && (
                <ul class="clip-tags">
                  {tags.map((tag) => <li class="clip-tag">#{tag}</li>)}
                </ul>
              )}
            </div>
          </header>

          {quote && <blockquote class="clip-quote">{quote}</blockquote>}

          <div class="clip-body">
            <slot />
          </div>
        </div>
      </article>
    </main>
    <Footer />

    <style>
      main {
        width: calc(100% - 2em);
        max-width: 100%;
        margin: 0;
      }
      .hero-banner {
        max-width: 1020px;
        margin: 1em auto 0;
        padding: 0 1em;
      }
      .hero-banner img {
        width: 100%;
        max-height: 400px;
        object-fit: cover;
        border-radius: 12px;
        display: block;
      }
      .prose {
        width: 720px;
        max-width: calc(100% - 2em);
        margin: auto;
        padding: 1em;
        color: rgb(var(--gray-dark));
      }
      .source-card {
        display: block;
        margin: 1em 0 2em;
        padding: 1.25em;
        border: 1px solid #d1d9e0;
        border-radius: 12px;
        background: #f6f8fa;
        text-decoration: none;
        color: inherit;
        transition: border-color 0.2s ease, transform 0.2s ease;
      }
      .source-card:hover {
        border-color: var(--accent, #0077cc);
        transform: translateY(-2px);
      }
      .source-card-label {
        font-size: 0.85em;
        color: #656d76;
        margin-bottom: 0.4em;
      }
      .source-card-title {
        font-weight: 600;
        font-size: 1.05em;
        margin-bottom: 0.3em;
      }
      .source-card-desc {
        font-size: 0.9em;
        color: #656d76;
        line-height: 1.5;
        margin-bottom: 0.5em;
      }
      .source-card-domain {
        font-size: 0.85em;
        color: var(--accent, #0077cc);
      }
      .clip-header h1 {
        margin: 0 0 0.5em;
      }
      .clip-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5em 1em;
        align-items: center;
        color: rgb(var(--gray));
        margin-bottom: 1.5em;
      }
      .clip-tags {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        gap: 0.4em;
        flex-wrap: wrap;
      }
      .clip-tag {
        background-color: #f6f8fa;
        color: #656d76;
        border: 1px solid #d1d9e0;
        border-radius: 12px;
        padding: 2px 8px;
        font-size: 0.75em;
        font-weight: 500;
      }
      .clip-quote {
        border-left: 4px solid var(--accent, #0077cc);
        padding: 0.5em 1em;
        margin: 1.5em 0;
        background: #f6f8fa;
        font-style: italic;
        color: #333;
      }
      .clip-body {
        line-height: 1.7;
      }
    </style>
  </body>
</html>
```

- [ ] **Step 2: Verify TypeScript resolves**

Run: `yarn astro sync`
Expected: exits 0 with no errors. (The layout is not yet referenced; this just ensures it compiles.)

- [ ] **Step 3: Commit**

```bash
git add src/layouts/ClipPost.astro
git commit -m "feat(clips): add ClipPost layout with source card and quote"
```

---

## Task 7: Clip detail page

**Files:**
- Create: `src/pages/clips/[slug].astro`

- [ ] **Step 1: Create `src/pages/clips/[slug].astro`**

Full file content:

```astro
---
import { type CollectionEntry, getCollection, render } from 'astro:content';
import ClipPost from '../../layouts/ClipPost.astro';

export async function getStaticPaths() {
  const clips = await getCollection('clips');
  return clips.map((clip) => ({
    params: { slug: clip.id },
    props: clip,
  }));
}

type Props = CollectionEntry<'clips'>;
const clip = Astro.props;
const { Content } = await render(clip);
---

<ClipPost {...clip.data}>
  <Content />
  <div class="back-link-wrap">
    <a href="/clips" class="back-link">← 클립 목록으로 돌아가기</a>
  </div>
</ClipPost>

<style>
  .back-link-wrap {
    text-align: center;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid #e5e5e5;
  }
  .back-link {
    color: rgb(var(--accent));
    text-decoration: none;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border: 1px solid rgb(var(--accent));
    border-radius: 6px;
    transition: all 0.2s ease;
  }
  .back-link:hover {
    background: rgb(var(--accent));
    color: white;
  }
</style>
```

- [ ] **Step 2: Build the site to verify the page compiles**

Run: `yarn build`
Expected: build completes successfully. Near the end of the log, a `clips/reviews-dead/index.html` (or similar slug) entry appears in the generated pages.

- [ ] **Step 3: Visually verify the detail page**

Run: `yarn dev` (in a separate terminal)
Open: `http://localhost:4321/clips/reviews-dead`

Expected to see:
- Hero image banner (if OG scrape succeeded) OR no banner (if scrape failed; this is OK)
- "📰 원본 아티클" card with the scraped title, description, and `latent.space ↗` link (clicking opens the article in a new tab)
- Clip title `코드는 사람이 검토해서는 안 된다`
- Date `2026-04-21` and three tag chips
- Styled blockquote with the `quote` field
- Body markdown content
- "← 클립 목록으로 돌아가기" link at the bottom (the `/clips` list page doesn't exist yet — clicking it will 404 until Task 8. That is expected.)

Stop the dev server (Ctrl+C).

- [ ] **Step 4: Commit**

```bash
git add src/pages/clips/[slug].astro
git commit -m "feat(clips): add /clips/[slug] detail page"
```

---

## Task 8: Clip list page

**Files:**
- Create: `src/pages/clips/index.astro`

- [ ] **Step 1: Create `src/pages/clips/index.astro`**

Full file content:

```astro
---
import BaseHead from '../../components/BaseHead.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import FormattedDate from '../../components/FormattedDate.astro';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../../consts';
import { getClipMetadata, getSourceDomain } from '../../utils/clips-metadata';

const clips = (await getCollection('clips')).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
);

const cards = clips.map((clip) => {
  const meta = getClipMetadata(clip.data.sourceUrl);
  return {
    clip,
    thumb: clip.data.heroImage ?? meta?.ogImage ?? null,
    domain: getSourceDomain(clip.data.sourceUrl),
  };
});
---

<!doctype html>
<html lang="ko">
  <head>
    <BaseHead title={`${SITE_TITLE} - Clips`} description={SITE_DESCRIPTION} />
  </head>
  <body>
    <Header />
    <main>
      <h1 class="section-title">Clips</h1>
      <p class="section-intro">읽은 글과 그 위에 남기는 짧은 코멘트.</p>
      <ul class="clip-grid">
        {cards.map(({ clip, thumb, domain }) => (
          <li class="clip-card">
            <a href={`/clips/${clip.id}/`}>
              <div class="thumb" data-has-image={thumb ? 'true' : 'false'}>
                {thumb ? (
                  <img src={thumb} alt="" loading="lazy" />
                ) : (
                  <span class="thumb-placeholder">{domain.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div class="card-body">
                <div class="source-domain">🔗 {domain}</div>
                <h3 class="card-title">{clip.data.title}</h3>
                <p class="card-desc">{clip.data.description}</p>
                <div class="card-meta">
                  <span class="card-date"><FormattedDate date={clip.data.pubDate} /></span>
                  {clip.data.tags && clip.data.tags.length > 0 && (
                    <ul class="card-tags">
                      {clip.data.tags.slice(0, 3).map((tag) => <li class="card-tag">#{tag}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </main>
    <Footer />

    <style>
      main {
        max-width: 1012px;
        padding: 16px;
        margin: 0 auto;
      }
      .section-title {
        font-size: 2rem;
        font-weight: 600;
        color: #1f2328;
        margin-bottom: 0.4em;
        padding-bottom: 8px;
        border-bottom: 1px solid #d1d9e0;
      }
      .section-intro {
        color: #656d76;
        margin-top: 0;
        margin-bottom: 1.5em;
      }
      .clip-grid {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5em;
      }
      .clip-card {
        border: 1px solid #eee;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .clip-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }
      .clip-card a {
        text-decoration: none;
        color: inherit;
        display: block;
      }
      .thumb {
        width: 100%;
        height: 180px;
        overflow: hidden;
        background: linear-gradient(135deg, #eef2f7, #dfe7f0);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }
      .clip-card:hover .thumb img {
        transform: scale(1.05);
      }
      .thumb-placeholder {
        font-size: 3rem;
        font-weight: 700;
        color: #8b95a1;
      }
      .card-body {
        padding: 1em;
      }
      .source-domain {
        font-size: 0.8em;
        color: #656d76;
        margin-bottom: 0.4em;
      }
      .card-title {
        margin: 0 0 0.4em;
        font-size: 1.05em;
        line-height: 1.4;
      }
      .card-desc {
        margin: 0 0 0.8em;
        font-size: 0.9em;
        color: #656d76;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .card-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5em;
        flex-wrap: wrap;
      }
      .card-date {
        font-size: 0.8em;
        color: #888;
      }
      .card-tags {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        gap: 0.3em;
        flex-wrap: wrap;
      }
      .card-tag {
        background-color: #f6f8fa;
        color: #656d76;
        border: 1px solid #d1d9e0;
        border-radius: 12px;
        padding: 2px 8px;
        font-size: 0.7em;
        font-weight: 500;
      }
    </style>
  </body>
</html>
```

- [ ] **Step 2: Build and verify**

Run: `yarn build`
Expected: build succeeds; `clips/index.html` appears in the output.

- [ ] **Step 3: Visually verify list + detail navigation**

Run: `yarn dev`
Open: `http://localhost:4321/clips`

Expected to see:
- "Clips" heading + intro paragraph
- One card showing the sample clip with thumbnail (or placeholder "L" if OG fetch failed), "🔗 latent.space", title, description, date, tags
- Click the card → navigates to `/clips/reviews-dead`
- Back link on the detail page returns to `/clips`

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/clips/index.astro
git commit -m "feat(clips): add /clips list page with card grid"
```

---

## Task 9: Add Clips to header navigation

**Files:**
- Modify: `src/components/Header.astro`

- [ ] **Step 1: Add the nav link**

In `src/components/Header.astro`, locate this block:

```astro
<div class="internal-links" id="dropdown-menu">
  <HeaderLink href="/">Home</HeaderLink>
  <HeaderLink href="/blog">Blog</HeaderLink>
  <HeaderLink href="/til">TIL</HeaderLink>
  <HeaderLink href="/portfolio">Portfolio</HeaderLink>
  <HeaderLink href="/resume">Resume</HeaderLink>
</div>
```

Replace with:

```astro
<div class="internal-links" id="dropdown-menu">
  <HeaderLink href="/">Home</HeaderLink>
  <HeaderLink href="/blog">Blog</HeaderLink>
  <HeaderLink href="/til">TIL</HeaderLink>
  <HeaderLink href="/clips">Clips</HeaderLink>
  <HeaderLink href="/portfolio">Portfolio</HeaderLink>
  <HeaderLink href="/resume">Resume</HeaderLink>
</div>
```

- [ ] **Step 2: Verify**

Run: `yarn dev`
Open any page (e.g., `http://localhost:4321/`).
Expected: nav bar shows `Home · Blog · TIL · Clips · Portfolio · Resume`. Click "Clips" → goes to `/clips`. On `/clips` the "Clips" link should be visually marked active (the existing `HeaderLink` component handles active state).

Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat(clips): add Clips link to header navigation"
```

---

## Task 10: Home page "최근 Clips" section

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1a: Add the util import to the top of the frontmatter**

In `src/pages/index.astro`, locate the existing import block at the very top of the frontmatter:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';
import FormattedDate from '../components/FormattedDate.astro';

import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
```

Add one more import line (after `FormattedDate`):

```astro
import { getClipMetadata, getSourceDomain } from '../utils/clips-metadata';
```

- [ ] **Step 1b: Add the clips fetch after the TIL fetch**

Still in `src/pages/index.astro`, locate the TIL fetch block:

```astro
// TIL 항목도 가져오기
const tils = (await getCollection('til')).sort(
	(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);

const latestTils = tils.slice(0, 3); // 최근 3개 TIL 표시
```

Insert immediately after it (still above `// 홈페이지의 OG 이미지 경로 설정`):

```astro
// Clips 항목도 가져오기
const clips = (await getCollection('clips')).sort(
	(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);

const latestClips = clips.slice(0, 3).map((clip) => {
	const meta = getClipMetadata(clip.data.sourceUrl);
	return {
		clip,
		thumb: clip.data.heroImage ?? meta?.ogImage ?? null,
		domain: getSourceDomain(clip.data.sourceUrl),
	};
});
```

- [ ] **Step 2: Add the "최근 Clips" section to the template**

In the body of `src/pages/index.astro`, after the "최근 TIL" section's closing `</section>` tag and before the `</div>` of `.container`, insert:

```astro
<section>
    <h2>최근 Clips</h2>
    <ul class="card-grid">
        {latestClips.map(({ clip, thumb, domain }) => (
            <li class="card">
                <a href={`/clips/${clip.id}`}>
                    <div class="image-container clip-thumb">
                        {thumb ? (
                            <img src={thumb} alt=""/>
                        ) : (
                            <span class="clip-placeholder">{domain.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div class="content">
                        <div class="clip-domain">🔗 {domain}</div>
                        <h4 class="title">{clip.data.title}</h4>
                        <p class="date">
                            <FormattedDate date={clip.data.pubDate} />
                        </p>
                    </div>
                </a>
            </li>
        ))}
    </ul>
    <div class="more-link">
        <a href="/clips">Clips 더 보기 →</a>
    </div>
</section>
```

- [ ] **Step 3: Add supporting styles inside the existing `<style>` block**

Inside the `<style>` tag of `src/pages/index.astro`, add these rules (at any position, e.g., after the existing `.til-tag.more-tags` rule):

```css
.clip-thumb {
    background: linear-gradient(135deg, #eef2f7, #dfe7f0);
    display: flex;
    align-items: center;
    justify-content: center;
}
.clip-placeholder {
    font-size: 3rem;
    font-weight: 700;
    color: #8b95a1;
}
.clip-domain {
    font-size: 0.8em;
    color: #656d76;
    margin-bottom: 0.3em;
}
```

- [ ] **Step 4: Verify on the home page**

Run: `yarn dev`
Open: `http://localhost:4321/`

Expected to see:
- The existing three sections (최근 글 / 최근 포트폴리오 / 최근 TIL)
- A new fourth section "최근 Clips" with one card (the sample), "Clips 더 보기 →" link
- Clicking the card goes to `/clips/reviews-dead`
- Clicking "Clips 더 보기" goes to `/clips`

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(clips): add 최근 Clips section to home page"
```

---

## Task 11: Merge clips into RSS feed

**Files:**
- Modify: `src/pages/rss.xml.js`

- [ ] **Step 1: Replace the file contents**

Full updated content of `src/pages/rss.xml.js`:

```javascript
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
	const blogPosts = await getCollection('blog');
	const clips = await getCollection('clips');

	const items = [
		...blogPosts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: `/blog/${post.id}/`,
		})),
		...clips.map((clip) => ({
			title: clip.data.title,
			description: clip.data.description,
			pubDate: clip.data.pubDate,
			link: `/clips/${clip.id}/`,
		})),
	].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items,
	});
}
```

- [ ] **Step 2: Build and inspect the generated feed**

Run: `yarn build`
Expected: build succeeds.

Run: `cat dist/rss.xml | head -40`
Expected: XML with `<item>` entries for both blog posts AND the sample clip (`/clips/reviews-dead/` link present). Items should be ordered by `pubDate` descending.

- [ ] **Step 3: Commit**

```bash
git add src/pages/rss.xml.js
git commit -m "feat(clips): include clips in RSS feed merged with blog"
```

---

## Task 12: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update the "컨텐츠 컬렉션" section**

In `CLAUDE.md`, locate:

```markdown
### 컨텐츠 컬렉션 (src/content/)
- **blog/**: 블로그 포스트 (Markdown/MDX)
- **portfolio/**: 포트폴리오 프로젝트 (Markdown/MDX)
- **til/**: Today I Learned 항목 (Markdown/MDX)
```

Replace with:

```markdown
### 컨텐츠 컬렉션 (src/content/)
- **blog/**: 블로그 포스트 (Markdown/MDX)
- **portfolio/**: 포트폴리오 프로젝트 (Markdown/MDX)
- **til/**: Today I Learned 항목 (Markdown/MDX)
- **clips/**: 읽은 글 + 코멘트 형태의 공유 포스트 (Markdown/MDX)
```

- [ ] **Step 2: Add the Clips frontmatter schema section**

Locate the "**Blog & TIL:**" and "**Portfolio:**" frontmatter code blocks. After the Portfolio block, append a new Clips block:

```markdown
**Clips:**
```typescript
{
  title: string          // 클립 제목 (내가 붙이는 헤드라인)
  description: string    // 요약 (리스트/RSS/OG용)
  pubDate: Date
  sourceUrl: string      // 원본 아티클 URL (필수)
  sourceTitle?: string   // 자동 스크래핑 실패 시 수동 지정
  quote?: string         // 원문에서 인상 깊었던 인용문
  tags?: string[]
  heroImage?: string     // 자동 og:image 덮어쓰기용
}
```

```

- [ ] **Step 3: Add a "Clips 작성 워크플로" section**

Under "## 컨텐츠 작성 시 주의사항" and before "## 글로벌 상수" (or at a similar logical location), add:

```markdown
## Clips 작성 워크플로

Clips는 "외부 아티클 링크 + 내 코멘트" 포맷이며, 원본 글의 OG 이미지/제목/설명은 **빌드가 아닌 로컬 스크립트**로 스크래핑해 `src/data/clips-cache.json`에 저장한다.

```bash
# 1. src/content/clips/<slug>.md 작성 (frontmatter에 sourceUrl 반드시 포함)
# 2. 캐시 갱신 (새 URL만 스크래핑, 이미 있는 URL은 건드리지 않음)
yarn clips:refresh

# 강제로 전체 재스크래핑
yarn clips:refresh --force

# 3. 로컬 확인
yarn dev

# 4. 커밋 (클립 파일 + 캐시 JSON을 함께 커밋해야 배포에 반영됨)
git add src/content/clips/<slug>.md src/data/clips-cache.json
git commit -m "feat(clips): ..."
```

- 빌드(`yarn build`)는 캐시를 **읽기만** 한다 → Netlify 배포 시 외부 네트워크 호출 없음.
- 캐시에 URL이 없는 상태로 배포해도 빌드는 성공하며, 해당 클립은 썸네일 플레이스홀더로 렌더된다. 이후 `yarn clips:refresh`로 캐시 채우고 다시 커밋하면 정상화.
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(clips): document clips collection schema and refresh workflow"
```

---

## Final verification

After all tasks are complete:

- [ ] **Full build from scratch**

Run: `rm -rf dist && yarn build`
Expected: succeeds with no errors; output includes `clips/index.html` and `clips/reviews-dead/index.html`.

- [ ] **Spot-check deploy surfaces**

Run: `yarn preview`
Visit:
- `http://localhost:4321/` → "최근 Clips" section visible, link works
- `http://localhost:4321/clips` → list page with sample card
- `http://localhost:4321/clips/reviews-dead` → detail page with source card, quote, body
- `http://localhost:4321/rss.xml` → feed contains both blog posts and the clip

- [ ] **Commit any accumulated noise (if any)**

```bash
git status
# Should be clean. If not, investigate before declaring done.
```

---

## Out of scope (not in this plan)

Confirmed excluded per the design spec:
- Tag filter / archive pages
- Search
- List pagination (defer until ~50+ clips)
- Comments / reactions
- Automatic periodic re-scrape (only manual `--force`)
- Promoting a clip to a blog post
- Introducing a test framework
