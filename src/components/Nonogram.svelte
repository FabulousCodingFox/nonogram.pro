<script lang="ts">
  import { type NonogramData, generateNonogram } from '../lib/nonogram';

  let error: string | null = null;
  let data: NonogramData = null!;

  let boardPattern: Array<boolean | null> = $state(null!);
  let boardRowHints: Array<Array<boolean>> = $state([]);
  let boardColHints: Array<Array<boolean>> = $state([]);
  let boardRowCompleted: Array<boolean> = $state([]);
  let boardColCompleted: Array<boolean> = $state([]);

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
    boardRowHints = data.rowHints.map((row) => row.map((hint) => false));
    boardColHints = data.colHints.map((col) => col.map((hint) => false));
    boardRowCompleted = data.rowHints.map(() => false);
    boardColCompleted = data.colHints.map(() => false);
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

  function isRowCompletedUpdateRowHints(y: number): boolean {
    let hintIndex = 0;
    let count = 0;
    let changed = false;

    function setFollowingRowsHintToFalse(index: number) {
      for (let i = index; i < data.rowHints[y].length; i++) {
        boardRowHints[y][i] = false;
      }
      boardRowHints = [...boardRowHints];
      return false;
    }

    // Loop through the row and compare the cucrrent state with the row hints
    for (let x = 0; x < data.sizeX; x++) {
      if (boardPattern[y * data.sizeX + x]) {
        count++;
      } else if (count > 0) {
        // Check if the current count matches the hint
        if (data.rowHints[y][hintIndex] !== count) return setFollowingRowsHintToFalse(hintIndex);
        boardRowHints[y][hintIndex] = true;
        changed = true;
        hintIndex++;
        count = 0;
      }
    }

    // Check for cases at the end
    if (count > 0) {
      if (data.rowHints[y][hintIndex] !== count) return setFollowingRowsHintToFalse(hintIndex);
      boardRowHints[y][hintIndex] = true;
      changed = true;
      hintIndex++;
    }

    // Check if the hints are completed
    if (hintIndex !== data.rowHints[y].length) return setFollowingRowsHintToFalse(hintIndex);

    // If the hints are changed, update them
    if (changed) boardRowHints = [...boardRowHints];

    return true;
  }

  function isColCompletedUpdateColHints(x: number): boolean {
    let hintIndex = 0;
    let count = 0;
    let changed = false;

    function setFollowingColsHintToFalse(index: number) {
      for (let i = index; i < data.colHints[x].length; i++) {
        boardColHints[x][i] = false;
      }
      boardColHints = [...boardColHints];
      return false;
    }

    // Loop through the col and compare the cucrrent state with the col hints
    for (let y = 0; y < data.sizeY; y++) {
      if (boardPattern[y * data.sizeX + x]) {
        count++;
      } else if (count > 0) {
        if (data.colHints[x][hintIndex] !== count) return setFollowingColsHintToFalse(hintIndex);
        boardColHints[x][hintIndex] = true;
        changed = true;
        hintIndex++;
        count = 0;
      }
    }

    // Check for cases at the end
    if (count > 0) {
      if (data.colHints[x][hintIndex] !== count) return setFollowingColsHintToFalse(hintIndex);
      boardColHints[x][hintIndex] = true;
      changed = true;
      hintIndex++;
    }

    // Check if the hints are completed
    if (hintIndex !== data.colHints[x].length) return setFollowingColsHintToFalse(hintIndex);

    // If the hints are changed, update them
    if (changed) boardColHints = [...boardColHints];

    return true;
  }

  /**
   * Checks if the board cell is correct
   * 1. Fills completed rows
   * 2. Highlights the row/column hints
   * @param index
   */
  function onUpdateBoardCell(index: number, shapeTo: boolean | null) {
    const x = index % data.sizeX;
    const y = Math.floor(index / data.sizeX);
    let isChanged = false;

    // Check X-axis
    // Check if axis is completed
    if (isRowCompletedUpdateRowHints(y)) {
      if (!boardRowCompleted[y]) {
        boardRowCompleted[y] = true;
        boardRowCompleted = [...boardRowCompleted];
      }

      // Only fill if a square was set
      if (shapeTo === true) {
        for (let x = 0; x < data.sizeX; x++) {
          if (boardPattern[y * data.sizeX + x] === null) {
            boardPattern[y * data.sizeX + x] = false;
            isChanged = true;
          }
        }
      }
    } else {
      if (boardRowCompleted[y]) {
        boardRowCompleted[y] = false;
        boardRowCompleted = [...boardRowCompleted];
      }
    }

    // Check Y-axis
    // Check if axis is completed
    if (isColCompletedUpdateColHints(x)) {
      if (!boardColCompleted[x]) {
        boardColCompleted[x] = true;
        boardColCompleted = [...boardColCompleted];
      }

      // Only fill if a square was set
      if (shapeTo === true) {
        for (let y = 0; y < data.sizeY; y++) {
          if (boardPattern[y * data.sizeX + x] === null) {
            boardPattern[y * data.sizeX + x] = false;
            isChanged = true;
          }
        }
      }
    } else {
      if (boardColCompleted[x]) {
        boardColCompleted[x] = false;
        boardColCompleted = [...boardColCompleted];
      }
    }

    if (isChanged) boardPattern = [...boardPattern];
  }

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

    onUpdateBoardCell(i, boardSetShapeSet);

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
      onUpdateBoardCell(correctedIndex, boardSetShapeSet);
    }
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
        {#each data.colHints as col, colIndex}
          {#each col as hint, hintIndex}
            <div class="flex h-full items-center justify-center rounded border text-sm font-bold {boardColCompleted[colIndex] ? 'border-gray-200 bg-white text-gray-400' : boardColHints[colIndex][hintIndex] ? 'border-gray-300 bg-gray-200 text-gray-400' : 'border-gray-300 bg-gray-200 text-gray-800'}" style="grid-row: {data.colHintslength - col.length + hintIndex + 1}/{data.colHintslength - col.length + hintIndex + 2}; grid-column: {colIndex + 1}/{colIndex + 2};">{hint}</div>
          {/each}
        {/each}
      </div>

      <div class="pointer-events-none col-span-1 col-start-1 row-span-1 row-start-2 grid h-full select-none gap-1 pr-1" style="grid-template-rows: repeat({data.sizeY}, minmax(0, 1fr)); grid-template-columns: repeat({data.rowHintslength}, minmax(0, 1fr));">
        {#each data.rowHints as row, rowIndex}
          {#each row as hint, hintIndex}
            <div class="flex h-full items-center justify-center rounded border px-2 text-sm font-bold {boardRowCompleted[rowIndex] ? 'border-gray-200 bg-white text-gray-400' : boardRowHints[rowIndex][hintIndex] ? 'border-gray-300 bg-gray-200 text-gray-400' : 'border-gray-300 bg-gray-200 text-gray-800'}" style="grid-row: {rowIndex + 1}/{rowIndex + 2}; grid-column: {data.rowHintslength - row.length + hintIndex + 1}/{data.rowHintslength - row.length + hintIndex + 2};">{hint}</div>
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
