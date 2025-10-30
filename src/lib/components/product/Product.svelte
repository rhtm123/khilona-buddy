<script>
  import { addToCart, cart } from '../../stores/cart';
  import { toggleWishlistItem, wishlistIds } from '../../stores/wishlist';
  import { addAlert } from '$lib/stores/alert';
  import Icon from '@iconify/svelte';
  
  export let product;
  // console.log(product)
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

<div class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group h-full flex flex-col relative overflow-hidden border border-gray-100 hover:border-indigo-200 mt-4">
  <!-- Vibrant gradient overlay -->
  <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  
  <!-- Product Image with Badges -->
  <a href="/product/{product.slug}" class="block w-full h-full">

    <!-- Variant & Size Badge -->



  <div class="relative aspect-square bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
    <!-- Corner Ribbon -->
    {#if discount}
      <div class="absolute -top-1 -left-1 z-20">
        <div class="relative">
          <!-- Main ribbon strip -->
          <div class="bg-red-600 text-white text-xs font-bold px-4 py-1.5 transform rotate-[-45deg] origin-top-left shadow-lg ribbon-discount" style="transform-origin: 0 0; transform: translate(14px, 0px) rotate(-45deg);">
            <span class="text-yellow-300">🔥</span> {discount}% OFF
          </div>
          <!-- Shadow/depth effect -->
          <div class="absolute top-0 left-0 bg-red-800 w-4 h-4 transform rotate-45" style="transform: translate(0px, 14px) rotate(45deg);"></div>
        </div>
      </div>
    {/if}

    <!-- Modern Wishlist Button -->
    <button
      class="absolute top-3 right-3 z-10 p-2 rounded-full bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 {isWishlisted ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-400'}"
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
        class="w-full h-full object-cover transform transition-all duration-500 group-hover:scale-105"
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
    

    <!-- Hover overlay -->
    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300"></div>
  </div>
  </a>

  <!-- Product Info - Modern Layout -->
  <div class="p-4 flex flex-col flex-1 relative z-10">
    <a href="/product/{product.slug}" class="block flex-1">
      <!-- Product Name - Clean Typography -->
      <h3 class="font-semibold text-gray-900 text-sm leading-snug mb-3 line-clamp-2 min-h-[2.5rem] group-hover:text-indigo-600 transition-colors">
        {product.name}
      </h3>
    </a>

   

    <!-- Bottom section - Elegant Layout -->
    <div class="mt-auto space-y-3">
      <!-- Brand and Rating -->
      <div class="flex items-center justify-between">
        <!-- Brand -->
        <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-500 truncate font-medium">
              {product.brand?.name || 'Brand'}
            </p>
        </div>
        
        <!-- Rating -->
        {#if product.rating}
          <div class="flex items-center gap-1 ml-2">
            <div class="flex items-center bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs px-2 py-1 rounded-lg shadow-sm">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <span class="font-semibold">{product.rating}</span>
            </div>
            {#if product.review_count}
              <span class="text-xs text-gray-500">
                ({product.review_count})
              </span>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Price and Add Button Row -->
      <div class="flex items-end justify-between">
        <!-- Price Section -->
        <div class="flex flex-col">
          <span class="text-lg font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
          {#if product.mrp && product.mrp > product.price}
            <span class="text-gray-400 text-sm line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
          {/if}
        </div>

        <!-- Add to Cart Controls -->
        <div class="ml-2">

          {#if product.stock ==0}
            <span class="text-red-500 text-sm font-semibold border border-red-200 bg-red-50 px-3 py-2 rounded-lg">Out of Stock</span>
          {:else if showQtyControls}
            <div class="flex items-center border-2 border-indigo-200 rounded-xl px-2 py-1 gap-2 bg-indigo-50/50">
              <button 
                class="w-6 h-6 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                on:click={cartQuantity > 1 ? handleDecrement : handleRemove}
                aria-label={cartQuantity === 1 ? 'Remove item from cart' : 'Decrease quantity'}
              >
                {#if cartQuantity === 1}
                  <Icon icon="mdi:delete-outline" class="text-red-600" width="14" height="14" />
                {:else}
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                  </svg>
                {/if}
              </button>
              <span class="font-bold text-indigo-600 text-sm min-w-[1.2rem] text-center">{cartQuantity}</span>
              <button 
                class="w-6 h-6 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
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
              class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
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
  
  /* Ribbon animation */
  @keyframes ribbon-glow {
    0%, 100% { 
      box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
    }
    50% { 
      box-shadow: 0 0 20px rgba(220, 38, 38, 0.8), 0 0 30px rgba(220, 38, 38, 0.4);
    }
  }
  
  .ribbon-discount {
    animation: ribbon-glow 2s ease-in-out infinite;
  }
</style>
