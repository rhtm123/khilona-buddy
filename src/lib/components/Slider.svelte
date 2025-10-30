<!-- Slider.svelte -->
<script>
  import { onMount } from "svelte";

  export let items = []; // Array of items to slide
  // console.log("items", items);
  let scrollContainer;
  let currentIndex = 0;

  const getItemWidth = () => {
    if (!scrollContainer) return 0;
    const item = scrollContainer.querySelector(".item");
    const style = getComputedStyle(item);
    const width = item.offsetWidth;
    const marginLeft = parseFloat(style.marginLeft);
    const marginRight = parseFloat(style.marginRight);
    return width + marginLeft + marginRight;
  };

  const scrollToIndex = (index) => {
    if (scrollContainer && index >= 0 && index < items.length) {
      const itemWidth = getItemWidth();
      scrollContainer.scrollTo({
        left: itemWidth * index,
        behavior: "smooth",
      });
      currentIndex = index;
    }
  };

  const updateIndex = () => {
    if (scrollContainer) {
      const itemWidth = getItemWidth();
      const scrollPosition = scrollContainer.scrollLeft;
      const newIndex = Math.round(scrollPosition / itemWidth);
      if (newIndex >= 0 && newIndex < items.length) {
        currentIndex = newIndex;
      }
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  const nextSlide = () => {
    if (currentIndex < items.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  onMount(() => {
    scrollToIndex(0);
    scrollContainer.addEventListener("scroll", updateIndex);
    return () => scrollContainer.removeEventListener("scroll", updateIndex);
  });
</script>

<div class="relative">
  <div
    bind:this={scrollContainer}
    class="flex space-x-2 md:space-x-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide transition-all duration-300 ease-out"
  >
    <slot {items} />
  </div>

  <button
    on:click={prevSlide}
    class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 hidden md:flex items-center justify-center w-10 h-10 bg-white text-gray-800 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
    disabled={currentIndex === 0}
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
  </button>
  <button
    on:click={nextSlide}
    class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 hidden md:flex items-center justify-center w-10 h-10 bg-white text-gray-800 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
    disabled={currentIndex === items.length - 1}
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  </button>

  <div class="md:hidden flex justify-center space-x-2 mt-4">
    {#each items as _, i}
      <button
        class="w-2 h-2 rounded-full transition-all duration-300 {i === currentIndex ? 'bg-primary w-4' : 'bg-gray-300'}"
        on:click={() => scrollToIndex(i)}
        aria-label="Go to slide {i + 1}"
      />
    {/each}
  </div>
</div>

<style>
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>