<script>
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { addToCart, cart } from '../../lib/stores/cart';
  import { goto } from '$app/navigation';
  import { addAlert } from '$lib/stores/alert';
  import { user } from '$lib/stores/auth';
   
  import { cartLimit } from '$lib/utils/myConstants';

  let selectedItems = [];
  let totalPrice = 0;
  let couponCode = '';

  $: {
    selectedItems = $cart;
    totalPrice = selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  function updateQuantity(id, newQuantity) {

    if (newQuantity > 10) {
      addAlert("Can't add more than 10", "error");
      return selectedItems;
    }

    cart.update(items => {

      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      if (totalQuantity>=cartLimit){
        addAlert(`Can't add to cart: Total cart limit (${cartLimit}) reached`, "error")
        return selectedItems;
      }
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        items[index].quantity = Math.max(1, newQuantity);
      }
      return items;
    });
  }

  function removeItem(id) {
    cart.update(items => items.filter(item => item.id !== id));
  }

  function applyCoupon() {
    // Implement coupon logic here
    console.log('Applying coupon:', couponCode);
  }

  function proceedToCheckout() {
    // Get current user data
    const currentUser = $user;
    
    // Check if user is logged in and mobile is verified
    if (!currentUser) {
      goto('/login?next=/checkout');
      return;
    }
    
    if (!currentUser.mobile_verified) {
      goto('/verify-mobile?next=/checkout');
      return;
    }
    
    // If all checks pass, proceed to checkout
    goto('/checkout');
  }
</script>

<svelte:head>
  <title>CART</title>
</svelte:head>

<div class="mx-4 mt-2 md:mx-8 lg:mx-16">

  <div class="text-sm breadcrumbs text-gray-600">
      <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/shop">Shop</a></li>
          <li>Cart</li>
        </ul>
  </div>

<!-- Breadcrumb -->
 <div class="">

