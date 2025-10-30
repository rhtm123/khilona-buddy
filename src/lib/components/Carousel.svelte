<script>
    import { onMount } from 'svelte';
    
    const images = [
      {
        src: "https://img.freepik.com/free-photo/toys-collection_488220-17949.jpg?size=626&ext=jpg",
        alt: "Colorful toys"
      },
      {
        src: "https://prod-cdn-thekrazycouponlady.imgix.net/wp-content/uploads/2022/05/bluey-toys-target-2022-10-1653246893-1653246893.jpg?auto=compress",
        alt: "Teddy bear with toys"
      },
      {
        src: "https://prod-cdn-thekrazycouponlady.imgix.net/wp-content/uploads/2022/05/bluey-toys-target-2022-10-1653246893-1653246893.jpg?auto=compress",
        alt: "Blue elephant toy"
      },
      {
        src: "https://images.unsplash.com/photo-1608889476561-6242cfdbf622",
        alt: "LEGO minifigures"
      },
      {
        src: "https://images.unsplash.com/photo-1608889476561-6242cfdbf622",
        alt: "Superhero toys"
      }
    ];
  
    let currentIndex = 0;
    let carouselContainer;
  
    const nextSlide = () => {
      currentIndex = (currentIndex + 1) % images.length;
      updateSlide();
    };
  
    const prevSlide = () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateSlide();
    };
  
    const updateSlide = () => {
      if (carouselContainer) {
        carouselContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
      }
    };
  
    onMount(() => {
      // Auto-play carousel
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    });
  </script>
  
  <div class="relative w-full overflow-hidden bg-[#FFF5F5]">
    <div 
      class="carousel-container flex transition-transform duration-500 ease-in-out"
      bind:this={carouselContainer}
    >
      {#each images as { src, alt }, i}
        <div 
          class="w-full flex-shrink-0 transform hover:scale-105 transition-transform duration-300"
          style="flex: 0 0 100%"
        >
          <img
            {src}
            {alt}
            class="w-full h-[500px] object-cover rounded-lg shadow-lg"
          />
        </div>
      {/each}
    </div>
  
    <!-- Navigation Buttons -->
    <button
      class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      on:click={prevSlide}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    
    <button
      class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      on:click={nextSlide}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  
    <!-- Dots Indicator -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
      {#each images as _, i}
        <button
          class="w-3 h-3 rounded-full transition-all duration-300 {i === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}"
          on:click={() => {
            currentIndex = i;
            updateSlide();
          }}
        />
      {/each}
    </div>
  </div>