// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { site } from './src/config/site.ts';

export default defineConfig({
  site: site.url,
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    // The whole stylesheet is small: inline it so there is no render-blocking CSS request.
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/efxaristoume') && !page.includes('/admin'),
      i18n: undefined,
    }),
  ],
  image: {
    responsiveStyles: true,
  },
});
