<script lang="ts">
  import { generateNonogram, type NonogramData } from '../lib/nonogram';
  import Nonogram from './Nonogram.svelte';

  let error: string | null = null;
  let data: Promise<NonogramData> = null!;
  let cw = 5;
  let ch = 5;

  try {
    const param_width = new URLSearchParams(window.location.search).get('w');
    const param_height = new URLSearchParams(window.location.search).get('h');
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
    data = generateNonogram(width, height);
  } catch (e) {
    error = (e as Error).message;
  }

  function finishedNonogramCallback() {
    data = generateNonogram(cw, ch);
  }
</script>

{#if error || !data}
  <div class="flex h-full w-full flex-col items-center justify-center">
    <h1 class="select-none text-center text-4xl font-bold text-gray-700 md:text-6xl lg:text-8xl">Error</h1>
    <p class="mt-4 text-center text-xl text-gray-700">{error}</p>
  </div>
{:else}
  {#await data}
    <div class="flex h-full w-full flex-col items-center justify-center">
      <h1 class="select-none text-center text-4xl font-bold text-gray-700 md:text-6xl lg:text-8xl">Nonogram<span class="text-primary-600">.</span>pro</h1>
      <p class="mt-4 text-center text-2xl text-gray-700"></p>
    </div>
  {:then finalData}
    {#if finalData && finalData.grid && finalData.rowHints && finalData.colHints}
      <Nonogram data={finalData} callback={finishedNonogramCallback} />
    {:else}
      <div class="flex h-full w-full flex-col items-center justify-center">
        <h1 class="select-none text-center text-4xl font-bold text-gray-700 md:text-6xl lg:text-8xl">Error</h1>
        <p class="mt-4 text-center text-xl text-gray-700">Nonogram is corrupted</p>
      </div>
    {/if}
  {/await}
{/if}
