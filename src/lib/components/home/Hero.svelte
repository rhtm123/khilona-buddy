<script>
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { addToCart } from '$lib/stores/cart';
  import { toggleWishlistItem, wishlistIds } from '$lib/stores/wishlist';
  import { addAlert } from '$lib/stores/alert';

  export let slides;
  let currentSlide = 0;
  let interval;
  let isHovering = false;
  let isAddingToCart = false;
  let isTogglingWishlist = false;
  
  // Use reactive statement for wishlist IDs
  $: currentWishlistIds = $wishlistIds;

  onMount(() => {
    startAutoplay();
    return () => {
      clearInterval(interval);
    };
  });

  function startAutoplay() {
    if (!isHovering) {
      interval = setInterval(() => nextSlide(), 5000);
    }
  }

  function stopAutoplay() {
    clearInterval(interval);
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  }

  function calculateDiscount(mrp, price) {
    if (!mrp || !price || mrp <= price) return null;
    return Math.round(((mrp - price) / mrp) * 100);
  }

  function goToSlide(index) {
    currentSlide = index;
  }

  async function handleToggleWishlist(product) {
    if (isTogglingWishlist) return;
    
    isTogglingWishlist = true;
    const isCurrentlyInWishlist = currentWishlistIds.has(product.id);
    toggleWishlistItem(product);
    
    if (isCurrentlyInWishlist) {
      addAlert('Removed from Wishlist', 'info');
    } else {
      addAlert('Added to Wishlist ❤️', 'success');
    }
    
    // Reset animation state after a brief delay
    setTimeout(() => {
      isTogglingWishlist = false;
    }, 600);
  }

  function isInWishlist(productId) {
    return currentWishlistIds.has(productId);
  }

  async function handleAddToCart(product) {
    if (isAddingToCart) return;
    
    isAddingToCart = true;
    addToCart(product);
    
    // Reset animation state after a brief delay
    setTimeout(() => {
      isAddingToCart = false;
    }, 600);
  }

  function buyNow(slug) {
    goto(`/product/${slug}`);
  }
