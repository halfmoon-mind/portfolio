// Pure decision logic for the edge middleware that auto-redirects a visitor
// to their preferred-language version of a blog post. Kept side-effect free
// so it can be unit-tested without an edge runtime.

export type PairInfo = { lang: string; alt: string };
export type PairMap = Record<string, PairInfo>;

// Common crawlers — we never auto-redirect these, so search engines index
// both language versions at their own URLs (paired with hreflang).
const BOT_RE =
  /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|embedly|quora|pinterest|slackbot|vkshare|baiduspider|yandex|duckduckbot|bingpreview/i;

/** Primary language subtag of the first Accept-Language entry ('en-US,ko;q=0.8' -> 'en'). */
export function preferredLang(acceptLanguage: string | null | undefined): string {
  if (!acceptLanguage) return '';
  const first = acceptLanguage.split(',')[0].trim().split(';')[0].trim();
  return first.slice(0, 2).toLowerCase();
}

function hasLangCookie(cookie: string | null | undefined): boolean {
  return !!cookie && /(?:^|;\s*)blogLang=/.test(cookie);
}

export type RequestSignals = {
  pathname: string;
  acceptLanguage?: string | null;
  cookie?: string | null;
  userAgent?: string | null;
  accept?: string | null;
};

/**
 * Decide whether to auto-redirect to the language sibling.
 * Returns { to, lang } for a 302, or null to pass through. Redirects only when:
 * the path is a known translation pair, no manual-choice cookie is set yet,
 * the request is a real (non-bot) HTML navigation, and the browser's preferred
 * language is one we have and differs from the current page's language.
 */
export function decideRedirect(
  req: RequestSignals,
  map: PairMap,
): { to: string; lang: string } | null {
  const info = map[req.pathname];
  if (!info) return null; // not a translated post
  if (hasLangCookie(req.cookie)) return null; // manual choice made → never auto-redirect
  if (req.userAgent && BOT_RE.test(req.userAgent)) return null; // don't trap crawlers
  if (req.accept && !req.accept.includes('text/html')) return null; // only page navigations

  const pref = preferredLang(req.acceptLanguage);
  if (pref !== 'ko' && pref !== 'en') return null; // we only have ko/en
  if (pref === info.lang) return null; // already on the preferred language
  return { to: info.alt, lang: pref };
}
