<script lang="ts">
  import { generateNonogram, type NonogramData } from '../lib/nonogram';
  import Nonogram from './Nonogram.svelte';

  let error: string | null = $state(null);
  let data: Promise<NonogramData> = $state(null!);
  let cw = 5;
  let ch = 5;
  let help = false;

  try {
    const param_width = new URLSearchParams(window.location.search).get('w');
    const param_height = new URLSearchParams(window.location.search).get('h');
    const param_help = new URLSearchParams(window.location.search).get('help');
    if (!param_width || !param_height) throw new Error('Missing width or height parameter');
    const width = parseInt(param_width);
    const height = parseInt(param_height);
    if (isNaN(width) || isNaN(height)) throw new Error('Invalid width or height parameter');
    if (width < 5 || height < 5) throw new Error('Width and height must be at least 5');
    if (width > 30 || height > 30) throw new Error('Width and height must be at most 30');
    if (width % 5 !== 0 || height % 5 !== 0) throw new Error('Width and height must be divisible by 5');
    if (width !== height) throw new Error('Width and height must be equal');
    cw = width;
    ch = height;
    help = param_help ? param_help === 'true' : false;
    data = generateNonogram(width, height, help);
  } catch (e) {
    error = (e as Error).message;
  }

  async function finishedNonogramCallback() {
    data = generateNonogram(cw, ch, help);
  }
</script>

{#if error}
  <div class="flex h-full w-full flex-col items-center justify-center">
    <h1 class="text-center text-4xl font-bold text-gray-700 md:text-6xl lg:text-8xl">Error</h1>
    <p class="mt-4 text-center text-xl text-gray-700">{error}</p>
  </div>
{:else}
  {#key data}
    {#await data}
      <div class="flex h-full w-full flex-col items-center justify-center">
        <h1 class="text-center text-4xl font-bold text-gray-700 select-none md:text-6xl lg:text-8xl">Nonogram<span class="text-primary-600">.</span>pro</h1>
        <p class="mt-4 text-center text-2xl text-gray-700"></p>
      </div>
    {:then finalData}
      {#if finalData && finalData.grid && finalData.rowHints && finalData.colHints}
        <Nonogram data={finalData} callback={finishedNonogramCallback} />
      {:else}
        <div class="flex h-full w-full flex-col items-center justify-center">
          <h1 class="text-center text-4xl font-bold text-gray-700 md:text-6xl lg:text-8xl">Error</h1>
          <p class="mt-4 text-center text-xl text-gray-700">Nonogram is corrupted. Please refresh the page.</p>
        </div>
      {/if}
    {/await}
  {/key}
{/if}
