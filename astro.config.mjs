// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://halfmoon.day/',
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'ko',
        locales: { ko: 'ko-KR', en: 'en-US' },
      },
    }),
  ],
  adapter: netlify({ edgeMiddleware: true }),
  // Inline the (small) global CSS into each page's HTML so the first paint
  // doesn't wait on a separate render-blocking stylesheet request.
  build: { inlineStylesheets: 'always' },
  security: {
    checkOrigin: false,
  },
  vite: {
    server: {
      allowedHosts: ['.ngrok-free.app', '.ngrok.app'],
    },
  },
});
