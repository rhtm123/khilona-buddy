<script>
    export let authUser; // Ensure authUser is properly passed to this component
    import { onMount } from 'svelte';
    import { myFetch } from '$lib/utils/myFetch';
    import { PUBLIC_API_URL } from '$env/static/public';
    import { Chart } from 'chart.js/auto';

    let revenueChartCanvas, quantityChartCanvas;
    let revenueChartInstance = null;
    let quantityChartInstance = null;
    let period = "weekly";
    let loading = false;

    // Ensure charts are only initialized after component mounts
    onMount(async () => {
        await fetchSalesBreakdown();
    });

    async function fetchSalesBreakdown() {
        try {
            // Add null checks for authUser
            if (!authUser?.entity?.id) {
                console.error("User not properly authenticated");
                return;
            }

            loading = true;
            const url = `${PUBLIC_API_URL}/order/seller-analytics/sales-breakdown?period=${period}&seller_id=${authUser.entity.id}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error("Network response was not ok");
            
            const data = await response.json();
            console.log("Fetched data:", data);

            // Destroy existing charts before creating new ones
            if (revenueChartInstance) {
                revenueChartInstance.destroy();
                revenueChartInstance = null;
            }
            if (quantityChartInstance) {
                quantityChartInstance.destroy();
                quantityChartInstance = null;
            }

            // Format data
            const labels = data.sales_breakdown.map(entry => 
                new Date(entry.created__date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                })
            );

            const revenueData = data.sales_breakdown.map(entry => 
                parseFloat(entry.total_revenue)
            );

            const quantityData = data.sales_breakdown.map(entry => 
                entry.total_quantity
            );

            // Create new charts only if canvas elements exist
            if (revenueChartCanvas) {
                revenueChartInstance = createChart(
                    revenueChartCanvas,
                    labels,
                    'Total Revenue (₹)',
                    revenueData,
                    'rgb(79, 102, 225)'
                );
            }

            if (quantityChartCanvas) {
                quantityChartInstance = createChart(
                    quantityChartCanvas,
                    labels,
                    'Total Quantity',
                    quantityData,
                    'rgb(56, 161, 105)'
                );
            }

        } catch (error) {
            console.error("Error fetching sales data:", error);
        } finally {
            loading = false;
        }
    }

    function createChart(canvas, labels, label, data, color) {
        return new Chart(canvas, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: color,
                    backgroundColor: `${color}20`,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false,
                    pointRadius: 3,
                    pointBackgroundColor: color
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { display: false },
                        title: { display: true, text: "Date" }
                    },
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: label }
                    }
                }
            }
        });
    }

    function changePeriod(newPeriod) {
        if (period !== newPeriod) {
            period = newPeriod;
            fetchSalesBreakdown();
        }
    }
</script>

<div class="bg-white p-6 rounded-xl shadow-sm">
    <!-- Header section remains the same -->
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-semibold text-gray-900">Sales Overview</h2>
        <div class="flex space-x-4">
            <button 
                on:click={() => changePeriod("monthly")} 
                class={`text-sm ${period === "monthly" ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Monthly
            </button>
            <button 
                on:click={() => changePeriod("weekly")} 
                class={`text-sm ${period === "weekly" ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Weekly
            </button>
        </div>
    </div>

    <!-- Chart container - ensure canvas elements always exist in DOM -->
    <div class="h-96 bg-gray-50 rounded-lg p-4 relative">
        {#if loading}
            <div class="absolute inset-0 bg-white/50 flex items-center justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        {/if}

        <!-- Always render canvas elements -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            <div class="h-full">
                <canvas 
                    bind:this={revenueChartCanvas}
                    class="w-full h-full"
                ></canvas>
            </div>
            <div class="h-full">
                <canvas 
                    bind:this={quantityChartCanvas}
                    class="w-full h-full"
                ></canvas>
            </div>
        </div>
    </div>
</div>