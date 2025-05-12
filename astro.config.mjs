import { defineConfig, envField } from 'astro/config';
import playformCompress from '@playform/compress';
import playformInline from '@playform/inline';
import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.nonogram.pro',
  env: {
    validateSecrets: true,
    schema: {
      UMAMI_WEBSITE_ID: envField.string({ context: 'client', access: 'public', default: '' })
    }
  },
  vite: {
    plugins: [tailwindcss()]
  },
  output: 'static',
  integrations: [
    svelte(),
    partytown(),
    robotsTxt({
      sitemap: 'https://nonogram.pro/sitemap-index.xml',
      policy: [
        {
          userAgent: '*',
          disallow: '/'
        }
      ]
    }),
    sitemap({
      lastmod: new Date()
    }),
    playformInline(),
    playformCompress()
  ]
});
