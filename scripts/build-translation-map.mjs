#!/usr/bin/env node
/**
 * Scans blog frontmatter for translation pairs (same `translationKey`,
 * differing `lang`) and writes src/data/translation-pairs.json — a map of
 * post URL path -> { lang, alt } consumed by the edge middleware to
 * auto-redirect a visitor to their language's version of a post.
 *
 * Runs as part of `yarn build` (before `astro build`). Output is committed.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { slug as githubSlug } from 'github-slugger';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BLOG_DIR = join(ROOT, 'src/content/blog');
const OUT_FILE = join(ROOT, 'src/data/translation-pairs.json');

// Use the SAME slugifier Astro's glob loader uses (github-slugger) so the map
// key always equals `post.id` / the served URL, regardless of filename casing
// or punctuation. (content/utils.js: `githubSlug(segment)`.)
function slugOf(filename) {
  return githubSlug(filename.replace(/\.(md|mdx)$/, ''));
}

async function main() {
  const entries = (await readdir(BLOG_DIR)).filter(
    (e) => e.endsWith('.md') || e.endsWith('.mdx'),
  );

  const posts = [];
  for (const entry of entries) {
    const { data } = matter(await readFile(join(BLOG_DIR, entry), 'utf8'));
    posts.push({
      slug: slugOf(entry),
      lang: data.lang === 'en' ? 'en' : 'ko',
      key: typeof data.translationKey === 'string' ? data.translationKey : null,
    });
  }

  const groups = new Map();
  for (const p of posts) {
    if (!p.key) continue;
    if (!groups.has(p.key)) groups.set(p.key, []);
    groups.get(p.key).push(p);
  }

  const map = {};
  for (const members of groups.values()) {
    for (const m of members) {
      // Only pair with a DIFFERENT-language sibling. A same-lang fallback could
      // map A->B and B->A with both lang===ko, which would bounce a foreign
      // visitor A->B->A forever.
      const sibling = members.find((x) => x.slug !== m.slug && x.lang !== m.lang);
      if (!sibling) continue;
      // Keys/alt are URL-encoded to match `url.pathname` (percent-encoded) at runtime.
      map[`/blog/${encodeURIComponent(m.slug)}/`] = {
        lang: m.lang,
        alt: `/blog/${encodeURIComponent(sibling.slug)}/`,
      };
    }
  }

  await writeFile(OUT_FILE, JSON.stringify(map, null, 2) + '\n', 'utf8');
  console.log(
    `translation-pairs.json: ${Object.keys(map).length} path(s) across ${groups.size} key(s).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
