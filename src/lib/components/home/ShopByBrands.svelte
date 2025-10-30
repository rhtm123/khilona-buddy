<script>  
    export let brands;
  </script>
  
  <section class="py-8 md:py-16 mx-auto px-4 md:px-8 lg:px-16 bg-fun-gradient relative overflow-hidden">
    <!-- Background decorations -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-8 left-8 w-16 h-16 bg-accent/20 rounded-full animate-bounce-gentle" style="animation-delay: 0.3s;"></div>
      <div class="absolute bottom-8 right-8 w-20 h-20 bg-primary/15 rounded-full animate-float" style="animation-delay: 0.7s;"></div>
      <div class="absolute top-1/2 left-1/3 w-12 h-12 bg-secondary/25 rounded-full animate-wiggle" style="animation-delay: 1.2s;"></div>
    </div>
    
    <div class="relative mb-10">
      <div class="flex items-center justify-between">
        <div class="relative">
          <h2 class="text-lg md:text-2xl lg:text-3xl font-bold mb-3 font-['Comic_Neue']">
            <span class="inline-block animate-bounce-gentle mr-2 text-2xl">🏆</span>
            <span class="text-gray-800">Shop From</span>
            <span class="text-gray-800 font-black">Trusted Brands</span>
            <span class="inline-block animate-wiggle ml-2 text-2xl">✨</span>
          </h2>
          <div class="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-full animate-bounce-gentle"></div>
        </div>
        <a href="/shop" class="glass-toy text-primary font-bold text-base md:text-lg px-4 py-2 rounded-full shadow-toy hover:shadow-fun transition-all transform hover:scale-105 flex items-center gap-2 animate-bounce-gentle">
          <span class="text-lg">🛒</span>
          View All
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 animate-wiggle" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </a>
      </div>
    </div>

      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 md:gap-8">
        {#each brands as brand, index}
          <a
            href={"/shop/?brand_ids="+brand.id}
            class="group flex flex-col items-center space-y-4 transform transition-all duration-500 hover:scale-110"
            style="animation-delay: {index * 0.1}s;"
          >
            <div class="w-full aspect-square relative">
              <!-- Fun brand background -->
              <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-white via-base-200 to-white group-hover:from-primary/10 group-hover:via-accent/10 group-hover:to-secondary/10 transition-all duration-500 shadow-toy group-hover:shadow-fun"></div>
              
              <!-- Glass overlay -->
              <div class="absolute inset-1 rounded-2xl glass-toy group-hover:bg-white/50 transition-all duration-300"></div>
              
              <div class="relative w-full h-full p-4 flex items-center justify-center">
                <img 
                  src={brand?.logo || `/placeholder.svg`}
                  alt={brand.name}
                  class="w-[75%] h-[75%] object-contain transform transition-all duration-500 group-hover:scale-110 group-hover:animate-bounce-gentle"
                  loading="lazy"
                />
                
                <!-- Brand sparkles -->
                <div class="absolute top-2 right-2 w-3 h-3 bg-warning rounded-full animate-sparkle opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div class="absolute bottom-2 left-2 w-2 h-2 bg-accent rounded-full animate-sparkle opacity-0 group-hover:opacity-80 transition-opacity duration-300" style="animation-delay: 0.5s;"></div>
              </div>
            </div>
            
            <span class="text-sm md:text-base text-center text-gray-700 group-hover:text-primary transition-all duration-300 font-bold font-['Nunito'] group-hover:animate-wiggle">
              {brand.name}
            </span>
          </a>
        {/each}
      </div>
  </section>
  
  <style>

  </style>