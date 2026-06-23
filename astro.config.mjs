// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://halfmoon.day/',
  integrations: [mdx(), sitemap()],
  adapter: netlify({ edgeMiddleware: true }),
  security: {
    checkOrigin: false,
  },
  vite: {
    server: {
      allowedHosts: ['.ngrok-free.app', '.ngrok.app'],
    },
  },
});
