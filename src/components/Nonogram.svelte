<script lang="ts">
  import { type NonogramData, generateNonogram } from '../lib/nonogram';

  let error: string | null = null;
  let data: NonogramData = null!;

  let boardPattern: Array<boolean | null> = $state(null!);

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
    data = generateNonogram(width, height);
    boardPattern = Array.from({ length: data.sizeX * data.sizeY }, () => null);
  } catch (e) {
    error = (e as Error).message;
  }

  let boardSetMouseDown = false;
  let boardSetShapeSet: boolean | null = false;
  let boardSetShapeReplace: boolean | null = false;
  let boardSetMouseX: number | null = null;
  let boardSetMouseY: number | null = null;
  let boardSetMouseOriginX: number = 0;
  let boardSetMouseOriginY: number = 0;

  function onUpdateBoardCell(index: number) {}

  function onMouseDown(event: MouseEvent) {
    const el = event.target as HTMLElement;
    const index = el.getAttribute('data-index');
    if (index === null) return;
    const i = parseInt(index);
    if (isNaN(i)) return;
    const boardValue = boardPattern[i];

    boardSetMouseDown = true;
    boardSetShapeSet = boardValue === (event.button !== 2) ? null : event.button !== 2;
    boardSetShapeReplace = boardValue;
    boardSetMouseX = null;
    boardSetMouseY = null;
    boardSetMouseOriginX = i % data.sizeX;
    boardSetMouseOriginY = Math.floor(i / data.sizeX);

    boardPattern[i] = boardSetShapeSet;
    boardPattern = [...boardPattern];

    onUpdateBoardCell(i);

    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function onMouseMove(event: MouseEvent) {
    if (!boardSetMouseDown) return;

    const el = event.target as HTMLElement;
    const index = el.getAttribute('data-index');
    if (index === null) return;
    const i = parseInt(index);
    if (isNaN(i)) return;
    const boardValue = boardPattern[i];

    const x = i % data.sizeX;
    const y = Math.floor(i / data.sizeX);

    if (boardSetMouseX === null && boardSetMouseY === null && (boardSetMouseOriginX !== x || boardSetMouseOriginY !== y)) {
      if (boardSetMouseOriginY === y) {
        boardSetMouseY = y;
      }
      if (boardSetMouseOriginX === x) {
        boardSetMouseX = x;
      }
    }

    const correctedX = boardSetMouseX === null ? x : boardSetMouseX;
    const correctedY = boardSetMouseY === null ? y : boardSetMouseY;
    const correctedIndex = correctedY * data.sizeX + correctedX;
    const correctedValue = boardPattern[correctedIndex];

    if (correctedValue === boardSetShapeReplace) {
      boardPattern[correctedIndex] = boardSetShapeSet;
      boardPattern = [...boardPattern];
      onUpdateBoardCell(correctedIndex);
    }

    //if(boardValue === boardSetShapeReplace && (boardSetMouseX === x || boardSetMouseY === y)){
    //  boardPattern[i] = boardSetShapeSet;
    //  boardPattern = [...boardPattern];
    //}
  }
</script>

{#if error || !data}
  <div class="flex h-full w-full flex-col items-center justify-center">
    <h1 class="select-none text-center text-4xl font-bold text-gray-700 md:text-6xl lg:text-8xl">Error</h1>
    <p class="mt-4 text-center text-xl text-gray-700">{error}</p>
  </div>
{:else}
  <div class="flex h-full w-full items-center justify-center">
    <div class="grid" style="grid-template-columns: auto 1fr; grid-template-rows: auto 1fr;">
      <div class="pointer-events-none col-span-1 col-start-2 row-span-1 row-start-1 grid h-full select-none gap-1 pb-1" style="grid-template-rows: repeat({data.colHintslength}, minmax(0, 1fr)); grid-template-columns: repeat({data.sizeX}, minmax(0, 1fr));">
        {#each data.rowHints as row, rowIndex}
          {#each row as hint, hintIndex}
            <div class="flex h-full items-center justify-center rounded border border-gray-300 bg-gray-200 py-1 text-sm font-bold text-gray-800" style="grid-row: {data.colHintslength - row.length + hintIndex + 1}/{data.colHintslength - row.length + hintIndex + 2}; grid-column: {rowIndex + 1}/{rowIndex + 2};">{hint}</div>
          {/each}
        {/each}
      </div>

      <div class="pointer-events-none col-span-1 col-start-1 row-span-1 row-start-2 grid h-full select-none gap-1 pr-1" style="grid-template-rows: repeat({data.sizeY}, minmax(0, 1fr)); grid-template-columns: repeat({data.rowHintslength}, minmax(0, 1fr));">
        {#each data.rowHints as row, rowIndex}
          {#each row as hint, hintIndex}
            <div class="flex h-full items-center justify-center rounded border border-gray-300 bg-gray-200 px-2 text-sm font-bold text-gray-800" style="grid-row: {rowIndex + 1}/{rowIndex + 2}; grid-column: {data.rowHintslength - row.length + hintIndex + 1}/{data.rowHintslength - row.length + hintIndex + 2};">{hint}</div>
          {/each}
        {/each}
      </div>

      <div class="col-span-1 col-start-2 row-span-1 row-start-2 h-[600px]" style="aspect-ratio: {data.sizeX}/{data.sizeY};">
        <div class="relative aspect-square h-full overflow-hidden">
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div on:mousedown={onMouseDown} on:mousemove={onMouseMove} on:contextmenu={(event) => event.preventDefault()} on:mouseleave={() => (boardSetMouseDown = false)} on:mouseup={() => (boardSetMouseDown = false)} class="grid h-full w-full" id="nonogram-grid-bg" style="grid-template-rows: repeat({data.sizeX}, minmax(0, 1fr)); grid-template-columns: repeat({data.sizeY}, minmax(0, 1fr));">
            {#each data.grid as _, tileIndex}
              {@const x = tileIndex % data.sizeX}
              {@const y = Math.floor(tileIndex / data.sizeX)}
              <div class={`relative aspect-square overflow-visible bg-white`} data-index={tileIndex} style="border-top: {y % 5 === 0 ? '2px solid #e5e7eb' : '1px solid #e5e7eb'}; border-left: {x % 5 === 0 ? '2px solid #e5e7eb' : '1px solid #e5e7eb'}; border-bottom: {y === data.sizeY - 1 ? '2px solid #e5e7eb' : 'none'}; border-right: {x === data.sizeX - 1 ? '2px solid #e5e7eb' : ''};">
                {#if boardPattern[tileIndex] === true}
                  <div class={`pointer-events-none absolute left-0 top-0 h-[calc(100%+2px)] w-[calc(100%+2px)] -translate-x-[1px] -translate-y-[1px] select-none border border-gray-900 bg-gray-800`} />
                {:else if boardPattern[tileIndex] === false}
                  <svg class="pointer-events-none h-full w-full select-none text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6" />
                  </svg>
                {/if}
              </div>
            {/each}
          </div>
          <div class="pointer-events-none absolute inset-0 grid select-none" style="grid-template-rows: repeat({data.sizeX / 5}, minmax(0, 1fr)); grid-template-columns: repeat({data.sizeY / 5}, minmax(0, 1fr));">
            {#each { length: (data.sizeX * data.sizeY) / 25 } as _, squareIndex}
              <div class="border-t-[2px] border-black border-l-[2px]{Math.floor(squareIndex / (data.sizeX / 5)) === data.sizeY / 5 - 1 ? ' border-b-[2px]' : ''}{squareIndex % (data.sizeX / 5) === data.sizeX / 5 - 1 ? ' border-r-[2px]' : ''}"></div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
