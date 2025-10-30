import { PUBLIC_API_URL } from '$env/static/public';
import { myFetch } from '$lib/utils/myFetch';

const API_BASE_URL = PUBLIC_API_URL.endsWith('/') ? PUBLIC_API_URL.slice(0, -1) : PUBLIC_API_URL;

export const offerApi = {
    // Validate coupon
    validateCoupon: async (code, cartValue = 0, productId = null) => {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('cart_value', cartValue.toString());
            if (productId) {
                queryParams.append('product_id', productId.toString());
            }
            const response = await myFetch(
                `${API_BASE_URL}/offer/validate-coupon/${code}?${queryParams.toString()}`
            );
            return response;
        } catch (error) {
            console.error('Error validating coupon:', error);
            throw error;
        }
    },

    // Validate offer
    validateOffer: async (offerId, productIds, quantities) => {
        try {
            const response = await myFetch(
                `${API_BASE_URL}/offer/validate-offer/${offerId}`,
                'POST',
                {
                    product_ids: productIds,
                    quantities: quantities
                }
            );
            return response;
        } catch (error) {
            console.error('Error validating offer:', error);
            throw error;
        }
    },

    // Get active coupons
    getActiveCoupons: async () => {
        try {
            const response = await myFetch(`${API_BASE_URL}/offer/coupons?is_active=true`);
            return response;
        } catch (error) {
            console.error('Error fetching coupons:', error);
            return [];
        }
    },

    // Get active offers
    getActiveOffers: async () => {
        try {
            const response = await myFetch(`${API_BASE_URL}/offer/offers?is_active=true`);
            return response;
        } catch (error) {
            console.error('Error fetching offers:', error);
            return [];
        }
    }
}; 