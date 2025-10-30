<script>
    import { fade, fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    
    let visible = false;
    
    onMount(() => {
      visible = true;
    });
  
    // Brand logos
    const brands = [
      {
        name: 'Puzzle Playground',
        src: 'https://th.bing.com/th/id/OIP.wIgzC4OZGRhwwqMYMmJn_wHaC-?rs=1&pid=ImgDetMain',
        alt: 'Puzzle Playground Logo'
      },
      {
        name: 'ABC Preschool',
        src: 'https://th.bing.com/th/id/OIP.wIgzC4OZGRhwwqMYMmJn_wHaC-?rs=1&pid=ImgDetMain',
        alt: 'ABC Preschool Logo'
      },
      {
        name: 'KIDS Clothing',
        src: 'https://www.lego.com/cdn/cs/history/assets/blt34fefa5d891cd982/logo_1973.JPG?disable=upscale&width=1056&quality=50',
        alt: 'KIDS Clothing Logo'
      },
      {
        name: 'First Steps',
        src: 'https://th.bing.com/th/id/OIP.wIgzC4OZGRhwwqMYMmJn_wHaC-?rs=1&pid=ImgDetMain',
        alt: 'First Steps Logo'
      },
      {
        name: 'Boss Baby',
        src: 'https://th.bing.com/th/id/OIP.wIgzC4OZGRhwwqMYMmJn_wHaC-?rs=1&pid=ImgDetMain',
        alt: 'Boss Baby Logo'
      }
    ];
  </script>
  
  <section class="bg-primary text-white py-16 relative overflow-hidden">
    <!-- <div class="absolute top-0 right-0 w-1/3 h-1/3">
      <div class="absolute top-0 right-0 w-full h-full bg-pink-200 rounded-bl-[100%]"></div>
    </div>
    <div class="absolute bottom-0 left-0 w-1/3 h-1/3">
      <div class="absolute bottom-0 left-0 w-full h-full bg-pink-200 rounded-tr-[100%]"></div>
    </div> -->
  <div class="mx-auto px-4 md:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Text Content -->
      <div class="z-10">
        <h2 class="text-5xl font-bold mb-6">CHARACTER SHOP</h2>
        <p class="text-lg mb-8 text-gray-300">
          Find the latest and greatest characters at our Character Shop. 
          With dozens of characters from TV, movies and more, 
          we're sure to have your favorites.
        </p>
        <button class="btn btn-secondary">
          SHOP CATEGORIES
        </button>
      </div>

      <!-- Image -->
      <div class="relative">
        <div class="absolute inset-0 bg-secondary opacity-50 rounded-full"></div>
        <img 
          src="/img/Toy-Names-For-Kids.webp" 
          alt="Character toys" 
          class="relative z-10 rounded-lg"
        />
      </div>
    </div>

    <!-- Brand Logos -->
    <div class="mt-16 grid grid-cols-2 md:grid-cols-5 gap-8">
      {#each brands as brand}
        <div class="flex justify-center  items-center">
          <img 
            src={brand.src} 
            alt={brand.name}
            class="h-12 opacity-70 z-10 hover:opacity-100 transition-opacity"
          />
        </div>
      {/each}
    </div>
  </div>

  <!-- Decorative Elements -->
  <div class="absolute top-0 right-0 w-1/3 h-1/3 bg-secondary opacity-50 rounded-bl-full"></div>
  <div class="absolute bottom-0 left-0 w-1/3 h-1/3 bg-secondary opacity-50  rounded-tr-full"></div>
</section>
  
