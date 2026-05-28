// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  site: 'https://kevinborja.github.io',
  base: isDev ? '/' : "/personal-site/",

  integrations: [sitemap()],
});