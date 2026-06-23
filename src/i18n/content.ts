// Locale helpers for the portfolio/til/clips collections, where the English
// variant of `<slug>` lives at `en/<slug>` (so its entry id is `en/<slug>` and
// its frontmatter carries `lang: en`). The Korean and English variants share
// the same base slug, which is what pairs them for toggles and hreflang.
// (Blog uses a different, pre-existing translationKey model — see utils/language.ts.)

import type { Locale } from './ui';

type Entry = { id: string; data: { lang?: 'ko' | 'en' } };

/** `en/paybot` -> `paybot`; `paybot` -> `paybot`. */
export const baseSlug = (id: string): string => id.replace(/^en\//, '');

export const entryLocale = (e: Entry): Locale => (e.data.lang === 'en' ? 'en' : 'ko');

/** Entries belonging to one locale. */
export const byLocale = <T extends Entry>(all: T[], locale: Locale): T[] =>
  all.filter((e) => entryLocale(e) === locale);

/** Does a same-base-slug entry exist in the target locale? */
export function hasSibling<T extends Entry>(all: T[], entry: T, target: Locale): boolean {
  const base = baseSlug(entry.id);
  return all.some((e) => entryLocale(e) === target && baseSlug(e.id) === base);
}
