<script>
    import { cart } from '../../lib/stores/cart';
    import { fade } from 'svelte/transition';
    import { user } from '$lib/stores/auth';
    import { onDestroy, onMount } from 'svelte';
    import { PUBLIC_API_URL, PUBLIC_ESTORE_ID } from '$env/static/public';
    import Icon from '@iconify/svelte';
    import { myFetch } from '$lib/utils/myFetch';
    import { goto } from '$app/navigation';

    import { shipaddresses } from '$lib/stores/address';
    import AddressAddEdit from '$lib/components/AddressAddEdit.svelte';

    import { addAlert } from '$lib/stores/alert';

    import CouponSection from '$lib/components/checkout/CouponSection.svelte';
    import { cartDiscounts, appliedCoupon, appliedOffer } from '$lib/stores/offers';

    import AvailableOffers from '$lib/components/checkout/AvailableOffers.svelte';

    let loading = false;
    let selectedAddress;

    let orderPlacing = false;

    function selectAddress(option) {
    selectedAddress = selectedAddress === option.id ? null : option.id;
  }

    let orderData;

    let cartItems;

    let orderdCompleted = false;

    let addresses=[];

    shipaddresses.subscribe(value=>{
      // console.log(value);
      addresses = value;
      if (addresses.length>0)
      selectedAddress = addresses[0].id;
    })

    const unsubscribe2 = cart.subscribe(value => {
      cartItems = value;
    });

    onDestroy(() => {
      unsubscribe2(); // Cleanup to avoid memory leaks
    });



    onMount(async () => {
      loading = true;
      let url = `${PUBLIC_API_URL}/user/shipping-addresses/?page=1&page_size=50&user_id=${authUser.user_id}`
      let data = await myFetch(url);
      // console.log(data)
      addresses = data.results;
      shipaddresses.set(data.results);
      loading = false;
      // console.log(data);
    });

    let authUser;

    $: authUser = $user;

    // Update subtotal calculation to use discounted prices
    $: subtotal = $cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    $: totalDiscount = $cartDiscounts.totalDiscount;
    $: exactTotal = subtotal - totalDiscount;
    $: finalTotal = Math.round(exactTotal);
    $: roundingAdjustment = finalTotal - exactTotal;
    console.log("finalTotal",finalTotal);
  
    // Add exact discount calculations
    $: exactOfferDiscount = $cartDiscounts.exactOfferDiscount || $cartDiscounts.offerDiscount;
    $: exactCouponDiscount = $cartDiscounts.exactCouponDiscount || $cartDiscounts.couponDiscount;
    $: offerRoundingAdjustment = $cartDiscounts.offerDiscount - exactOfferDiscount;
    $: couponRoundingAdjustment = $cartDiscounts.couponDiscount - exactCouponDiscount;
  
    let termsAccepted = false;

    async function checkDailyOrderLimit() {
        const url = `${PUBLIC_API_URL}/order/orders/?user_id=${authUser.user_id}`;
        const response = await myFetch(url);
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

        // Count orders placed today
        const todayOrdersCount = response.results.filter(order => {
            const orderDate = new Date(order.created).toISOString().split('T')[0];
            return orderDate === today;
        }).length;

        return todayOrdersCount;
    }

    // async function checkStockAvailability() {
    //     for (const item of cartItems) {
    //         try {
    //             // Fetch current product listing to check stock
    //             const response = await myFetch(`${PUBLIC_API_URL}/product/product-listings/${item.id}/`);
    //             if (response.stock < item.quantity) {
    //                 addAlert(`Sorry, only ${response.stock} units available for ${item.name}`, "error");
    //                 return false;
    //             }
    //         } catch (error) {
    //             console.error('Error checking stock:', error);
    //             addAlert(`Error checking stock for ${item.name}`, "error");
    //             return false;
    //         }
    //     }
    //     return true;
    // }

    async function handleSubmit() {
        orderPlacing = true;
        // First check if mobile is verified
        if (!authUser.mobile_verified) {
            // Save current path for redirect after verification
            goto('/verify-mobile?next=/checkout');
            return;
        }

        const dailyOrderCount = await checkDailyOrderLimit();

        if (dailyOrderCount >= 10) {
            addAlert("You cannot place more than 10 orders in a single day.", "error");
            orderPlacing = false;
            return;
        }

        if (!termsAccepted) {
            addAlert("Please accept the terms and conditions", "error");
            orderPlacing = false;
            return;
        }

        if (!selectedAddress) {
            addAlert("Please select a delivery address", "error");
            orderPlacing = false;
            return;
        }

        // Check stock availability before proceeding
        // const stockAvailable = await checkStockAvailability();
        // if (!stockAvailable) {
        //     return;
        // }
        try {
            let url = `${PUBLIC_API_URL}/order/orders/`;
            
            // Create order with discount information
            let order = await myFetch(url, "POST", {
                user_id: authUser?.user_id,
                estore_id: PUBLIC_ESTORE_ID,
                shipping_address_id: selectedAddress,
                offer_id: $appliedOffer?.id || null,
                coupon_id: $appliedCoupon?.id || null,
                total_amount: finalTotal,
            }, authUser.access_token);

            orderData = order;

            // Create order items with offer information
            let url2 = `${PUBLIC_API_URL}/order/order-items/`;
            for (let i = 0; i < cartItems.length; i++) {
                const item = cartItems[i];
                const itemData = {
                    order_id: order.id,
                    product_listing_id: item.id,
                    quantity: item.quantity,
                    price: Number((item.originalPrice || item.price).toFixed(2)),
                    offer_id: item.productOffer?.id || null,
                    subtotal: Number((Number(item.discountedPrice || item.price) * Number(item.quantity)).toFixed(2))
                };

                try {
                    await myFetch(url2, "POST", itemData, authUser.access_token);
                } catch (error) {
                    console.error('Error creating order item:', error);
                    // If an order item fails, delete the order and show error
                    await myFetch(`${PUBLIC_API_URL}/order/orders/${order.id}/`, "DELETE", null, authUser.access_token);
                    addAlert("Error creating order: Some items are out of stock", "error");
                    orderPlacing = false;
                    return;
                }
            }

            // Create payment
            let urlp = `${PUBLIC_API_URL}/payment/payments/`;
            let payment = await myFetch(urlp, "POST", {
                "order_id": order.id,
                "amount": finalTotal,
                "estore_id": PUBLIC_ESTORE_ID,
                payment_method: selectedPaymentMethod,
            }, authUser.access_token);

            if (payment.payment_method == "pg") {
                window.location = payment.payment_url;
            } else {
                addAlert("Order placed successfully", "success");
                goto("/checkout/" + payment.transaction_id);
            }
            
            orderdCompleted = true;
            // Clear cart and applied offers/coupons
            cart.set([]);
            appliedOffer.set(null);
            appliedCoupon.set(null);

        } catch (e) {
            console.error('Error placing order:', e);
            addAlert("Error placing order: " + (e.message || "Please try again"), "error");
        } finally {
            orderPlacing = false;
        }
    }

    let modal;

    function openModal() {
      modal.showModal(); // Opens the modal
    }

    function closeModal() {
      modal.close(); // Closes the modal
    }


    let modalEdits = {}; // Store modal references

      function openModalEdit(id) {
        if (modalEdits[id]) {
          modalEdits[id].showModal();
        }
      }

      function closeModalEdits(id) {
        modalEdit[id].close(); // Closes the modal
      }


      let selectedPaymentMethod = "cod"

    // Add MRP, delivery, handling, savings logic
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
    $: mrpTotal = $cart.reduce((total, item) => {
        const mrp = item.mrp || item.price;
        return total + (mrp * item.quantity);
    }, 0);
    $: itemsTotal = $cart.reduce((total, item) => {
        const price = item.price;
        return total + (price * item.quantity);
    }, 0);
    $: totalSavings = $cart.reduce((total, item) => {
        const mrp = item.mrp || item.price;
        const price = item.price;
        return total + ((mrp - price) * item.quantity);
    }, 0);
    $: deliveryCharge = itemsTotal < 200 ? 40 : 0;
    $: originalDeliveryCharge = 40;
    $: handlingCharge = 0;
    $: originalHandlingCharge = 10;
    $: discountedTotal = itemsTotal - $cartDiscounts.totalDiscount;
    $: grandTotal = discountedTotal + deliveryCharge + handlingCharge;

  </script>
  
  <svelte:head>
    <title>CHECKOUT</title>
  </svelte:head>
  

  <div class="px-4 mt-2 md:px-8 lg:px-16">

    <div class="text-sm breadcrumbs text-gray-600">
      <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/shop">Shop</a></li>
          <li>Cart</li>
        </ul>
  </div>

  <!-- Breadcrumb -->
  
  <!-- Progress Steps -->
  <div class="progress-container mb-8">
    <div class="flex items-center px-4 justify-between max-w-3xl mx-auto relative">
        <div class="absolute inset-0 flex items-center">
            <div class="h-1 w-full bg-gray-200">
                <div class={!orderdCompleted?"h-full bg-red-500 w-2/3":"h-full bg-red-500"}></div>
            </div>
        </div>
        
        <div class="relative flex-1 flex justify-start">
            <div class="bg-red-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold step-number">01</div>
            <div class="absolute mt-10 -ml-4 text-xs font-medium text-gray-600 step-text whitespace-nowrap">SHOPPING CART</div>
        </div>
        
        <div class="relative flex-1 flex justify-center">
            <div class="bg-red-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold step-number">02</div>
            <div class="absolute mt-10 -ml-4 text-xs font-medium text-red-500 step-text whitespace-nowrap">CHECKOUT</div>
        </div>
        
        <div class="relative flex-1 flex justify-end">
          
        <div class={!orderdCompleted?"h-1 bg-gray-200":"h-1 bg-red-500"}>
          <div class="w-0 h-full bg-red-500"></div>
        </div>
            <div class={!orderdCompleted?"bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center text-gray-600 font-bold":"bg-red-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold"} >03</div>
            <div class="absolute mt-10 -ml-8 text-xs font-medium text-gray-600 step-text whitespace-nowrap">ORDER COMPLETED</div>
        </div>
    </div>

    
    <div class="py-4">
    

    {#if !orderdCompleted }

      {#if $cart.length === 0}
      <div class="text-center py-8" in:fade>
        <p class="text-red-500 mb-4">Please add some items to your cart before checking out.</p>
        <a href="/shop" class="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors">
          Continue Shopping
        </a>
      </div>
      {:else}

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Billing Details Form -->
        <div class="space-y-6 mt-10">
          
          <div class="bg-white p-4 rounded shadow-sm">
            
            <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold mb-4">Select Address</h2>

            <button class="btn btn-secondary btn-sm mb-4" on:click={openModal}>
              + Add
            </button>
            </div>

            <dialog bind:this={modal} class="modal">
              <AddressAddEdit authUser={authUser} modal={modal} />
            </dialog>


            <div class="space-y-4">
              
              {#each addresses as option}
                <div 
                  class={(selectedAddress==option.id)?"bg-green-300 flex justify-between items-center p-4 border rounded-lg shadow-sm cursor-pointer transition-colors":"flex justify-between items-center p-4 border rounded-lg shadow-sm cursor-pointer transition-colors"}
                  on:click={() => selectAddress(option)}
                >
                  <div>
                    <p class="font-semibold">{option.address.line1}</p>
                    <p class="text-sm text-gray-600">{option.address.city}, {option.address.state}</p>
                  </div>
                  <button class="btn btn-sm btn-outline btn-primary" on:click={() => openModalEdit(option.id)}>
                    Edit
                  </button>

                  <dialog bind:this={modalEdits[option.id]} class="modal">
                    <AddressAddEdit authUser={authUser} shipAddress={option} modal={modalEdits[option.id]} />
                  </dialog>

                </div>
              {/each}

            </div>
          </div>

          
        </div>
  
        <!-- Order Summary -->
        <div class="bg-white rounded-lg shadow-sm p-4 md:mt-10">
          <h2 class="text-lg font-bold mb-4">Your Order</h2>
          <div class="space-y-4">
            {#each $cart as item}
              <div class="flex justify-between items-center py-2 border-b">
                <div class="flex items-center gap-3">
                  <img src={item.main_image || "/placeholder.svg"} alt={item.name} class="w-12 h-12 object-cover rounded-md" />
                  <div>
                    <p class="font-medium">{item.name}</p>
                    <p class="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    {#if item.productOffer}
                      <div class="text-sm text-green-600 flex items-center gap-1 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span>
                          {#if item.productOffer.offer_type === 'discount'}
                            {item.productOffer.get_discount_percent}% OFF
                          {:else if item.productOffer.offer_type === 'buy_x_get_y'}
                            Buy {item.productOffer.buy_quantity} Get {item.productOffer.get_quantity} ({item.productOffer.get_discount_percent}% OFF)
                          {/if}
                        </span>
                      </div>
                    {/if}
                  </div>
                </div>
                <div class="text-right flex flex-col items-end gap-1">
                  <div class="flex items-center gap-2">
                    {#if item.mrp && item.mrp > item.price}
                      <span class="text-xs text-gray-500 line-through">{formatPrice(item.mrp)}</span>
                    {/if}
                    <span class="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    {#if item.mrp && item.mrp > item.price}
                      <span class="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded">
                        {calculateDiscountPercentage(item.mrp, item.price)}% OFF
                      </span>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}

            <!-- Add AvailableOffers component before CouponSection -->
            <AvailableOffers />

            <!-- Existing CouponSection component -->
            <CouponSection />

            <!-- Update the totals section -->
            <div class="space-y-2 pt-4 border-t">
              <div class="flex justify-between mb-2">
                <span class="text-gray-600">Items total</span>
                <div class="flex items-center gap-2 text-right">
                  {#if totalSavings > 0}
                    <span class="text-xs text-gray-500 line-through">{formatPrice(mrpTotal)}</span>
                  {/if}
                  <span class="text-base font-bold text-gray-900">{formatPrice(itemsTotal)}</span>
                </div>
              </div>
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
              <div class="border-t pt-2">
                <div class="flex justify-between items-center rounded-lg shadow font-bold text-lg tracking-wide" style="box-shadow: 0 2px 8px rgba(34,197,94,0.08);">
                  <span>Grand total</span>
                  <span class="font-bold">{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>
            {#if totalSavings > 0}
              <div class="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg px-2 py-1 mt-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    <span class="text-blue-800 font-semibold text-base">Your total savings</span>
                  </div>
                  <span class="text-green-700 font-bold">{formatPrice(totalSavings)}</span>
                </div>
                <p class="text-xs text-blue-700 mt-1">🎉 You're saving big on this order!</p>
              </div>
            {/if}

            <label class="flex items-start gap-2">
              <input 
                  type="checkbox" 
                  class="mt-1" 
                  bind:checked={termsAccepted}
                  required 
              />
              <span class="text-sm text-gray-600">
                  I have read and agree to the website's 
                  <a href="/terms-of-service" class="text-red-500 hover:underline">terms and conditions</a>
              </span>
          </label>
          
          <div class="flex items-center gap-4">
              <label>
                  <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="cod" 
                      bind:group={selectedPaymentMethod} 
                      checked 
                  />
                  Cash on Delivery
              </label>
              <label>
                  <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="pg" 
                      bind:group={selectedPaymentMethod} 
                  />
                  Pay Online
              </label>
          </div>

          <button 
              on:click={handleSubmit}
              class="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-colors flex items-center justify-center"
              disabled={orderPlacing}
          >
              {#if orderPlacing}
                  <span class="loading loading-spinner loading-sm mr-2"></span>
                  PLACING ORDER
              {:else}
                  PLACE ORDER
              {/if}
          </button>
          </div>
        </div>
      </div>

      {/if}



    
      {/if}


    </div>



  </div>
</div>
  
  <style>
    input, textarea {
      background-color: #f8f8f8;
    }
  
    input:focus, textarea:focus {
      outline: none;
      border-color: #ef4444;
      background-color: white;
    }
  
    /* Add smooth transitions */
    button, input, textarea {
      transition: all 0.2s ease-in-out;
    }
  
    button:active {
      transform: scale(0.95);
    }
  
    .container {
      max-width: 1200px;
    }

    .progress-container {
      padding: 0 2rem;
    }
    .progress-container .max-w-3xl {
      max-width: 100%;
    }
    .progress-container .flex.items-center.px-4 {
      padding-left: 0;
      padding-right: 0;
    }
    .progress-container .absolute.inset-0.flex.items-center > .h-1.w-full.bg-gray-200 {
      margin: 0 2.5rem;
    }

    /* Mobile-specific styles */
    @media (max-width: 768px) {
        .progress-container {
            padding: 0 0.25rem;
        }
        .progress-container .absolute.inset-0.flex.items-center > .h-1.w-full.bg-gray-200 {
            margin: 0 2.2rem;
        }
        .progress-container .flex.items-center.px-4 {
            padding-left: 0;
            padding-right: 0;
        }
        .px-4 {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
        }
        .md\:px-8 {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
        }
        .lg\:px-16 {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
        }
        .progress-container .max-w-3xl {
            max-width: 100%;
        }
        .progress-container .absolute.inset-0.flex.items-center > .h-1.w-full.bg-gray-200 {
            margin: 0 1.7rem;
        }
    
        .step-number {
            height: 24px !important;
            width: 24px !important;
            font-size: 12px !important;
        }
        .step-text {
            font-size: 10px !important;
            text-align: center;
        }
    }

  
     /* Transitions */
     button {
        transition: all 0.2s ease-in-out;
    }

    button:active {
        transform: scale(0.95);
    }
  </style>