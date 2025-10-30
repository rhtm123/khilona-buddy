// src/routes/product/[slug]/+page.server.js
import { error } from '@sveltejs/kit';
import { productApi } from '$lib/services/productApi';

export async function load({ params }) {
    
    try {
        const product_listing = await productApi.getProduct(params.slug);
        // console.log(product_listing);

        if (!product_listing) {
            throw error(404, 'Product not found');
        }

        return {
            product_listing: product_listing,
            category: product_listing.category,
        };
    } catch (err) {
        throw error(500, 'Failed to fetch product data');
    }
}