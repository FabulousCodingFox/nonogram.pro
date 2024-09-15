<form class="mt-8 block w-fit text-center">
  <!--<button id="play-level" name="play-level" className="block w-full px-4 py-3 md:px-6 md:py-4 lg:px-8 lg:py-5 text-base md:text-lg lg:text-xl text-white bg-blue-500 hover:bg-primary-600 focus:ring-primary-500 focus:border-primary-500 rounded-full shadow-md">
        <span className="block font-semibold">Level 1</span>
        <span className="block font-light md:text-sm lg:text-base">Very easy (5x5)</span>
      </button>-->

  <select
    id="play-custom"
    name="play-custom"
    on:change={(event) => {
      window.location.href = event.target.value;
      event.preventDefault();
    }}
    class="mt-4 block w-full rounded-full border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 focus:border-primary-500 focus:ring-primary-500 md:px-6 md:py-4 md:text-lg lg:px-8 lg:py-5 lg:text-xl"
  >
    <option disabled selected value="/">Play a custom level</option>
    <option value="/play?w=5&h=5">Very easy (5x5)</option>
    <option value="/play?w=10&h=10">Easy (10x10)</option>
    <option value="/play?w=15&h=15">Medium (15x15)</option>
    <option value="/play?w=20&h=20">Hard (20x20)</option>
    <option value="/play?w=25&h=25">Very hard (25x25)</option>
  </select>
</form>
