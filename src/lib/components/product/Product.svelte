<script>
  import { addToCart, cart } from '../../stores/cart';
  import { toggleWishlistItem, wishlistIds } from '../../stores/wishlist';
  import { addAlert } from '$lib/stores/alert';
  import Icon from '@iconify/svelte';
  
  export let product;
  $: isWishlisted = $wishlistIds.has(product.id);

  // Cart quantity logic
  let quantity = 1;
  let showQtyControls = false;

  // Use $cart for reactivity
  $: cartItem = $cart.find(item => item.id === product.id);
  $: inCart = !!cartItem;
  $: cartQuantity = cartItem ? cartItem.quantity : 0;
  $: showQtyControls = inCart;
  $: if (inCart && cartQuantity !== quantity) quantity = cartQuantity;

  function handleWishlistClick(event) {
    event.stopPropagation(); 
    event.preventDefault();
    toggleWishlistItem(product);
  }

  function calculateDiscount(mrp, price) {
    if (!mrp || !price || mrp <= price) return null;
    return Math.round(((mrp - price) / mrp) * 100);
  }

  $: discount = calculateDiscount(product.mrp, product.price);
  $: savingsAmount = product.mrp - product.price;
  $: isHot = (product?.rating ?? 0) >= 4.5 || product?.popularity > 0;

  function handleAddToCart() {
    addToCart(product);
    quantity = 1;
    showQtyControls = true;
  }

  function handleIncrement() {
    if (cartQuantity < 10) {
      cart.update(items => items.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    }
  }
  
  function handleDecrement() {
    if (cartQuantity > 1) {
      cart.update(items => items.map(item => item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item));
    }
  }
  
  function handleRemove() {
    cart.update(items => items.filter(item => item.id !== product.id));
  }
</script>

<div class="bg-base-100 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-out group h-full flex flex-col relative overflow-hidden hover:-translate-y-1 mt-4">
  
  <!-- Product Image with Badges -->
  <a href="/product/{product.slug}" class="block w-full h-full">

  <div class="relative aspect-square bg-gradient-to-br from-base-200 via-base-100 to-base-300 overflow-hidden">
    <!-- Stacked Badges (HOT/Sale) -->
    {#if isHot}
      <div class="absolute top-3 left-3 z-20 flex flex-col gap-2">
        <span class="px-2 py-1 text-[10px] font-extrabold rounded-full bg-primary text-white shadow-md">HOT 🔥</span>
        {#if discount}
          <span class="px-2 py-1 text-[10px] font-bold rounded-full bg-accent text-neutral shadow-md">SALE</span>
        {/if}
      </div>
    {:else if discount}
      <div class="absolute top-3 left-3 z-20">
        <span class="px-2 py-1 text-[10px] font-bold rounded-full bg-accent text-neutral shadow-md">SALE</span>
      </div>
    {/if}

    <!-- Wishlist Button -->
    <button
      class="absolute top-3 right-3 z-20 p-2 rounded-full bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 {isWishlisted ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-primary'}"
      on:click={handleWishlistClick}
      aria-label="Toggle wishlist"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>

    <!-- Product Image -->
    <img 
      src={product.main_image || product.category?.image || "/placeholder.svg?height=150&width=150"} 
      alt={product.name}
      class="w-full h-full object-cover transform transition-transform duration-500 ease-out group-hover:scale-105"
      loading="lazy"
    />

    {#if product.variant?.name || product.unit_size}
      <div class="absolute bottom-3 left-3 z-10">
        <div class="bg-white text-gray-800 text-xs font-semibold px-3 py-1 rounded-lg shadow-lg border border-gray-200">
          {#if product?.variant_name}
            {product.variant_name}
          {/if}
          {#if product.unit_size && product.size_unit}
            <span class="ml-1 text-gray-600">
              {Number(product.unit_size) % 1 === 0 ? parseInt(product.unit_size) : product.unit_size}{product.size_unit} {product.units_per_pack>1?`x${product.units_per_pack}`:''}
            </span>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Hover overlay + Quick View CTA -->
    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div class="opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        <div class="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-white shadow-lg">
          <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
            <!-- Eye icon -->
            <svg class="h-4 w-4 group-hover:animate-wiggle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
          </span>
          <span class="text-sm font-semibold">Quick View</span>
        </div>
      </div>
    </div>
  </div>
  </a>

  <!-- Product Info -->
  <div class="p-4 flex flex-col flex-1 relative z-10">
    <a href="/product/{product.slug}" class="block flex-1">
      <h3 class="font-semibold text-gray-900 text-sm leading-snug mb-3 line-clamp-2 min-h-[2.5rem] group-hover:text-secondary transition-colors">
        {product.name}
      </h3>
    </a>

    <div class="mt-auto space-y-3">
      <!-- Brand and Rating -->
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-500 truncate font-medium">
            {product.brand?.name || 'Brand'}
          </p>
        </div>

        {#if product.rating}
          {#if (Number(product.rating) > 0)}
          <div class="flex items-center gap-1 ml-2">
            <div class="flex items-center gap-0.5">
              {#each Array(Math.min(5, Math.floor(Number(product.rating)))) as _, i}
                <svg class="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              {/each}
            </div>
            {#if product.review_count}
              <span class="text-xs text-gray-500">({product.review_count})</span>
            {/if}
          </div>
          {/if}
        {/if}
      </div>

      <!-- Price and Add Button Row -->
      <div class="flex items-end justify-between">
        <div class="flex flex-col">
          <span class="text-lg font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
          {#if product.mrp && product.mrp > product.price}
            <span class="text-gray-400 text-sm line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
          {/if}
        </div>

        <!-- Add to Cart Controls -->
        <div class="ml-2">
          {#if product.stock == 0}
            <span class="text-primary text-sm font-semibold border border-primary/20 bg-primary/10 px-3 py-2 rounded-lg">Out of Stock</span>
          {:else if showQtyControls}
            <div class="flex items-center border-2 border-secondary/30 rounded-xl px-2 py-1 gap-2 bg-secondary/10">
              <button 
                class="w-6 h-6 flex items-center justify-center text-secondary hover:bg-secondary/20 rounded-lg transition-colors"
                on:click={cartQuantity > 1 ? handleDecrement : handleRemove}
                aria-label={cartQuantity === 1 ? 'Remove item from cart' : 'Decrease quantity'}
              >
                {#if cartQuantity === 1}
                  <Icon icon="mdi:delete-outline" class="text-primary" width="14" height="14" />
                {:else}
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                  </svg>
                {/if}
              </button>
              <span class="font-bold text-secondary text-sm min-w-[1.2rem] text-center">{cartQuantity}</span>
              <button 
                class="w-6 h-6 flex items-center justify-center text-secondary hover:bg-secondary/20 rounded-lg transition-colors"
                on:click={handleIncrement}
                disabled={cartQuantity >= 10}
                aria-label="Increase quantity"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
              </button>
            </div>
          {:else}
            <button 
              class="btn btn-primary btn-sm rounded-xl shadow-lg hover:shadow-xl transition-transform duration-200 hover:-translate-y-0.5"
              on:click={handleAddToCart}
            >
              Add to Cart
            </button>
          {/if}
        </div>
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
  
  /* Ribbon glow */
  @keyframes ribbon-glow {
    0%, 100% { 
      box-shadow: 0 0 10px rgba(255, 59, 48, 0.45);
    }
    50% { 
      box-shadow: 0 0 20px rgba(255, 59, 48, 0.8), 0 0 30px rgba(255, 59, 48, 0.35);
    }
  }
  
  .ribbon-discount {
    animation: ribbon-glow 2s ease-in-out infinite;
  }
</style>
