import { PUBLIC_API_URL } from '$env/static/public';
import { myFetch } from '$lib/utils/myFetch';
import { PUBLIC_ESTORE_ID } from '$env/static/public';
const API_BASE_URL = PUBLIC_API_URL.endsWith('/') ? PUBLIC_API_URL.slice(0, -1) : PUBLIC_API_URL;


export const productApi = {
    // Get all products with filters
    getProducts: async (params = {}) => {
      try {
        const queryParams = new URLSearchParams({
          page: params.page || '1',
          estore_id: PUBLIC_ESTORE_ID,
          is_service: "false",
          page_size: params.pageSize || '12',
          ...(params.category_id && { category_id: params.category_id.toString() }),
          ...(params.search && { search: params.search.trim() }),
          ...(params.ordering && { ordering: params.ordering }),
          ...(params.brand_ids && { brand_ids: params.brand_ids }),
          ...(params.min_price && { min_price: params.min_price }),
          ...(params.max_price && { max_price: params.max_price }),
          ...(params.feature_filters && { feature_filters: JSON.stringify(params.feature_filters) })
        });
        let url = `${API_BASE_URL}/product/product-listings/?approved=true&${queryParams}`
        // console.log(url);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        // console.log('API Response:', data); 
        return data;
      } catch (error) {
        console.error('Error fetching products:', error);
        return { results: [], count: 0 };
      }
    },
  
    // Get single product
    getProduct: async (slug) => {
      const response = await fetch(`${API_BASE_URL}/product/product-listings/slug/${slug}/`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return response.json();
    },
  
    // Get filter options
    getFilters: async (params = {}) => {
      const queryParams = new URLSearchParams({
        estore_id: PUBLIC_ESTORE_ID,
        is_service: "false",
        ...(params.category_id && { category_id: params.category_id }),
        ...(params.brand_ids && { brand_ids: params.brand_ids }),
        ...(params.search && { search: params.search.trim() }),
        ...(params.min_price && { min_price: params.min_price }),
        ...(params.max_price && { max_price: params.max_price })
      });
      const response = await fetch(`${API_BASE_URL}/product/sidebar-filters/?approved=true&${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch filters');
      return response.json();
    },
  
    // Get product listing by ID
    getProductListingById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/product/product-listings/${id}/`);
      if (!response.ok) throw new Error('Failed to fetch product listing');
      return response.json();
    },
  
    // Update variant
    updateVariant: async (variantId, payload, token) => {
      const response = await fetch(`${API_BASE_URL}/product/variants/${variantId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to update variant');
      return response.json();
    },
  };