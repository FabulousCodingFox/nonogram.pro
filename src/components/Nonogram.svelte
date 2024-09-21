<script lang="ts">
  import { type NonogramData } from '../lib/nonogram';

  let { data, callback }: { data: NonogramData; callback: () => void } = $props();

  let boardPattern: Array<boolean | null> = $state(Array.from({ length: data.sizeX * data.sizeY }, () => null));
  let boardRowHints: Array<Array<boolean>> = $state(data.rowHints.map((row) => row.map((hint) => false)));
  let boardColHints: Array<Array<boolean>> = $state(data.colHints.map((col) => col.map((hint) => false)));
  let boardRowCompleted: Array<boolean> = $state(data.rowHints.map(() => false));
  let boardColCompleted: Array<boolean> = $state(data.colHints.map(() => false));

  let boardSetMouseDown = false;
  let boardSetShapeSet: boolean | null = false;
  let boardSetShapeReplace: boolean | null = false;
  let boardSetMouseX: number | null = null;
  let boardSetMouseY: number | null = null;
  let boardSetMouseOriginX: number = 0;
  let boardSetMouseOriginY: number = 0;

  let completed = $state(false);

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

    // Check if the board is completed through col and row completed hints
    if (boardRowCompleted.every((row) => row) && boardColCompleted.every((col) => col)) {
      completed = true;

      setTimeout(() => {
        callback();
      }, 1000);
    }
  }

  function onMouseDown(event: MouseEvent) {
    if (completed) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

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

  function onMouseUp(event: MouseEvent) {
    boardSetMouseDown = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }
</script>

<div class="flex h-full w-full items-center justify-center">
  <div class="gridAppear grid" style="grid-template-columns: auto 1fr; grid-template-rows: auto 1fr;">
    <div class="pointer-events-none col-span-1 col-start-2 row-span-1 row-start-1 grid h-full select-none gap-1 pb-1" style="grid-template-rows: repeat({data.colHintslength}, minmax(0, 1fr)); grid-template-columns: repeat({data.sizeX}, minmax(0, 1fr));">
      {#each data.colHints as col, colIndex}
        {#each col as hint, hintIndex}
          <div class="hintGroupFadeIn flex h-full items-center justify-center rounded border text-sm font-bold duration-150 motion-safe:transition-colors {boardColCompleted[colIndex] ? 'border-gray-200 bg-white text-gray-400' : boardColHints[colIndex][hintIndex] ? 'border-gray-300 bg-gray-200 text-gray-400' : 'border-gray-300 bg-gray-200 text-gray-800'}" style="grid-row: {data.colHintslength - col.length + hintIndex + 1}/{data.colHintslength - col.length + hintIndex + 2}; grid-column: {colIndex + 1}/{colIndex + 2}; --i: {colIndex};">{hint}</div>
        {/each}
      {/each}
    </div>

    <div class="pointer-events-none col-span-1 col-start-1 row-span-1 row-start-2 grid h-full select-none gap-1 pr-1" style="grid-template-rows: repeat({data.sizeY}, minmax(0, 1fr)); grid-template-columns: repeat({data.rowHintslength}, minmax(0, 1fr));">
      {#each data.rowHints as row, rowIndex}
        {#each row as hint, hintIndex}
          <div class="hintGroupFadeIn flex h-full items-center justify-center rounded border px-2 text-sm font-bold duration-150 motion-safe:transition-colors {boardRowCompleted[rowIndex] ? 'border-gray-200 bg-white text-gray-400' : boardRowHints[rowIndex][hintIndex] ? 'border-gray-300 bg-gray-200 text-gray-400' : 'border-gray-300 bg-gray-200 text-gray-800'}" style="grid-row: {rowIndex + 1}/{rowIndex + 2}; grid-column: {data.rowHintslength - row.length + hintIndex + 1}/{data.rowHintslength - row.length + hintIndex + 2}; --i: {rowIndex};">{hint}</div>
        {/each}
      {/each}
    </div>

    <div class="col-span-1 col-start-2 row-span-1 row-start-2 h-[600px]" style="aspect-ratio: {data.sizeX}/{data.sizeY};">
      <div class="relative aspect-square h-full overflow-hidden">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div on:mousedown={onMouseDown} on:mousemove={onMouseMove} on:contextmenu={(event) => event.preventDefault()} on:mouseleave={onMouseUp} on:mouseup={onMouseUp} class="grid h-full w-full" id="nonogram-grid-bg" style="grid-template-rows: repeat({data.sizeX}, minmax(0, 1fr)); grid-template-columns: repeat({data.sizeY}, minmax(0, 1fr));">
          {#each data.grid as _, tileIndex}
            {@const x = tileIndex % data.sizeX}
            {@const y = Math.floor(tileIndex / data.sizeX)}
            <div class="relative aspect-square overflow-visible bg-white transition-colors duration-500 {completed ? 'border-transparent' : 'border-gray-200'} {y % 5 === 0 ? 'border-t-2' : 'border-t-[1px]'} {x % 5 === 0 ? 'border-l-2' : 'border-l-[1px]'} {y === data.sizeY - 1 ? 'border-b-2' : ''} {x === data.sizeX - 1 ? 'border-r-[2px]' : ''}" data-index={tileIndex}>
              <div class="nonogram-tile {boardPattern[tileIndex] === true ? 'on' : 'off'} {completed ? 'border-transparent' : 'border-gray-900'}"></div>
              <svg class="nonogram-scale {boardPattern[tileIndex] === false && !completed ? 'on' : 'off'}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6" />
              </svg>
            </div>
          {/each}
        </div>
        <div class="pointer-events-none absolute inset-0 grid select-none" style="grid-template-rows: repeat({data.sizeX / 5}, minmax(0, 1fr)); grid-template-columns: repeat({data.sizeY / 5}, minmax(0, 1fr));">
          {#if completed}
            <div class="border-2 border-black" style="grid-area: 1/1/{data.sizeX / 5 + 1}/{data.sizeY / 5 + 1}"></div>
          {:else}
            {#each { length: (data.sizeX * data.sizeY) / 25 } as _, squareIndex}
              <div class="border-l-2 border-t-2 border-black {Math.floor(squareIndex / (data.sizeX / 5)) === data.sizeY / 5 - 1 ? 'border-b-2' : ''} {squareIndex % (data.sizeX / 5) === data.sizeX / 5 - 1 ? 'border-r-2' : ''}"></div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="css">
  .nonogram-tile {
    @apply pointer-events-none absolute left-0 top-0 h-[calc(100%+2px)] w-[calc(100%+2px)] -translate-x-[1px] -translate-y-[1px] select-none border bg-gray-800;
    transition:
      transform 150ms,
      border-color 150ms;
  }

  .nonogram-tile.on {
    @apply z-10 scale-100;
  }

  .nonogram-tile.off {
    @apply scale-0;
  }

  .nonogram-scale {
    @apply pointer-events-none h-full w-full select-none text-gray-800 duration-150 motion-safe:transition-transform;
  }

  .nonogram-scale.on {
    @apply z-10 scale-100;
  }

  .nonogram-scale.off {
    @apply scale-0;
  }

  @keyframes fadein {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .hintGroupFadeIn {
    @apply opacity-0;
    animation-name: fadein;
    animation-duration: 50ms;
    animation-delay: calc(200ms + var(--i) * 25ms);
    animation-fill-mode: forwards;
    animation-timing-function: linear;
  }

  @keyframes gridAppear {
    from {
      opacity: 0;
      transform: scale(0);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .gridAppear {
    @apply opacity-0;
    animation-name: gridAppear;
    animation-duration: 250ms;
    animation-fill-mode: forwards;
    animation-timing-function: ease-in-out;
  }

  @media (prefers-reduced-motion) {
    .hintGroupFadeIn {
      animation: none;
      @apply opacity-100;
    }

    .gridAppear {
      animation: none;
      @apply opacity-100;
    }
  }
</style>
