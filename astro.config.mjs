import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import playformCompress from '@playform/compress';
import playformInline from '@playform/inline';
import playformFormat from '@playform/format';

import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.nonogram.pro',
  integrations: [svelte(), tailwind(), playformInline(), playformFormat(), playformCompress()]
});
