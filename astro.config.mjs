// @ts-check
import { defineConfig } from 'astro/config';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  site: 'https://kevinborja.github.io',
  base: isDev ? '/' : process.env.PUBLIC_BASE,
  vite: {
    build: {
      sourcemap: true
    }
  }
});