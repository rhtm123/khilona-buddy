<script>
  // import { onMount } from 'svelte';
  import { addToCart } from '../../stores/cart';
  // import { myFetch } from '$lib/utils/myFetch';
  // import { PUBLIC_API_URL } from '$env/static/public';

  import Product from '../product/Product.svelte';  
  import Slider from '../Slider.svelte';

  export let products;
//  console.log(products)

  // async function fetchProductListings() {
  //   let url = PUBLIC_API_URL + "/product/product-listings/?page=1&page_size=24&ordering=-popularity";
  //   console.log(url);
  //   try {
  //     let data = await myFetch(url);
  //     // console.log(data);
  //     products = data.results;

  //   } catch (e) {
  //     console.log(e, "Error fetching data");
  //   }
  // }

  // onMount(() => {
  //   fetchProductListings();
  // });

  function handleAddToCart(product) {
    addToCart(product);
  }

</script>

<section class="bg-toy-gradient mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-20 relative overflow-hidden">
  <!-- Background fun elements -->
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute top-10 left-10 w-24 h-24 bg-secondary/20 rounded-full animate-float opacity-30" style="animation-delay: 0.5s;"></div>
    <div class="absolute top-20 right-20 w-16 h-16 bg-primary/25 rounded-full animate-bounce-gentle opacity-40" style="animation-delay: 1s;"></div>
    <div class="absolute bottom-20 left-1/3 w-20 h-20 bg-accent/20 rounded-full animate-wiggle opacity-35" style="animation-delay: 1.5s;"></div>
    <div class="absolute bottom-10 right-10 w-12 h-12 bg-warning/30 rounded-full animate-bounce-gentle opacity-50" style="animation-delay: 0.3s;"></div>
  </div>
  
  <div class="relative mb-12">
    <div class="flex items-center justify-between">
      <div class="relative">
        <h2 class="text-xl md:text-3xl lg:text-4xl font-bold mb-4 font-['Comic_Neue'] leading-tight">
          <span class="inline-block animate-wiggle mr-3 text-2xl md:text-4xl">🌟</span>
          <span class="text-gray-800">Discover Our</span>
          <span class="text-gray-800 font-black">
            Best Selling Toys
          </span>
          <span class="inline-block animate-bounce-gentle ml-3 text-2xl md:text-4xl">🏅</span>
        </h2>
        <p class="text-gray-600 text-base md:text-lg font-semibold mb-2">
          🔥 The toys every kid is asking for! 🔥
        </p>
        <div class="absolute -bottom-2 left-0 w-full h-2 bg-gradient-to-r from-secondary via-primary to-accent rounded-full animate-rainbow"></div>
      </div>
      <a href="/shop" class="glass-toy text-primary font-bold text-base md:text-xl px-6 py-3 rounded-full shadow-fun hover:shadow-toy transition-all transform hover:scale-110 flex items-center gap-3 animate-bounce-gentle">
        <span class="text-xl">🎆</span>
        View All
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
          <div class="transform transition-all duration-500 hover:scale-105 animate-float mx-2" style="animation-delay: {index * 0.2}s;">
            <div class="relative group">
              <!-- Bestseller glow -->
              <div class="absolute -inset-1 bg-gradient-to-r from-warning via-primary to-accent rounded-xl blur opacity-0 group-hover:opacity-40 transition duration-500 animate-rainbow"></div>
              <div class="relative bg-white rounded-xl shadow-fun group-hover:shadow-toy transition-all duration-300">
                <Product product={product} />
                
                <!-- Bestseller badge -->
                <div class="absolute -top-2 -right-2 bg-gradient-to-r from-warning to-accent text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce-gentle shadow-fun">
                  🏆 #1
                </div>
              </div>
              
              <!-- Success sparkles -->
              <div class="absolute -top-2 -left-2 w-6 h-6 bg-success rounded-full animate-sparkle opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="absolute -bottom-2 -right-2 w-4 h-4 bg-warning rounded-full animate-sparkle opacity-0 group-hover:opacity-80 transition-opacity duration-300" style="animation-delay: 0.5s;"></div>
            </div>
          </div>
        </div>
      {/each}
    </Slider>
  </div>
</section>
