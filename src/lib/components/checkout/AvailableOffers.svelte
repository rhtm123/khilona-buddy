<script>
    import { fade, slide } from 'svelte/transition';
    import { offerApi } from '$lib/services/offerApi';
    import { cart } from '$lib/stores/cart';
    import { appliedOffer, appliedCoupon } from '$lib/stores/offers';
    import { addAlert } from '$lib/stores/alert';

    let loading = false;
    let availableOffers = [];
    let isExpanded = false;

    async function loadAvailableOffers() {
        loading = true;
        try {
            const offers = await offerApi.getActiveOffers();
            const offersArray = Array.isArray(offers) ? offers : (offers?.results || []);
            // Filter for cart-wide offers only and exclude already applied offer
            availableOffers = offersArray.filter(offer => 
                offer.id !== $appliedOffer?.id && 
                offer.offer_scope === 'cart' &&
                offer.is_active &&
                new Date(offer.valid_until) > new Date()
            );
        } catch (error) {
            console.error('Error loading offers:', error);
            addAlert('Failed to load offers', 'error');
        } finally {
            loading = false;
        }
    }

    async function applyOffer(offer) {
        // Check if a coupon is already applied
        if ($appliedCoupon) {
            addAlert('Please remove the applied coupon before applying an offer', 'error');
            return;
        }

        loading = true;
        try {
            const cartItems = $cart;
            if (!cartItems || cartItems.length === 0) {
                addAlert('Your cart is empty', 'error');
                return;
            }

            const productIds = cartItems.map(item => item.id);
            const quantities = cartItems.map(item => item.quantity);
            
            const validation = await offerApi.validateOffer(
                offer.id,
                productIds,
                quantities
            );

            if (validation?.is_valid) {
                const offerData = {
                    ...offer,
                    discount_amount: Math.round(parseFloat(validation.discount_amount)) || 0
                };
                appliedOffer.set(offerData);
                addAlert('Offer applied successfully', 'success');
                availableOffers = availableOffers.filter(o => o.id !== offer.id);
                isExpanded = false;
            } else {
                addAlert(validation?.message || 'Offer cannot be applied', 'error');
            }
        } catch (error) {
            console.error('Error applying offer:', error);
            addAlert('Failed to apply offer. Please try again.', 'error');
        } finally {
            loading = false;
        }
    }

    function removeOffer(offer) {
        appliedOffer.set(null);
        availableOffers = [...availableOffers, offer];
        addAlert('Offer removed', 'info');
    }

    function formatDiscount(offer) {
        if (offer.offer_type === 'discount') {
            return `${offer.get_discount_percent}% off on cart total`;
        }
        return '';
    }

    function formatMinCartValue(value) {
        return `₹${parseFloat(value).toFixed(2)}`;
    }

    $: if ($cart.length > 0) {
        loadAvailableOffers();
    }
</script>

<div class="space-y-4">
    <!-- Applied Offer -->
    {#if $appliedOffer}
        <div class="bg-white rounded-lg shadow-sm p-4" in:fade>
            <h3 class="text-lg font-semibold mb-4">Applied Cart Offer</h3>
            <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg" in:slide>
                <div>
                    <div class="flex items-center gap-2">
                        <span class="badge badge-success">Cart Offer</span>
                        <span class="font-medium">{$appliedOffer.name}</span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">{$appliedOffer.description}</p>
                    <p class="text-sm text-green-600 mt-1">Discount: ₹{$appliedOffer.discount_amount}</p>
                </div>
                <button 
                    class="btn btn-sm btn-ghost text-red-500"
                    on:click={() => removeOffer($appliedOffer)}
                >
                    Remove
                </button>
            </div>
        </div>
    {:else if !$appliedCoupon}
        <!-- Available Cart Offers -->
        {#if availableOffers.length > 0}
            <div class="bg-white rounded-lg shadow-sm" in:fade>
                <button 
                    class="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                    on:click={() => isExpanded = !isExpanded}
                >
                    <div class="flex items-center gap-2">
                        <span class="text-lg font-semibold">Available Cart Offers</span>
                        <span class="badge badge-primary">{availableOffers.length}</span>
                    </div>
                    <svg 
                        class="w-5 h-5 transform transition-transform {isExpanded ? 'rotate-180' : ''}"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {#if isExpanded}
                    <div class="p-4 border-t" transition:slide>
                        <div class="space-y-4">
                            {#each availableOffers as offer}
                                <div class="border rounded-lg p-4 hover:border-primary transition-colors">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <span class="badge badge-primary mb-2">Cart Offer</span>
                                            <h4 class="font-semibold">{offer.name}</h4>
                                            <p class="text-sm text-gray-600 mt-1">{offer.description}</p>
                                            <p class="text-sm text-primary mt-2">{formatDiscount(offer)}</p>
                                            {#if offer.min_cart_value > 0}
                                                <p class="text-xs text-gray-500 mt-1">
                                                    Minimum cart value: {formatMinCartValue(offer.min_cart_value)}
                                                </p>
                                            {/if}
                                            {#if offer.valid_until}
                                                <p class="text-xs text-gray-500 mt-1">
                                                    Valid till: {new Date(offer.valid_until).toLocaleDateString()}
                                                </p>
                                            {/if}
                                        </div>
                                        
                                        <button 
                                            class="btn btn-primary btn-sm"
                                            disabled={loading}
                                            on:click={() => applyOffer(offer)}
                                        >
                                            {#if loading}
                                                <span class="loading loading-spinner loading-xs"></span>
                                            {:else}
                                                Apply
                                            {/if}
                                        </button>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
        {:else if !loading}
            <div class="text-center py-4 text-gray-500">
                No cart offers available
            </div>
        {/if}
    {/if}

    {#if loading}
        <div class="flex justify-center py-4">
            <span class="loading loading-spinner loading-md"></span>
        </div>
    {/if}
</div>

<style>
    .badge {
        text-transform: capitalize;
    }
</style> 