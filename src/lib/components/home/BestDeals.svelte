<script>
  import Product from "../product/Product.svelte";
  import Slider from "../Slider.svelte";
  export let products;

</script>

<section class="bg-toy-gradient mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-20 relative overflow-hidden">
  <!-- Fun background decorations -->
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute top-5 left-5 w-20 h-20 bg-warning/20 rounded-full animate-bounce-gentle opacity-40"></div>
    <div class="absolute top-20 right-10 w-16 h-16 bg-accent/30 rounded-full animate-float opacity-50" style="animation-delay: 0.8s;"></div>
    <div class="absolute bottom-10 left-20 w-24 h-24 bg-secondary/20 rounded-full animate-wiggle opacity-30" style="animation-delay: 1.2s;"></div>
    <div class="absolute bottom-5 right-5 w-12 h-12 bg-primary/25 rounded-full animate-bounce-gentle opacity-60" style="animation-delay: 0.4s;"></div>
    
    <!-- Sparkle effects -->
    <div class="absolute top-1/3 left-1/3 w-4 h-4 bg-warning rounded-full animate-sparkle" style="animation-delay: 0.3s;"></div>
    <div class="absolute top-2/3 right-1/4 w-3 h-3 bg-accent rounded-full animate-sparkle" style="animation-delay: 1.1s;"></div>
    <div class="absolute top-1/2 left-3/4 w-2 h-2 bg-primary rounded-full animate-sparkle" style="animation-delay: 1.8s;"></div>
  </div>
  
  <div class="relative mb-12">
    <div class="flex items-center justify-between">
      <div class="relative">
        <h2 class="text-2xl md:text-3xl lg:text-4xl text-gray-900 font-black mb-4 leading-tight">
          <span class="text-orange-500">🔥</span>
          <span class="mr-3">Grab the</span>
          <span class="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent font-black">
            Amazing Deals
          </span>
          <span class="text-orange-500 ml-3">💰</span>
        </h2>
        <p class="text-gray-700 text-lg md:text-xl font-bold mb-4">
          <span class="text-yellow-500">✨</span> Super savings on the coolest toys! <span class="text-yellow-500">✨</span>
        </p>
        <div class="absolute -bottom-2 left-0 w-full h-2 bg-gradient-to-r from-primary via-warning to-secondary rounded-full animate-rainbow"></div>
      </div>
      <a href="/shop" class="glass-toy text-primary font-bold text-base md:text-xl px-6 py-3 rounded-full shadow-fun hover:shadow-toy transition-all transform hover:scale-110 flex items-center gap-3 animate-bounce-gentle">
        <span class="text-xl">🎯</span>
        View All Deals
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 animate-wiggle" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </a>
    </div>
  </div>

  <div class="relative py-8 pt-12">
    <Slider items={products} let:items>
      {#each products as product, index (product.id)}
        <div class="item w-3/4 sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 flex-shrink-0 px-3">
          <div class="transform transition-all duration-500 hover:scale-105 animate-bounce-gentle mx-2" style="animation-delay: {index * 0.2}s;">
            <div class="relative group">
              <!-- Fun glow effect -->
              <div class="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-500 animate-rainbow"></div>
              <div class="relative bg-white rounded-xl shadow-toy group-hover:shadow-fun transition-all duration-300">
                <Product product={product} />
              </div>
              
              <!-- Sparkle effects -->
              <div class="absolute -top-2 -right-2 w-6 h-6 bg-warning rounded-full animate-sparkle opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="absolute -bottom-2 -left-2 w-4 h-4 bg-accent rounded-full animate-sparkle opacity-0 group-hover:opacity-80 transition-opacity duration-300" style="animation-delay: 0.5s;"></div>
            </div>
          </div>
        </div>
      {/each}
    </Slider>
  </div>

</section>

