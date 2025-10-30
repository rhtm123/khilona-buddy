<script>
  import { cart } from '../stores/cart';
  import { user } from '../stores/auth';
  import { goto } from '$app/navigation';
  import { fly } from 'svelte/transition';
  import Icon from '@iconify/svelte';
  import { derived, get } from 'svelte/store';
  import { onMount, onDestroy } from "svelte";

  export let isOpen = false;
  export let onClose = () => {};

  // Reactive values using $store
  $: authUser = $user;
  $: cartItems = $cart;
  $: cartCount = $cart.reduce((total, item) => total + item.quantity, 0);

  $: itemsTotal = $cart.reduce((total, item) => total + item.price * item.quantity, 0);

  $: mrpTotal = $cart.reduce((total, item) => {
    const mrp = item.mrp || item.price;
    return total + mrp * item.quantity;
  }, 0);

  $: totalSavings = $cart.reduce((total, item) => {
    const mrp = item.mrp || item.price;
    const price = item.price;
    return total + (mrp - price) * item.quantity;
  }, 0);

  $: deliveryCharge = itemsTotal < 200 ? 40 : 0;
  const originalDeliveryCharge = 40;

  const handlingCharge = 0;
  const originalHandlingCharge = 10;

  $: grandTotal = itemsTotal + deliveryCharge + handlingCharge;

  // Derived store for info box text
  const infoBoxText = derived(cart, $cart => {
    const hasService = $cart.some(item => item.is_service);
    const hasProduct = $cart.some(item => !item.is_service);
    if (hasService && hasProduct) {
      return 'You have both products and services in your cart!';
    } else if (hasService) {
      return 'Fast and reliable service booking';
    } else if (hasProduct) {
      return 'Quick and secure product delivery';
    } else {
      return 'Your cart is empty';
    }
  });

  function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  function calculateDiscountPercentage(mrp, price) {
    if (!mrp || mrp <= price) return 0;
    return Math.floor(((mrp - price) / mrp) * 100);
  }

  function updateQuantity(productId, change) {
    cart.update(items =>
      items
        .map(item => {
          if (item.id === productId) {
            const newQuantity = Math.max(0, item.quantity + change);
            return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean)
    );
  }

  function removeItem(productId) {
    cart.update(items => items.filter(item => item.id !== productId));
  }

  function handleProceedToCheckout() {
    if (!authUser) {
      goto('/login?next=/checkout');
    } else {
      goto('/checkout');
    }
    isOpen = false;
    onClose();
  }

  function handleClose() {
    isOpen = false;
    onClose();
  }

  $: outOfStockCount = $cart.filter(item => item.stock <= 0).length;

  $: {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
  }


  function toggleCart(event) {
    event.stopPropagation();
    isOpen = !isOpen;
  }

</script>


<button
    onclick={toggleCart}
    class="cart-button relative flex items-center p-2 rounded-full text-gray-700 hover:text-blue-600 transition-colors"
  >
  <Icon icon="mdi:cart-outline" width="28" height="28" />
  {#if cartCount > 0}
    <span class="absolute -top-1 -right-4 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center -translate-x-1/2">
      {cartCount}
    </span>
  {/if}
  <span class="font-medium ml-1 hidden md:inline">Cart</span>
  </button>




<!-- Backdrop -->
{#if isOpen}
<div 
  class="fixed inset-0 bg-black/50 z-40"
  onclick={handleClose}
  onkeydown={() => {}}
  role="button"
  tabindex="0"
  transition:fly={{ x: 300, duration: 300 }}
></div>
{/if}

<!-- Cart Sidebar -->
{#if isOpen}
<div 
  class="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
  transition:fly={{ x: 300, duration: 300 }}
>
  <!-- Header -->
  <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
    <h2 class="text-lg font-semibold text-gray-900">My Cart</h2>
    <button 
      onclick={handleClose}
      class="p-2 hover:bg-gray-100 rounded-full transition-colors"
    >
      <Icon icon="mdi:close" class="w-5 h-5 text-gray-600" />
    </button>
  </div>

  <!-- Main Scrollable Content (Info box, Out of Stock, Cart Items, Bill Details) -->
  <div class="flex-1 overflow-y-auto p-4 space-y-4">
    <!-- Out of Stock Alert -->
    {#if outOfStockCount > 0}
      <div class="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-red-800">
              {outOfStockCount} out of stock item{outOfStockCount > 1 ? 's' : ''}...
            </p>
            <p class="text-xs text-red-600">you can continue to checkout</p>
          </div>
          <button class="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium">
            Review
          </button>
        </div>
      </div>
    {/if}

    <!-- Delivery Info (Info Box) -->
    <div class="  p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
          <Icon icon="mdi:cart-outline" class="w-4 h-4 text-white" />
        </div>
        <div>
          <p class="text-sm font-medium text-blue-900">{$infoBoxText}</p>
          <p class="text-xs text-blue-700">Your selected items are ready for checkout</p>
        </div>
      </div>
    </div>

    <!-- Cart Items -->
    <div class="space-y-4">
      {#if cartItems.length === 0}
        <div class="text-center py-12">
          <Icon icon="mdi:cart-outline" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
          <p class="text-gray-500 mb-4">Add some items to get started</p>
          <button 
            onclick={handleClose}
            class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium"
          >
            Continue Shopping
          </button>
        </div>
      {:else}
        {#each cartItems as item (item.id)}
          <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <!-- Product Image -->
            <div class="w-14 h-14 bg-white rounded border overflow-hidden flex-shrink-0">
              <img 
                src={item.main_image || item.thumbnail || "/placeholder.svg?height=56&width=56"} 
                alt={item.name}
                class="w-full h-full object-cover"
              />
            </div>
            <!-- Product Details -->
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-gray-900 leading-tight mb-1">{item.name}</h4>
              {#if item.category}
                <p class="text-xs text-gray-500 mb-2">{item.category.name}</p>
              {/if}
              <!-- Price Section with MRP and Discount -->
              <div class="space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  {#if item.mrp && item.mrp > item.price}
                    <span class="text-sm text-gray-500 line-through">
                      {formatPrice(item.mrp)}
                    </span>
                  {/if}
                  <span class="text-base font-bold text-gray-900">
                    {formatPrice(item.price)}
                  </span>
                  {#if item.mrp && item.mrp > item.price}
                    <span class="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded">
                      {calculateDiscountPercentage(item.mrp, item.price)}% OFF
                    </span>
                  {/if}
                </div>
              </div>
              <!-- Stock Status -->
              {#if item.stock <= 0}
                <span class="inline-block text-xs text-red-600 bg-red-100 px-2 py-1 rounded mt-2">
                  Out of Stock
                </span>
              {/if}
            </div>
            <!-- Quantity Controls -->
            <div class="flex flex-col items-center gap-2">
              <div class="flex items-center border border-gray-300 rounded">
                {#if item.quantity === 1}
                  <button 
                    onclick={() => removeItem(item.id)}
                    class="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-red-600 border-r border-gray-300"
                  >
                    <Icon icon="mdi:delete-outline" class="w-4 h-4" />
                  </button>
                {:else}
                  <button 
                    onclick={() => updateQuantity(item.id, -1)}
                    class="w-8 h-8 flex items-center justify-center hover:bg-gray-50 border-r border-gray-300"
                  >
                    <Icon icon="mdi:minus" class="w-4 h-4" />
                  </button>
                {/if}
                <span class="w-10 text-center text-sm font-medium py-2">{item.quantity}</span>
                <button 
                  onclick={() => updateQuantity(item.id, 1)}
                  class="w-8 h-8 flex items-center justify-center hover:bg-green-50 text-green-600 border-l border-gray-300"
                  disabled={item.quantity >= (item.buy_limit || 10)}
                >
                  <Icon icon="mdi:plus" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <!-- Bill Details (scrolls with content) -->
    {#if cartItems.length > 0}
      <div class="space-y-3 mt-4">
        <div class="flex items-center gap-2 mb-3">
          <Icon icon="mdi:receipt-text-outline" class="w-4 h-4 text-gray-600" />
          <h3 class="font-semibold text-gray-900">Bill details</h3>
        </div>
        <div class="space-y-2 text-sm">
          <!-- Items Total with MRP -->
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Items total</span>
            <div class="flex items-center gap-2 text-right">
              {#if totalSavings > 0}
                <span class="text-xs text-gray-500 line-through">{formatPrice(mrpTotal)}</span>
              {/if}
              <span class="text-base font-bold text-gray-900">{formatPrice(itemsTotal)}</span>
            </div>
          </div>
          <!-- Delivery Charge with Tooltip -->
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-1 relative group">
              <span class="text-gray-600">Delivery charge</span>
              <Icon icon="mdi:information-outline" class="w-3 h-3 text-gray-400 cursor-help" />
              <div class="absolute bottom-full left-0 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                🚚 FREE delivery on orders above ₹199! For orders below ₹199, we charge only ₹40 to cover our delivery partner costs.
              </div>
            </div>
            <div class="text-right">
              {#if deliveryCharge > 0}
                <span class="font-medium">{formatPrice(deliveryCharge)}</span>
              {:else}
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-500 line-through">{formatPrice(originalDeliveryCharge)}</span>
                  <span class="font-medium text-green-600">FREE</span>
                </div>
              {/if}
            </div>
          </div>
          <!-- Handling Charge with Tooltip -->
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-1 relative group">
              <span class="text-gray-600">Handling charge</span>
              <Icon icon="mdi:information-outline" class="w-3 h-3 text-gray-400 cursor-help" />
              <div class="absolute bottom-full left-0 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                🎁 We've waived the handling charges for you! This usually covers packaging, quality checks, and secure handling of your items.
              </div>
            </div>
            <div class="text-right">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500 line-through">{formatPrice(originalHandlingCharge)}</span>
                <span class="font-medium text-green-600">FREE</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Grand Total -->
        <div class="border-t pt-2">
          <div class="flex justify-between items-center rounded-lg  shadow font-bold  text-lg tracking-wide" style="box-shadow: 0 2px 8px rgba(34,197,94,0.08);">
            <span>Grand total</span>
            <span class="font-bold">{formatPrice(grandTotal)}</span>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Fixed Bottom: Total Savings Banner & Checkout Button -->
  {#if cartItems.length > 0}
    <div class="sticky bottom-0 left-0 right-0 bg-white z-10 border-t border-gray-200 px-4 pt-2 pb-4">
      <!-- Total Savings Banner -->
      {#if totalSavings > 0}
        <div class="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg px-2 py-1 mb-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Icon icon="mdi:tag-multiple" class="w-4 h-4 text-blue-600" />
              <span class="text-blue-800 font-semibold text-base">Your total savings</span>
            </div>
            <span class="text-green-700 font-bold">{formatPrice(totalSavings)}</span>
          </div>
          <p class="text-xs text-blue-700 mt-1">🎉 You're saving big on this order!</p>
        </div>
      {/if}
      <!-- Checkout Button -->
      <button 
        onclick={handleProceedToCheckout}
        class="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-between mt-2 text-base shadow-lg"
      >
        <div class="flex items-center gap-2">
          <span class="font-bold text-lg">{formatPrice(grandTotal)}</span>
          <span class="text-sm opacity-90">TOTAL</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-md">
            {#if !authUser}
              Login to Proceed
            {:else}
              Proceed to Checkout
            {/if}
          </span>
          <Icon icon="mdi:arrow-right" class="w-4 h-4" />
        </div>
      </button>
      <!-- Friendly Message -->
      <p class="text-xs text-center text-gray-500 mt-2">
        Thank you for shopping with us!
      </p>
    </div>
  {/if}
</div>
{/if}
