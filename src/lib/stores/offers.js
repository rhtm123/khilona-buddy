import { writable, derived } from 'svelte/store';

// Store for applied coupon
export const appliedCoupon = writable(null);

// Store for applied offer
export const appliedOffer = writable(null);

// Combined discounts store
export const cartDiscounts = derived(
    [appliedCoupon, appliedOffer],
    ([$appliedCoupon, $appliedOffer]) => {
        const couponDiscount = $appliedCoupon ? $appliedCoupon.discount : 0;
        const offerDiscount = $appliedOffer ? $appliedOffer.discount_amount : 0;

        return {
            couponDiscount,
            offerDiscount,
            totalDiscount: couponDiscount + offerDiscount,
            type: $appliedCoupon ? 'coupon' : ($appliedOffer ? 'offer' : null)
        };
    }
); 