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
          // Preserve whitespace text nodes React SSR emits ({" "}, etc.)
          collapseWhitespace: false,
          trimCustomFragments: false,
          // Preserve React's empty <!-- --> comment markers used for
          // fragments and conditional renders — stripping them causes #418.
          removeComments: false,
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
