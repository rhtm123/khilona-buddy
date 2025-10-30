<script>
    import { PUBLIC_API_URL } from "$env/static/public";

    import { user } from "$lib/stores/auth";
    import { myFetch } from "$lib/utils/myFetch";
    import { onMount, onDestroy } from "svelte";

    import { addAlert } from "$lib/stores/alert";

    let authUser;
    const unsubscribe = user.subscribe(value => {
        authUser = value;
    });

    onDestroy(() => {
        unsubscribe(); // Cleanup to avoid memory leaks
    });

    $: if (authUser || selectedStatus) {
        fetchOrderItems();
    }

    let loading = true;
    let orderItems = [];
    let next;
    let count = 0;

    let selectedStatus = '';

    async function fetchOrderItems() {
        loading = true;
        orderItems = [];
        let url = `${PUBLIC_API_URL}/order/order-items/?page_size=6&ordering=-id&seller_id=${authUser?.entity.id}&status=${selectedStatus}`;
        let data = await myFetch(url);
        orderItems = data.results;
        next = data.next;
        count = data.count;
        loading = false;
    }

    async function loadMore() {
        loading = true;
        const dataNew = await myFetch(next);
        orderItems = [...orderItems, ...dataNew.results];
        next = dataNew.next;
        loading = false;
    }

    async function updateStatus(orderId, newStatus) {
        const url = `${PUBLIC_API_URL}/order/order-items/${orderId}/`;
        const payload = { status: newStatus };
        orderItems = orderItems.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
        );

        addAlert(`#OrderId:${orderId} | Status Changed to ${newStatus}`)
        try {
            let data = await myFetch(url, "PUT", payload, authUser.access_token);            
            
        } catch (error) {
            console.error("Error updating status:", error);
        }
    }
</script>


    <!-- Main Content -->
        <div class="max-w-7xl mx-auto">
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-3xl font-bold text-gray-900">Order Management</h1>
                <div class="flex space-x-4">
                    <!-- <div class="relative">
                        <input 
                            type="text" 
                            placeholder="Search orders..." 
                            class="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                        <svg class="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div> -->
                    <select bind:value={selectedStatus} class="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Item ID</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                    </thead>

                    <tbody class="divide-y divide-gray-200">
                        {#each orderItems as orderItem (orderItem.id)}
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 text-sm font-medium text-blue-600">Order#{orderItem.id}</td>
                            <td class="px-6 py-4">
                                <div class="text-sm text-gray-900">{orderItem.product_listing.name}</div>
                                <div class="text-sm text-gray-500">Quantity: {orderItem.quantity}</div>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500">{orderItem.created}</td>
                            <td class="px-6 py-4">
                                <select 
                                bind:value={orderItem.status}
                                on:change={(e) => updateStatus(orderItem.id, e.target.value)}
                                class={`border rounded-lg px-2 py-1 text-sm 
                                    ${orderItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : ''}
                                    ${orderItem.status === 'processing' ? 'bg-blue-100 text-blue-800 border-blue-300' : ''}
                                    ${orderItem.status === 'shipped' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' : ''}
                                    ${orderItem.status === 'delivered' ? 'bg-green-100 text-green-800 border-green-300' : ''}
                                    ${orderItem.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-300' : ''}
                                `}
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option disabled value="delivered">Completed</option>
                                <option disabled value="cancelled">Cancelled</option>
                            </select>


                            </td>
                            <td class="px-6 py-4 text-sm text-gray-900 text-right">₹ {orderItem.subtotal.toFixed(2)}</td>
                        </tr>
                        {/each}

                        {#if loading}
                        <div class="p-4">
                            <span class="loading loading-spinner loading-sm"></span>
                        </div>
                        {/if}

                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="mt-2 flex justify-between items-center px-6 py-3 bg-white rounded-b-xl shadow-sm">
                <div class="flex space-x-2">
                    {#if (next && !loading)}
                    <button on:click={loadMore} class="px-3 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200">
                        Load More
                    </button>
                    {/if}
                </div>

                <div class="text-sm text-gray-500">
                    Showing {orderItems.length} of {count} results
                </div>
            </div>
        </div>
