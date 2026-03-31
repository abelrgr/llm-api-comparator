// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import compress from '@playform/compress';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), compress()],
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
  site: 'https://llm-comparator.abelgalloruiz.me',
});
