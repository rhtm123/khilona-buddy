<script>
  import { addToCart, cart } from '$lib/stores/cart';
  import { toggleWishlistItem, wishlistIds } from '$lib/stores/wishlist';
  
  let { service } = $props();
  console.log(service);
  let isWishlisted = $derived($wishlistIds.has(service.id));

  // Cart quantity logic
  let cartItem = $derived($cart.find(item => item.id === service.id));
  let inCart = $derived(!!cartItem);
  let cartQuantity = $derived(cartItem ? cartItem.quantity : 0);

  function handleWishlistClick(event) {
    event.stopPropagation();
    toggleWishlistItem(service);
  }

  function handleBookService() {
    addToCart(service);
  }

  function handleIncrement() {
    if (cartQuantity < (service.buy_limit || 5)) {
      cart.update(items => items.map(item => item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item));
    }
  }
  
  function handleDecrement() {
    if (cartQuantity > 1) {
      cart.update(items => items.map(item => item.id === service.id ? { ...item, quantity: item.quantity - 1 } : item));
    }
  }
  
  function handleRemove() {
    cart.update(items => items.filter(item => item.id !== service.id));
  }

  // Calculate discount percentage
  let discountPercentage = $derived(
    service.mrp && service.price ? Math.round(((service.mrp - service.price) / service.mrp) * 100) : 0
  );

  // Format price for display (convert from paise to rupees)
  let displayPrice = $derived(service.price);
  let displayMrp = $derived(service.mrp);
</script>

<!-- Compact Service Card for Grid Layout -->
<div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 hover:border-blue-200 h-full flex flex-col">
  
  <!-- Service Image Section -->
  <div class="relative h-32 overflow-hidden">
    <img 
      src={service.main_image || service.thumbnail || "/placeholder.svg?height=128&width=200"} 
      alt={service.name}
      class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
    />
    
    <!-- Top Badges -->
    <div class="absolute top-2 left-2 flex gap-1">
      {#if discountPercentage > 0}
        <span class="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded shadow-sm">
          {discountPercentage}% OFF
        </span>
      {/if}
      {#if service.approved}
        <span class="bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded shadow-sm">
          ✓
        </span>
      {/if}
    </div>

    <!-- Wishlist Button -->
    <button
      class="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 shadow-sm hover:shadow-md transition-all duration-200 {isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}"
      onclick={handleWishlistClick}
      aria-label="Toggle wishlist"
    >
      <svg class="w-3 h-3" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  </div>

  <!-- Service Content -->
  <div class="p-3 flex flex-col flex-1">
    
    <!-- Service Title -->
    <div class="mb-2">
      <a href="/service/{service.slug}" class="block hover:text-blue-600 transition-colors">
        <h3 class="font-medium text-sm text-gray-900 line-clamp-2 leading-tight">
          {service.name}
        </h3>
      </a>
      {#if service.category}
        <span class="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-1 inline-block">
          {service.category.name}
        </span>
      {/if}
    </div>

    <!-- Service Provider -->
    {#if service.brand}
      <div class="mb-2 flex items-center gap-2">
        <div class="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
          <span class="text-blue-600 font-bold text-xs">
            {service.brand.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <span class="text-xs text-gray-600 truncate">{service.brand.name}</span>
        {#if service.approved}
          <svg class="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        {/if}
      </div>
    {/if}

    <!-- Rating and Availability -->
    <div class="mb-2 flex items-center justify-between">
      {#if service.rating > 0}
        <div class="flex items-center gap-1">
          <svg class="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          <span class="text-xs font-medium text-gray-700">{service.rating}</span>
          {#if service.review_count > 0}
            <span class="text-xs text-gray-500">({service.review_count})</span>
          {/if}
        </div>
      {/if}
      
      <span class="text-xs {service.stock > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-1.5 py-0.5 rounded">
        {service.stock > 0 ? 'Available' : 'Unavailable'}
      </span>
    </div>

    <!-- Pricing Section -->
    <div class="mt-auto">
      <div class="mb-2">
        <div class="flex items-baseline gap-1">
          <span class="text-lg font-bold text-gray-900">₹{displayPrice}</span>
          {#if displayMrp && displayMrp > displayPrice}
            <span class="text-xs text-gray-500 line-through">₹{displayMrp}</span>
          {/if}
        </div>
        <span class="text-xs text-gray-500">per service</span>
      </div>

      <!-- Book Service Button -->
      <div class="w-full">
        {#if service.stock <= 0}
          <button 
            class="w-full bg-gray-400 text-white font-medium py-2 px-3 rounded text-xs cursor-not-allowed"
            disabled
          >
            Unavailable
          </button>
        {:else if inCart}
          <div class="flex items-center justify-center bg-green-50 border border-green-500 rounded px-2 py-1.5 gap-2">
            <button 
              class="w-5 h-5 flex items-center justify-center text-green-600 hover:bg-green-100 rounded-full transition-colors"
              onclick={cartQuantity > 1 ? handleDecrement : handleRemove}
              aria-label={cartQuantity > 1 ? 'Decrement quantity' : 'Remove from cart'}
            >
              {#if cartQuantity === 1}
                <svg class="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              {:else}
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                </svg>
              {/if}
            </button>
            <span class="font-bold text-green-600 text-sm min-w-[1rem] text-center">{cartQuantity}</span>
            <button 
              class="w-5 h-5 flex items-center justify-center text-green-600 hover:bg-green-100 rounded-full transition-colors"
              onclick={handleIncrement}
              disabled={cartQuantity >= (service.buy_limit || 5)}
              aria-label="Increment quantity"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </button>
          </div>
        {:else}
          <button 
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-3 rounded transition-colors text-xs"
            onclick={handleBookService}
          >
            BOOK NOW
          </button>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
