<script>
    import { onMount } from 'svelte';
    import Icon from '@iconify/svelte';
    import { PUBLIC_API_URL } from '$env/static/public';
    import { myFetch } from '$lib/utils/myFetch.js';
    import { addAlert } from '$lib/stores/alert.js';

    export let product_listing;
    
    let offers = [];
    let loading = true;
    let error = null;

    async function fetchProductOffers() {
        try {
            loading = true;
            error = null;
            console.log('Fetching offers for product:', product_listing.id);
            const response = await myFetch(`${PUBLIC_API_URL}/offer/product-offers/${product_listing.id}/`);
            console.log('Offers response:', response);
            
            if (Array.isArray(response)) {
                // Filter only product-specific offers and active offers
                offers = response.filter(offer => 
                    offer.offer_scope === 'product' && 
                    offer.is_active && 
                    new Date(offer.valid_until) > new Date()
                );
                console.log('Filtered offers:', offers);
            } else {
                console.error('Unexpected response format:', response);
                error = 'Unexpected response format';
                addAlert('Failed to load product offers: Invalid response format', 'error');
            }
        } catch (err) {
            console.error('Error fetching offers:', err);
            error = 'Failed to load offers';
            addAlert('Failed to load product offers', 'error');
            offers = [];
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        if (product_listing?.id) {
            fetchProductOffers();
        }
    });

    function formatDiscount(offer) {
        if (!offer) return '';
        
        if (offer.offer_type === 'discount') {
            return `${offer.get_discount_percent}% OFF`;
        } else if (offer.offer_type === 'buy_x_get_y') {
            return `Buy ${offer.buy_quantity} Get ${offer.get_quantity} with ${offer.get_discount_percent}% OFF`;
        } else if (offer.offer_type === 'bundle') {
            return `Bundle Offer - ${offer.get_discount_percent}% OFF`;
        }
        return '';
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
</script>

{#if loading}
    <div class="flex justify-center py-4">
        <span class="loading loading-spinner loading-sm text-primary"></span>
    </div>
{:else if error}
    <div class="text-error text-sm mt-2">
        {error}
    </div>
{:else if offers.length > 0}
    <div class="mt-4 mb-6">
        <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <Icon icon="mdi:tag-multiple" class="w-5 h-5 text-primary" />
            Available Offers
        </h3>
        <div class="space-y-3">
            {#each offers as offer}
                {#if offer}
                    <div class="bg-base-100 border border-primary/20 rounded-lg p-4 hover:border-primary/40 transition-all duration-200">
                        <div class="flex items-start gap-3">
                            <div class="flex-shrink-0">
                                <Icon 
                                    icon={offer.offer_type === 'discount' ? 'mdi:sale' : 
                                          offer.offer_type === 'buy_x_get_y' ? 'mdi:gift' : 'mdi:package-variant'}
                                    class="w-6 h-6 text-primary"
                                />
                            </div>
                            <div class="flex-1">
                                <h4 class="font-medium text-primary">
                                    {formatDiscount(offer)}
                                </h4>
                                <p class="text-sm text-gray-600 mt-1">{offer.description}</p>
                                {#if offer.valid_until}
                                    <p class="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                        <Icon icon="mdi:calendar-clock" class="w-4 h-4" />
                                        Valid till {formatDate(offer.valid_until)}
                                    </p>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/if}
            {/each}
        </div>
    </div>
{/if}

<style>
    /* Hover effect for offer cards */
    .border-primary\/20 {
        transition: all 0.2s ease-in-out;
    }
    
    .border-primary\/20:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
</style> 