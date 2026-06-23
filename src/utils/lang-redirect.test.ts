import { describe, it, expect } from 'vitest';
import { preferredLang, decideRedirect } from './lang-redirect';
import pairs from '../data/translation-pairs.json';

const KO = '/blog/ko-post/';
const EN = '/blog/en-post/';
const MAP = {
  [KO]: { lang: 'ko', alt: EN },
  [EN]: { lang: 'en', alt: KO },
};

const HTML = 'text/html,application/xhtml+xml';

describe('preferredLang', () => {
  it('takes the first entry primary subtag', () => {
    expect(preferredLang('en-US,ko;q=0.8')).toBe('en');
    expect(preferredLang('ko-KR,ko;q=0.9,en;q=0.8')).toBe('ko');
  });
  it('defaults to empty for missing/blank', () => {
    expect(preferredLang(undefined)).toBe('');
    expect(preferredLang('')).toBe('');
  });
});

describe('decideRedirect', () => {
  it('redirects an English browser off the Korean post to the English sibling', () => {
    expect(decideRedirect({ pathname: KO, acceptLanguage: 'en-US,en;q=0.9', accept: HTML }, MAP))
      .toEqual({ to: EN, lang: 'en' });
  });
  it('redirects a Korean browser off the English post to the Korean sibling', () => {
    expect(decideRedirect({ pathname: EN, acceptLanguage: 'ko-KR,ko;q=0.9', accept: HTML }, MAP))
      .toEqual({ to: KO, lang: 'ko' });
  });
  it('does not redirect when already on the preferred language', () => {
    expect(decideRedirect({ pathname: KO, acceptLanguage: 'ko-KR', accept: HTML }, MAP)).toBeNull();
  });
  it('passes through unknown paths', () => {
    expect(decideRedirect({ pathname: '/blog/lone/', acceptLanguage: 'en', accept: HTML }, MAP)).toBeNull();
  });
  it('respects a manual choice cookie (no auto-redirect once set)', () => {
    expect(decideRedirect({ pathname: KO, acceptLanguage: 'en', cookie: 'a=1; blogLang=ko', accept: HTML }, MAP)).toBeNull();
  });
  it('never redirects crawlers', () => {
    expect(decideRedirect({ pathname: KO, acceptLanguage: 'en', userAgent: 'Googlebot/2.1', accept: HTML }, MAP)).toBeNull();
  });
  it('ignores non-html requests (assets/prefetch)', () => {
    expect(decideRedirect({ pathname: KO, acceptLanguage: 'en', accept: 'application/json' }, MAP)).toBeNull();
  });
  it('ignores languages we do not have (no redirect for fr)', () => {
    expect(decideRedirect({ pathname: KO, acceptLanguage: 'fr-FR,fr;q=0.9', accept: HTML }, MAP)).toBeNull();
  });
});

// Guards the generated map against malformed/dangling entries that would break
// the redirect or cause a loop (e.g. an alt that points to a same-language page).
describe('translation-pairs.json invariants', () => {
  const entries = Object.entries(pairs as Record<string, { lang: string; alt: string }>);

  it('every key is an encoded /blog/<slug>/ path', () => {
    for (const [path] of entries) expect(path).toMatch(/^\/blog\/.+\/$/);
  });
  it('every lang is ko or en', () => {
    for (const [, v] of entries) expect(['ko', 'en']).toContain(v.lang);
  });
  it('every alt points back to a different-language entry in the map (reciprocal, no loop)', () => {
    for (const [path, v] of entries) {
      const target = (pairs as Record<string, { lang: string; alt: string }>)[v.alt];
      expect(target, `alt ${v.alt} of ${path} must be a key in the map`).toBeDefined();
      expect(target.lang).not.toBe(v.lang); // different language → can't bounce A→B→A
    }
  });
});
