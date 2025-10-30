<script>
  export let categories;
</script>

<section class="py-8 md:py-16 mx-auto px-4 md:px-8 lg:px-16 bg-fun-gradient relative overflow-hidden">
  <!-- Floating background elements -->
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute top-10 right-10 w-32 h-32 bg-primary/10 rounded-full animate-float" style="animation-delay: 0.5s;"></div>
    <div class="absolute bottom-10 left-10 w-24 h-24 bg-secondary/10 rounded-full animate-bounce-gentle" style="animation-delay: 1s;"></div>
    <div class="absolute top-1/2 right-1/4 w-16 h-16 bg-accent/15 rounded-full animate-wiggle" style="animation-delay: 1.5s;"></div>
  </div>
  
  <div class="relative mb-10">
    <div class="flex items-center justify-between">
      <div class="relative">
        <h2 class="text-lg md:text-2xl lg:text-3xl font-bold mb-3 font-['Comic_Neue']">
          <span class="inline-block animate-wiggle mr-2">🎠</span>
          <span class="text-gray-800">Explore Our</span>
          <span class="relative inline-block align-middle">
            <span class="text-gray-800 font-black">Toy Categories</span>
          </span>
          <span class="inline-block animate-wiggle ml-2">🧸</span>
        </h2>
        <div class="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-full animate-bounce-gentle"></div>
      </div>
      <a href="/shop" class="glass-toy text-primary font-bold text-base md:text-lg px-4 py-2 rounded-full shadow-toy hover:shadow-fun transition-all transform hover:scale-105 flex items-center gap-2 animate-bounce-gentle">
        <span>🛒</span>
        View All
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 animate-wiggle" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </a>
    </div>
  </div>
  
    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 md:gap-8">
      {#each categories as category, index}
        <a
          href={"/shop/"+category.slug}
          class="group flex flex-col items-center space-y-4 transform transition-all duration-500 hover:scale-110"
          style="animation-delay: {index * 0.1}s;"
        >
          <div class="w-full aspect-square relative">
            <!-- Magical glow background -->
            <div class="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 group-hover:from-primary/40 group-hover:via-accent/40 group-hover:to-secondary/40 transition-all duration-500 animate-bounce-gentle group-hover:animate-wiggle"></div>
            
            <!-- Glass morphism overlay -->
            <div class="absolute inset-2 rounded-full glass-toy group-hover:bg-white/40 transition-all duration-300"></div>
            
            <!-- Image container with fun effects -->
            <div class="relative w-full h-full p-4 flex items-center justify-center">
              <img 
                src={category.image || "/placeholder.svg"} 
                alt={category.name}
                class="w-[75%] h-[75%] object-contain transform transition-all duration-500 group-hover:scale-110 group-hover:animate-float"
                loading="lazy"
              />
              
              <!-- Sparkle effects -->
              <div class="absolute top-2 right-2 w-3 h-3 bg-accent rounded-full animate-sparkle opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="absolute bottom-2 left-2 w-2 h-2 bg-primary rounded-full animate-sparkle opacity-0 group-hover:opacity-80 transition-opacity duration-300" style="animation-delay: 0.5s;"></div>
            </div>
            
            <!-- Fun border effect -->
            <div class="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-primary group-hover:to-secondary transition-all duration-300"></div>
          </div>
          
          <span class="text-sm md:text-base text-center text-gray-700 group-hover:text-primary transition-all duration-300 font-bold font-['Nunito'] group-hover:animate-bounce-gentle">
            {category.name}
          </span>
        </a>
      {/each}
    </div>
</section>