<!-- Progress Steps -->
<div class="progress-container mb-8">
  <div class="flex items-center justify-between max-w-3xl mx-auto relative">
      <div class="absolute inset-0 flex items-center">
          <div class="h-1 w-full bg-gray-200">
              <div class="h-full bg-red-500 w-1/3"></div>
          </div>
      </div>
      
      <div class="relative flex-1 flex justify-start">
          <div class="bg-red-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold step-number">01</div>
          <div class="absolute mt-10 -ml-4 text-xs font-medium text-gray-600 step-text whitespace-nowrap">SHOPPING CART</div>
      </div>
      
      <div class="relative flex-1 flex justify-center">
        <div class="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center text-gray-600 font-bold step-number">02</div>
        <div class="absolute mt-10 -ml-4 text-xs font-medium text-gray-600 step-text whitespace-nowrap">CHECKOUT</div>
    </div>
      
      <div class="relative flex-1 flex justify-end">
          <div class="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center text-gray-600 font-bold step-number">03</div>
          <div class="absolute mt-10 -ml-8 text-xs font-medium text-gray-600 step-text whitespace-nowrap">ORDER COMPLETED</div>
      </div>
  </div>

  {#if selectedItems.length > 0}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Cart Items -->
      <div class="lg:col-span-2">
        <!-- Mobile Cart Items -->
        <div class=" mt-10">
          {#each selectedItems as item (item.id)}
  <div 
    class="cart-item grid grid-cols-1 md:grid-cols-[100px_1fr] gap-4 p-4 border-b border-gray-200"
    in:fly="{{ y: 20, duration: 300 }}" 
    out:fade
  >
    <!-- Image -->
    <div class="cart-item-image flex justify-center md:justify-start">
      <img 
        class="h-20 w-20 object-contain" 
        src={item.main_image || "/placeholder.svg"} 
        alt={item.name} 
      />
    </div>

    <!-- Details -->
    <div class="cart-item-details flex flex-col gap-2">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h3 class="font-medium text-lg">{item.name}</h3>
          <p class="text-gray-600">₹ {item.price.toFixed(2)}</p>
        </div>

        <div class="quantity-controls flex items-center gap-4 mt-2 md:mt-0">
          <!-- Quantity Controls -->
          <div class="flex items-center border border-gray-300 rounded-md">
            <button 
              on:click={() => updateQuantity(item.id, item.quantity - 1)}
              class="px-3 py-1 hover:bg-gray-100 transition-colors"
            >-</button>
            <input 
              type="number" 
              value={item.quantity}
              min="1"
              disabled
              max="10"
              class="w-12 text-center border-x border-gray-300 bg-white focus:outline-none"
              on:input={(e) => updateQuantity(item.id, parseInt(e.target.value))}
            />
            <button 
              on:click={() => updateQuantity(item.id, item.quantity + 1)}
              class="px-3 py-1 hover:bg-gray-100 transition-colors"
            >+</button>
          </div>

          <!-- Total and Remove -->
          <div class="flex items-center gap-4">
            <p class="font-medium">₹ {(item.price * item.quantity).toFixed(2)}</p>
            <button 
              on:click={() => removeItem(item.id)}
              class="text-red-500 hover:text-red-700 text-xl font-bold transition-colors"
            >×</button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/each}
        </div>

        <!-- Desktop Table (hidden on mobile) -->
        <!-- <div class="md:hidden md:block mt-10">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="py-4 text-left">IMAGE</th>
                <th class="py-4 text-left">PRODUCT NAME</th>
                <th class="py-4 text-left">PRICE</th>
                <th class="py-4 text-left">QUANTITY</th>
                <th class="py-4 text-left">TOTAL</th>
                <th class="py-4"></th>
              </tr>
            </thead>
            <tbody>
              {#each selectedItems as item (item.id)}
                <tr class="border-b" in:fly="{{ y: 20, duration: 300 }}" out:fade>
                  <td class="py-4">
                    <img class="h-16 w-16 object-contain" src={item.main_image || "/placeholder.svg"} alt={item.name} />
                  </td>
                  <td class="py-4 font-medium">{item.name}</td>
                  <td class="py-4">₹ {item.price.toFixed(2)}</td>
                  <td class="py-4">
                    <div class="flex items-center border rounded-md w-24">
                      <button 
                        on:click={() => updateQuantity(item.id, item.quantity - 1)}
                        class="px-2 py-1 hover:bg-gray-100"
                      >-</button>
                      <input 
                        type="number" 
                        value={item.quantity}
                        min="1"
                        class="w-12 text-center border-x bg-white text-black"
                        on:change={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      />
                      <button 
                        on:click={() => updateQuantity(item.id, item.quantity + 1)}
                        class="px-2 py-1 hover:bg-gray-100"
                      >+</button>
                    </div>
                  </td>
                  <td class="py-4">₹ {(item.price * item.quantity).toFixed(2)}</td>
                  <td class="py-4">
                    <button 
                      on:click={() => removeItem(item.id)}
                      class="text-red-500 hover:text-red-700"
                    >×</button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div> -->

        <!-- Coupon Section -->
        <!-- <div class="coupon-section flex mt-8">
          <input
            type="text"
            bind:value={couponCode}
            placeholder="Coupon code"
            class="flex-1 border rounded bg-white px-4 py-2"
          />
          <button 
            on:click={applyCoupon}
            class="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors"
          >
            APPLY COUPON
          </button>
        </div> -->
      </div>

      <!-- Cart Totals -->
      <div class="lg:col-span-1">
        <div class="bg-white p-6 rounded shadow-sm md:mt-10">
          <h2 class="text-lg font-bold mb-4">CART TOTALS</h2>
          <div class="border-b pb-4 mb-4">
            <div class="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>₹ {totalPrice.toFixed(2)}</span>
            </div>
          </div>
          <div class="mb-4">
            <div class="flex justify-between font-bold">
              <span>Total</span>
              <span class="text-red-500">₹ {totalPrice.toFixed(2)}</span>
            </div>
          </div>
          <button 
            on:click={proceedToCheckout}
            class="w-full bg-red-500 text-white py-3 rounded hover:bg-red-600 transition-colors"
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>
    </div>
  {:else}
    <div class="text-center py-12" in:fade>
      <p>Your cart is empty.</p>
      <a 
        href="/shop" 
        class="inline-block mt-4 bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors"
      >
        Continue Shopping
      </a>
    </div>
  {/if}
</div>
</div>

</div>

<style>
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  input[type="number"] {
    -moz-appearance: textfield;
  }

  /* Add smooth transitions */
  button {
    transition: all 0.2s ease-in-out;
  }

  button:active {
    transform: scale(0.95);
  }

  .container {
    max-width: 1200px;
  }
  /* Add these mobile-specific styles */
  @media (max-width: 768px) {
    .progress-steps {
      padding: 0 1rem;
    }
    
    .progress-steps .step-number {
      height: 24px;
      width: 24px;
      font-size: 12px;
    }
    
    .progress-steps .step-text {
      font-size: 10px;
      white-space: nowrap;
      text-align: center;
    }

   

    .coupon-section {
      flex-direction: column;
      gap: 1rem;
    }

    .coupon-section input,
    .coupon-section button {
      width: 100%;
    }
  }
</style>