<script>
  import { onDestroy, onMount } from "svelte";
  import { PUBLIC_API_URL, PUBLIC_ESTORE_ID } from "$env/static/public";
  import { myFetch } from "$lib/utils/myFetch";
  import { user } from "$lib/stores/auth";
  import OrderItems from "$lib/components/OrderItems.svelte";
  import Icon from '@iconify/svelte';
  import SkeltonOrders from "$lib/components/skeltons/SkeltonOrders.svelte";

  let authUser;
  $: authUser = $user;

  let loading = true;
  let loadingMore = false;

  let orders = [];
  let next;


  let InvoiceGenerator;
  let showTooltip = false;
  let showTooltipIndex = null;

  onMount(async ()=>{

    let url = `${PUBLIC_API_URL}/order/orders/?items_needed=true&user_id=${authUser.user_id}&ordering=-id&estore_id=${PUBLIC_ESTORE_ID}`;
    let data = await myFetch(url);
    orders = data.results;
    // console.log("orders",orders);
    next = data.next;
    loading = false;

    InvoiceGenerator = import("$lib/components/InvoiceGenerator.svelte");

    // console.log("orders",data);


  })

  async function loadMore() {
    loadingMore = true;
        // console.log("Hello Bhai")
		const dataNew = await myFetch(next);
        // console.log(dataNew);
    orders = [...orders,...dataNew.results];
    next = dataNew.next;
    loadingMore = false
    }


  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

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

  function getOrderMrpTotal(orders) {
    return orders.items.reduce((total, item) => {
      const mrp = item.mrp || item.price;
      return total + (mrp * item.quantity);
    }, 0);
  }

  function getOrderItemsTotal(orders) {
    return orders.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  function getOrderTotalSavings(orders) {
    return orders.items.reduce((total, item) => {
      const mrp = item.mrp || item.price;
      return total + ((mrp - item.price) * item.quantity);
    }, 0);
  }

  function getOrderDeliveryCharge(orders) {
    const itemsTotal = getOrderItemsTotal(orders);
    return itemsTotal < 200 ? 40 : 0;
  }

  const originalDeliveryCharge = 40;
  const originalHandlingCharge = 10;
  const handlingCharge = 0;

  // Add this helper function
  function getPaymentStatusIcon(status) {
    return status === 'completed' 
      ? '<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>'
      : '<svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 002 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>';
  }

  function getOrderTotalDiscount(order) {
    // Per-product savings
    let productSavings = order.items.reduce((total, item) => {
      const mrp = item.mrp || item.price;
      return total + ((mrp - item.price) * item.quantity);
    }, 0);

    // Offer/coupon discounts
    let discount = order.total_discount || 0;

    // Delivery and handling savings if order qualifies
    const itemsTotal = getOrderItemsTotal(order);
    if (itemsTotal >= 200) {
      discount += 40 + 10; // Delivery and handling are free, so add to savings
    } else if (itemsTotal < 200 && order.total_discount > 0) {
      discount += 10;
    }

    // Return the sum of all savings
    return productSavings + discount;
  }

  // Add these helper functions (if not already present):
  function getProductSavings(order) {
    return order.items ? order.items.reduce((total, item) => {
      const mrp = item.mrp || item.price;
      return total + ((mrp - item.price) * item.quantity);
    }, 0) : 0;
  }
  function getHandlingDiscount(order) {
    return (getOrderItemsTotal(order) >= 200) ? 10 : 0;
  }
  function getDeliveryDiscount(order) {
    return (getOrderItemsTotal(order) >= 200) ? 40 : 0;
  }
</script>

<h2 class="text-2xl font-bold md:block hidden py-4 sticky top-0 z-10 ">My Orders</h2>

<div class="space-y-2 md:space-y-4">
  {#if loading}
    <SkeltonOrders />
  {/if}

  {#if orders.length > 0}
    <div class="space-y-6 ">
      {#each orders as order, i}
      <div class="bg-base-100 border rounded-lg">
        <div class="p-4 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b">
          <div class="flex items-center gap-2">
            <p class="font-medium  text-gray-600">#{order.order_number}</p>
            <span class="flex items-center gap-1">
              {@html getPaymentStatusIcon(order.payment_status)}
              <span class="text-xs sm:text-sm capitalize">{order.payment_status}</span>
            </span>
          </div>
          <a class="btn btn-sm btn-outline btn-primary w-full sm:w-auto" href={"/profile/orders/"+order.order_number}>
            Details & Track
          </a>
        </div>
          <OrderItems order_id={order.id} items={order.items} />

          <!-- Order Footer -->
          <div class="p-2 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t bg-gray-50">
            <div class="w-full sm:w-auto">
              {#if order.payment_status === 'completed'}

                  {#if InvoiceGenerator}
                    {#await InvoiceGenerator then { default: InvoiceGenerator }}
                      <InvoiceGenerator orderId={order.id} />
                    {/await}
                  {/if}

              {/if}
            </div>
            <div class="flex flex-col items-end gap-1 text-right w-full">
              <div class="w-full max-w-xs mt-2 text-xs sm:text-sm">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Items total</span>
                  <div class="flex items-center gap-2 text-right">
                    {#if getOrderTotalSavings(order) > 0}
                      <span class="text-xs text-gray-500 line-through">{formatPrice(getOrderMrpTotal(order))}</span>
                    {/if}
                    <span class=" text-gray-900">{formatPrice(getOrderItemsTotal(order))}</span>
                  </div>
                </div>
                <div class="flex justify-between items-center text-green-600 font-medium mt-1 relative group">
                  <span class="flex items-center gap-1">
                    Total Discount
                    <Icon icon="mdi:information-outline" class="w-3 h-3 text-gray-400 cursor-help" />
                    <div class="absolute left-0 top-full mt-1 z-10 bg-white border border-gray-200 rounded shadow-lg p-3 text-xs text-gray-700 min-w-[180px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
                      <div>Offer Discount: {formatPrice(order.total_discount)}</div>
                      <div>Handling Charges Discount: {formatPrice(getHandlingDiscount(order))}</div>
                      <div>Delivery Charges Discount: {formatPrice(getDeliveryDiscount(order))}</div>
                      <div>Product Savings: {formatPrice(getProductSavings(order))}</div>
                    </div>
                  </span>
                  <span>-{formatPrice(getOrderTotalDiscount(order))}</span>
                </div>
                <div class="flex justify-between items-center font-bold">
                  <span class=" text-lg">Grand total</span>
                  <span class="font-bold">{formatPrice(order.total_amount-order.total_discount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/each}

      {#if loadingMore}
        <SkeltonOrders />
      {/if}

      {#if (next && !loadingMore && !loading)}
        <div class="flex justify-center p-2 sm:p-4">
          <button class="btn btn-sm btn-outline" on:click={loadMore}>Load More</button>
        </div>
      {/if}
    </div>
  {:else if (!loading)}
    <div class="text-center py-6 sm:py-8 px-2 sm:px-4">
      <div class="mb-4">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900">No orders yet</h3>
      <p class="mt-1 text-gray-500">Start shopping to see your orders here</p>
      <div class="mt-6">
        <a href="/shop" class="btn btn-primary">
          Continue Shopping
        </a>
      </div>
    </div>
  {/if}
</div>