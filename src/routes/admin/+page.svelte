<!-- SellerAdmin.svelte -->
<script>
    import { PUBLIC_API_URL } from "$env/static/public";
    import { myFetch } from "$lib/utils/myFetch";

    import { user } from "$lib/stores/auth";
    import { onMount, onDestroy } from "svelte";

    import SalesChart from "$lib/components/admin/SalesChart.svelte";



    let authUser;

    const unsubscribe = user.subscribe(value => {
      authUser = value;
    });

    onDestroy(() => {
      unsubscribe(); // Cleanup to avoid memory leaks
    });

    $: if (authUser) {
        fetchSellerAnalytics();
    }

    let data;

    async function fetchSellerAnalytics(){
        data = await myFetch(`${PUBLIC_API_URL}/order/seller-analytics?period=lifetime&seller_id=${authUser?.entity.id}`);
        console.log(data);
    }

    
    // Sample analytics data
    const metrics = [
        { title: 'Total Sales', value: '$12,450', change: '+12.5%' },
        { title: 'Orders', value: '1,230', change: '+8.2%' },
        { title: 'Avg. Order Value', value: '$102', change: '-3.1%' },
        { title: 'Conversion Rate', value: '3.8%', change: '+1.4%' }
    ];


</script>



    <!-- Main Content -->
            <div class="max-w-7xl mx-auto">
                <h1 class="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div class="bg-white p-6 rounded-xl shadow-sm">
                            <h3 class="text-gray-500 text-sm font-medium">Total Sales</h3>
                            <p class="mt-2 text-3xl font-semibold text-gray-900">₹ {data?.total_revenue}</p>
                            <!-- <span class={`inline-flex items-center mt-2 text-sm ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.change.startsWith('+') ? '↑' : '↓'} {metric.change}
                            </span> -->
                        </div>

                        <div class="bg-white p-6 rounded-xl shadow-sm">
                            <h3 class="text-gray-500 text-sm font-medium">Total Orders</h3>
                            <p class="mt-2 text-3xl font-semibold text-gray-900">{data?.total_orders}</p>
                            <!-- <span class={`inline-flex items-center mt-2 text-sm ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.change.startsWith('+') ? '↑' : '↓'} {metric.change}
                            </span> -->
                        </div>


                        <div class="bg-white p-6 rounded-xl shadow-sm">
                            <h3 class="text-gray-500 text-sm font-medium">Avg Order Value</h3>
                            <p class="mt-2 text-3xl font-semibold text-gray-900">₹ {Number(data?.average_order_value).toFixed(2)}</p>
                            <!-- <span class={`inline-flex items-center mt-2 text-sm ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.change.startsWith('+') ? '↑' : '↓'} {metric.change}
                            </span> -->
                        </div>



                        <div class="bg-white p-6 rounded-xl shadow-sm">
                            <h3 class="text-gray-500 text-sm font-medium">Items Sold</h3>
                            <p class="mt-2 text-3xl font-semibold text-gray-900">{data?.total_items}</p>
                            <!-- <span class={`inline-flex items-center mt-2 text-sm ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.change.startsWith('+') ? '↑' : '↓'} {metric.change}
                            </span> -->
                        </div>


                        
                </div>


                <SalesChart authUser={authUser} />

                
            </div>
