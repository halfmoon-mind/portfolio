import { defineMiddleware } from 'astro:middleware';
import { decideRedirect } from './utils/lang-redirect';
import pairs from './data/translation-pairs.json';

// Deployed as a Netlify Edge Function (adapter `edgeMiddleware: true`), so it
// runs on every request including prerendered pages. It only acts on blog posts
// that have a translation sibling; everything else passes straight through.
export const onRequest = defineMiddleware((context, next) => {
  if (context.request.method !== 'GET') return next();

  // This runs site-wide at the edge — never let a fault here take the site down.
  let decision: ReturnType<typeof decideRedirect> = null;
  try {
    const { request } = context;
    decision = decideRedirect(
      {
        pathname: context.url.pathname,
        acceptLanguage: request.headers.get('accept-language'),
        cookie: request.headers.get('cookie'),
        userAgent: request.headers.get('user-agent'),
        accept: request.headers.get('accept'),
      },
      pairs,
    );
  } catch {
    return next();
  }

  if (!decision) return next();

  return new Response(null, {
    status: 302,
    headers: {
      Location: decision.to,
      // Remember the auto-picked language so a manual toggle back isn't bounced,
      // and so the back button works. A manual toggle overwrites this cookie.
      'Set-Cookie': `blogLang=${decision.lang}; Path=/; Max-Age=31536000; SameSite=Lax`,
      'Cache-Control': 'no-store', // the redirect varies by Accept-Language — never cache it
    },
  });
});
