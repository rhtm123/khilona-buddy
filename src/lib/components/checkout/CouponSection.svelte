<script>
    import { fade, slide } from 'svelte/transition';
    import { offerApi } from '$lib/services/offerApi';
    import { cart } from '$lib/stores/cart';
    import { appliedCoupon, appliedOffer, cartDiscounts } from '$lib/stores/offers';
    import { addAlert } from '$lib/stores/alert';

    let couponCode = '';
    let loading = false;
    let showCouponInput = false;

    $: cartTotal = $cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    async function applyCoupon() {
        if (!couponCode.trim()) {
            addAlert('Please enter a coupon code', 'error');
            return;
        }

        // Check if an offer is already applied
        if ($appliedOffer) {
            addAlert('Please remove the applied offer before applying a coupon', 'error');
            return;
        }

        loading = true;
        try {
            const validation = await offerApi.validateCoupon(
                couponCode.trim(),
                cartTotal
            );

            if (validation?.is_valid) {
                appliedCoupon.set({
                    code: couponCode,
                    discount_type: validation.discount_type,
                    discount_value: validation.discount_value,
                    discount: Math.round(parseFloat(validation.discount_amount)) || 0
                });
                addAlert('Coupon applied successfully', 'success');
                showCouponInput = false;
            } else {
                addAlert(validation?.message || 'Invalid coupon code', 'error');
                couponCode = '';
            }
        } catch (error) {
            console.error('Error validating coupon:', error);
            addAlert('Failed to validate coupon. Please try again.', 'error');
            couponCode = '';
        } finally {
            loading = false;
        }
    }

    function removeCoupon() {
        appliedCoupon.set(null);
        couponCode = '';
        addAlert('Coupon removed', 'info');
    }
</script>

<div class="space-y-4">
    <!-- Applied Coupon -->
    {#if $appliedCoupon}
        <div class="bg-white rounded-lg p-4 border" in:fade>
            <div class="flex justify-between items-center">
                <div>
                    <span class="text-sm text-gray-600">Applied Coupon:</span>
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-primary">{$appliedCoupon.code}</span>
                        <span class="text-green-600">
                            {#if $appliedCoupon.discount_type === 'percentage'}
                                ({$appliedCoupon.discount_value}% off)
                            {:else}
                                (-₹{$appliedCoupon.discount.toFixed(2)})
                            {/if}
                        </span>
                    </div>
                </div>
                <button 
                    class="btn btn-sm btn-ghost text-red-500"
                    on:click={removeCoupon}
                >
                    Remove
                </button>
            </div>
        </div>
    {:else if !$appliedOffer}
        <!-- Coupon Input -->
        <div class="bg-white rounded-lg p-4 border">
            {#if showCouponInput}
                <div class="space-y-3" in:slide>
                    <div class="flex gap-2">
                        <input
                            type="text"
                            bind:value={couponCode}
                            placeholder="Enter coupon code"
                            class="input input-bordered flex-1"
                            on:keydown={e => e.key === 'Enter' && applyCoupon()}
                        />
                        <button 
                            class="btn btn-primary"
                            disabled={loading}
                            on:click={applyCoupon}
                        >
                            {#if loading}
                                <span class="loading loading-spinner loading-xs"></span>
                            {:else}
                                Apply
                            {/if}
                        </button>
                    </div>
                </div>
            {:else}
                <button 
                    class="btn btn-outline btn-primary w-full"
                    on:click={() => showCouponInput = true}
                >
                    Have a coupon code?
                </button>
            {/if}
        </div>
    {/if}
</div> 