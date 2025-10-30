<script>
    import { myFetch } from "$lib/utils/myFetch";
    import Icon from '@iconify/svelte';
    import { PUBLIC_API_URL } from "$env/static/public";
    import { onMount } from "svelte";
    export let items;
    export let order_id;
    let orderItems = items;
    // console.log(orderItems);

    const mrp = orderItems.reduce((total, item) => {
        return total + (item.mrp * item.quantity);
    }, 0);

    const price = orderItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);  


    import OrderItemReview from "./OrderItemReview.svelte";

    // Status configurations with icons and colors
    const statusConfig = {
        'pending': { icon: 'material-symbols:pending-actions', color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
        'order_placed': { icon: 'material-symbols:order-approve-outline', color: 'bg-blue-100 text-blue-800', label: 'Order Placed' },
        'shipped': { icon: 'material-symbols:local-shipping-outline', color: 'bg-purple-100 text-purple-800', label: 'Shipped' },
        'ready_for_delivery': { icon: 'material-symbols:package-2-outline', color: 'bg-yellow-100 text-yellow-800', label: 'Ready for Delivery' },
        'out_for_delivery': { icon: 'material-symbols:delivery-dining', color: 'bg-orange-100 text-orange-800', label: 'Out for Delivery' },
        'delivered': { icon: 'material-symbols:check-circle-outline', color: 'bg-green-100 text-green-800', label: 'Delivered' },
        'canceled': { icon: 'material-symbols:cancel-outline', color: 'bg-red-100 text-red-800', label: 'Canceled' }
    };

    // Function to get order summary status
    function getOrderSummaryStatus(items) {
        if (!items || items.length === 0) return null;
        const statusPriority = { 'canceled': 0, 'order_placed': 1, 'pending': 1, 'shipped': 2, 'ready_for_delivery': 3, 'out_for_delivery': 4, 'delivered': 5 };
        const statuses = items.map(item => item.status);
        const uniqueStatuses = [...new Set(statuses)];

        if (uniqueStatuses.length === 1) return uniqueStatuses[0];
        if (uniqueStatuses.every(status => status === 'delivered' || status === 'canceled')) return 'delivered';
        return uniqueStatuses.reduce((a, b) => statusPriority[a] < statusPriority[b] ? a : b);
    }

    $: orderStatuses = [...new Set(orderItems.map(item => item.status))];
</script>

<!-- Order Status Summary -->
{#if orderItems.length > 0}
    <div class="p-4 sm:p-4 border-b border-gray-200">
        <div class="flex flex-wrap gap-3 items-center">
            <span class="text-sm font-semibold text-gray-700">Order Status:</span>

            {#each orderStatuses as status}
                <div class="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium {statusConfig[status]?.color} shadow-sm hover:shadow-md transition-all">
                    <Icon icon={statusConfig[status]?.icon} class="w-4 h-4" />
                    <span>{statusConfig[status]?.label}</span>
                    <span class="ml-1 bg-white/70 px-2 py-0.5 rounded-full text-xs">
                        {orderItems.filter(item => item.status === status).length}
                    </span>
                </div>
            {/each}
        </div>
    </div>
{/if}

<!-- Order Items -->

<div class="divide-y divide-gray-200">
    {#each orderItems as item}
        <div class="p-4 sm:p-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-start gap-4 flex-1 min-w-0">
                    <a href={`/product/${item.product_slug}`}>
                        <!-- Product Image -->
                        <img 
                            src={item.product_main_image || `https://placehold.co/200x200`} 
                            alt={item.product_listing_name} 
                            class="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md border border-gray-200 shadow-sm"
                        />
                    </a>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <a href={`/product/${item.product_slug}`} class="text-sm font-medium hover:text-blue-600 transition-colors truncate">
                                {item.product_listing_name}
                            </a>
                            <!-- Status badge beside name on mobile -->
                            <div class="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium {statusConfig[item.status]?.color} shadow-sm sm:hidden">
                                <Icon icon={statusConfig[item.status]?.icon} class="w-3 h-3" />
                                <span class="hidden sm:inline">{statusConfig[item.status]?.label}</span>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-gray-600">
                            <p>Quantity: <span class="font-medium">{item.quantity}</span></p>
                            <div class="flex items-center flex-wrap gap-x-2 gap-y-1">
                                {#if item.mrp && item.mrp > item.price}
                                    <span class="text-xs text-gray-500 line-through">₹{item.mrp.toFixed(2)}</span>
                                {/if}
                                <span class="font-semibold text-gray-900">₹{item.price.toFixed(2)}</span>
                                {#if item.mrp && item.mrp > item.price}
                                    <span class="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded">
                                        {Math.round(((item.mrp - item.price) / item.mrp) * 100)}% OFF
                                    </span>
                                {/if}
                            </div>
                        </div>
                        {#if item.discount_amount > 0}
                            <div class="mt-1 text-sm text-green-600">
                                Saved: ₹{item.discount_amount.toFixed(2)}
                            </div>
                        {/if}
                        <!-- Add Review below details on all screens -->
                        <div class="mt-2">
                            {#if item?.review_added}
                                <OrderItemReview order_item_id={item.id} />
                            {:else}
                                <a 
                                    class="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors w-full sm:w-auto"
                                    href={"/profile/add-review/" + item.id}
                                >
                                    <Icon icon="material-symbols:rate-review-outline" class="w-4 h-4" />
                                    Add Review
                                </a>
                            {/if}
                        </div>
                    </div>
                </div>
                <!-- Remove right column on mobile, keep only on desktop -->
                <div class="hidden sm:flex w-full sm:w-auto flex-col items-end justify-end gap-2">
                    <div class="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium {statusConfig[item.status]?.color} shadow-sm mb-2 sm:mb-0">
                        <Icon icon={statusConfig[item.status]?.icon} class="w-3 h-3" />
                        <span class="hidden md:inline">{statusConfig[item.status]?.label}</span>
                    </div>
                </div>
            </div>
        </div>
    {/each}
</div>



<style>
    /* Smooth transitions */
    .transition-colors {
        transition: background-color 0.2s ease-in-out;
    }

    .transition-all {
        transition: all 0.2s ease-in-out;
    }

    /* Status badge hover effect */
    div[class*="bg-"] {
        transform: scale(1);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .flex-col-mobile {
            flex-direction: column;
        }
        img {
            width: 60px;
            height: 60px;
        }
    }
</style>