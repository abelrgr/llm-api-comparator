// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import compress from '@playform/compress';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    compress({
      HTML: {
        'html-minifier-terser': {
          // collapseWhitespace strips React SSR text nodes ({" "}, etc.)
          // which causes React hydration error #418 on the client.
          collapseWhitespace: false,
          // trimCustomFragments has the same effect on inline text fragments.
          trimCustomFragments: false,
        },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
  site: 'https://llm-comparator.abelgalloruiz.me',
});