</script>
<div class="relative min-h-[85vh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
  <!-- Modern background pattern -->
  <div class="absolute inset-0">
    <div class="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
    <div class="absolute top-40 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
    <div class="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
  </div>

  <!-- Left Arrow -->
  <button 
    class="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-gray-200"
    on:click={prevSlide}
    aria-label="Previous Product"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
  </button>
  
  <!-- Right Arrow -->
  <button 
    class="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-gray-200"
    on:click={nextSlide}
    aria-label="Next Product"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  </button>

  <!-- Premium trust bar -->
  <div class="absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-3 z-30 shadow-lg">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-center space-x-8 text-sm font-semibold">
        <div class="flex items-center space-x-2 hover:scale-105 transition-transform">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>
          </svg>
          <span>Best Price Guarantee</span>
        </div>
        <div class="hidden md:flex items-center space-x-2 hover:scale-105 transition-transform">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <span>100% Safe & Certified</span>
        </div>
        <div class="hidden lg:flex items-center space-x-2 hover:scale-105 transition-transform">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path>
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"></path>
          </svg>
          <span>Free Shipping on ₹500+</span>
        </div>
      </div>
    </div>
  </div>

  <div class="relative z-10 container mx-auto px-4 md:px-8 lg:px-12 pt-20 pb-12">
    {#if slides.length > 0}
      <!-- Premium Hero Layout -->
      <div class="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto min-h-[70vh]">
        <!-- Left: Product Info -->
        <div class="order-2 lg:order-1">
          <div 
            in:fly={{ y: 30, duration: 600, delay: 200 }}
          >
            <!-- Premium Badges -->
            <div class="flex flex-wrap gap-3 mb-4">
              {#if calculateDiscount(slides[currentSlide].mrp, slides[currentSlide].price)}
                <span class="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-bold rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"></path>
                  </svg>
                  {calculateDiscount(slides[currentSlide].mrp, slides[currentSlide].price)}% OFF
                </span>
              {/if}
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border-2 border-amber-200">
                ⭐ BESTSELLER
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-200">
                ✓ Certified Safe
              </span>
            </div>

            <!-- Product Title -->
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
              {slides[currentSlide].name}
            </h1>
            
            <!-- Rating -->
            <div class="flex items-center gap-4 mb-6">
              <div class="flex items-center gap-1">
                {#each Array(5) as _, i}
                  <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                {/each}
              </div>
              <span class="text-base font-bold text-gray-900">{slides[currentSlide].rating || '4.8'}</span>
              <span class="text-sm text-gray-500">({slides[currentSlide].review_count}+ reviews)</span>
            </div>

            <!-- Description -->
            <p class="text-lg text-gray-600 leading-relaxed mb-6">
              {slides[currentSlide].description}
            </p>

            <!-- Price Section -->
            <div class="flex items-baseline gap-4 mb-8">
              <span class="text-5xl md:text-6xl font-black text-gray-900">
                {formatPrice(slides[currentSlide].price)}
              </span>
              {#if slides[currentSlide].mrp > slides[currentSlide].price}
                <div class="flex flex-col">
                  <span class="text-2xl text-gray-400 line-through font-semibold">
                    {formatPrice(slides[currentSlide].mrp)}
                  </span>
                  <span class="text-sm text-green-600 font-bold">
                    You save ₹{slides[currentSlide].mrp - slides[currentSlide].price}
                  </span>
                </div>
              {/if}
            </div>
            
            <!-- Stock Status -->
            <div class="flex items-center gap-2 mb-8">
              <div class="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span class="text-green-700 font-semibold text-sm">In Stock - Ready to Ship</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-4">
              <!-- Primary Buttons -->
              <div class="flex gap-4">
                <button 
                  on:click={() => buyNow(slides[currentSlide].slug)}
                  class="flex-1 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Buy Now
                </button>
                <button 
                  on:click={() => handleAddToCart(slides[currentSlide])}
                  disabled={isAddingToCart}
                  class="flex-1 px-8 py-4 bg-white hover:bg-gray-50 text-indigo-600 text-lg font-bold rounded-xl border-2 border-indigo-600 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed relative overflow-hidden {isAddingToCart ? 'animate-pulse' : ''}"
                >
                  <span class="relative z-10 flex items-center justify-center gap-2">
                    {#if isAddingToCart}
                      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    {:else}
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      Add to Cart
                    {/if}
                  </span>
                  {#if isAddingToCart}
                    <span class="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 animate-pulse"></span>
                  {/if}
                </button>
              </div>
              
              <!-- Secondary Button -->
              <button 
                on:click={() => handleToggleWishlist(slides[currentSlide])}
                disabled={isTogglingWishlist}
                class="w-full px-8 py-3 bg-white hover:bg-pink-50 border-2 transition-all rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.01] disabled:opacity-75 disabled:cursor-not-allowed relative overflow-hidden {isInWishlist(slides[currentSlide].id) ? 'border-pink-500 text-pink-600' : 'border-gray-300 text-gray-700'} {isTogglingWishlist ? 'scale-95' : ''}"
              >
                <span class="flex items-center justify-center gap-2 font-semibold relative z-10">
                  <svg class="w-5 h-5 transition-all duration-300 {isInWishlist(slides[currentSlide].id) ? 'fill-current scale-110' : ''} {isTogglingWishlist ? 'animate-bounce' : ''}" fill="{isInWishlist(slides[currentSlide].id) ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  {isInWishlist(slides[currentSlide].id) ? 'Saved to Wishlist' : 'Add to Wishlist'}
                </span>
                {#if isTogglingWishlist}
                  <span class="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-red-500/10 animate-pulse"></span>
                {/if}
              </button>
            </div>
            
            <!-- Trust Indicators -->
            <div class="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-200">
              <div class="text-center">
                <div class="text-2xl mb-1">🚚</div>
                <div class="text-xs font-semibold text-gray-700">Free Shipping</div>
              </div>
              <div class="text-center">
                <div class="text-2xl mb-1">🔒</div>
                <div class="text-xs font-semibold text-gray-700">Secure Payment</div>
              </div>
              <div class="text-center">
                <div class="text-2xl mb-1">↩️</div>
                <div class="text-xs font-semibold text-gray-700">Easy Returns</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Premium Product Showcase -->
        <div class="order-1 lg:order-2 relative" in:fly={{ x: 50, duration: 600, delay: 400 }}>
          {#each slides as slide, i}
            <div 
              class="transition-all duration-700 {currentSlide === i ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute inset-0 pointer-events-none'}"
            >
              <div class="relative group">
                <!-- Discount Badge -->
                {#if calculateDiscount(slide.mrp, slide.price)}
                  <div class="absolute -top-4 -left-4 z-20 bg-gradient-to-br from-red-500 to-pink-600 text-white px-6 py-3 rounded-2xl shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform">
                    <div class="text-2xl font-black">{calculateDiscount(slide.mrp, slide.price)}%</div>
                    <div class="text-xs font-bold">OFF</div>
                  </div>
                {/if}
                
                <!-- Main Product Card -->
                <div class="relative bg-gradient-to-br from-white via-gray-50 to-indigo-50 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden p-8 md:p-12 hover:shadow-3xl transition-all duration-500">
                  <!-- Background decoration -->
                  <div class="absolute inset-0 bg-gradient-to-br from-indigo-100/30 via-transparent to-purple-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <!-- Product Image -->
                  <div class="relative z-10 mb-6">
                    <img 
                      src={slide?.main_image || "/placeholder.svg"} 
                      alt={slide?.name}
                      loading="lazy"
                      class="w-full h-[450px] md:h-[550px] object-contain transform group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  
                  <!-- Quick Info Bar -->
                  <div class="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div class="flex items-center justify-between gap-4">
                      <div class="flex-1">
                        <div class="text-sm font-semibold text-gray-500 mb-1">Featured Product</div>
                        <div class="text-xl font-bold text-gray-900 line-clamp-1">{slide.name}</div>
                      </div>
                      <a 
                        href={"/product/"+slide.slug}
                        class="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
                        aria-label="View product details"
                      >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Navigation Indicators -->
      {#if slides.length > 1}
        <div class="flex justify-center mt-8">
          <div class="flex items-center gap-3 bg-white/95 backdrop-blur-lg rounded-full px-6 py-3 shadow-xl border border-gray-200">
            {#each slides as _, i}
              <button
                class="transition-all duration-300 rounded-full {currentSlide === i ? 'w-10 h-3 bg-gradient-to-r from-indigo-600 to-purple-600' : 'w-3 h-3 bg-gray-300 hover:bg-indigo-400'}"
                on:click={() => goToSlide(i)}
                aria-label="Go to slide {i + 1}"
              >
              </button>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }

  .animate-blob {
    animation: blob 7s infinite;
  }

  .animation-delay-2000 {
    animation-delay: 2s;
  }

  .animation-delay-4000 {
    animation-delay: 4s;
  }

  .backdrop-blur-lg {
    backdrop-filter: blur(16px);
  }
  
  .backdrop-blur-sm {
    backdrop-filter: blur(8px);
  }

  .shadow-3xl {
    box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
  }

  .line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
</style>
