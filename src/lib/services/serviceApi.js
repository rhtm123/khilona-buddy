import { PUBLIC_API_URL } from "$env/static/public"
import { PUBLIC_ESTORE_ID } from "$env/static/public";

class ServiceAPI {
  constructor() {
    this.baseURL = PUBLIC_API_URL
  }

  async getServices(params = {}) {
    try {
      const queryParams = {};
      queryParams.is_service = "true";
      queryParams.page = params.page || 1;
      queryParams.page_size = params.page_size || 20;

      if (params.category_id !== undefined && params.category_id !== null) {
        queryParams.category_id = params.category_id.toString();
      }
      if (params.brand_ids !== undefined && params.brand_ids !== null) {
        queryParams.brand_ids = params.brand_ids;
      }
      if (params.search !== undefined && params.search !== null) {
        queryParams.search = params.search.trim();
      }
      if (params.ordering !== undefined && params.ordering !== null) {
        queryParams.ordering = params.ordering;
      }
      if (params.min_price !== undefined && params.min_price !== null) {
        queryParams.min_price = params.min_price;
      }
      if (params.max_price !== undefined && params.max_price !== null) {
        queryParams.max_price = params.max_price;
      }
      queryParams.estore_id = PUBLIC_ESTORE_ID;

      const searchParams = new URLSearchParams(queryParams);

      const response = await fetch(`${this.baseURL}/product/product-listings/?approved=true&${searchParams}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching services:", error)
      throw error
    }
  }

  async getService(slug) {
    try {
      const response = await fetch(`${this.baseURL}/product/product-listings/slug/${slug}/`)
      return response.json()
    } catch (error) {
      console.error("Error fetching service:", error)
      throw error
    }
  }
  

  async getServiceById(productId) {
    try {
      const response = await fetch(`${this.baseURL}/product/products/${productId}/`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching service by ID:", error)
      throw error
    }
  }

  async getCategories(params = {}) {
    try {
      const searchParams = new URLSearchParams({
        page_size: 50,
        ...params,
      })

      const response = await fetch(`${this.baseURL}/product/categories/?${searchParams}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching categories:", error)
      throw error
    }
  }

  async getFilters(params = {}) {
    try {
      const queryParams = {};
      queryParams.is_service = "true";

      if (params.category_id !== undefined && params.category_id !== null) {
        queryParams.category_id = params.category_id;
      }
      if (params.brand_ids !== undefined && params.brand_ids !== null) {
        queryParams.brand_ids = params.brand_ids;
      }
      if (params.search !== undefined && params.search !== null) {
        queryParams.search = params.search.trim();
      }
      if (params.min_price !== undefined && params.min_price !== null) {
        queryParams.min_price = params.min_price;
      }
      if (params.max_price !== undefined && params.max_price !== null) {
        queryParams.max_price = params.max_price;
      }
      queryParams.estore_id = PUBLIC_ESTORE_ID;

      const searchParams = new URLSearchParams(queryParams);

      const response = await fetch(`${this.baseURL}/product/sidebar-filters/?approved=true&${searchParams}`);
      if (!response.ok) throw new Error('Failed to fetch filters');
      return response.json();
    } catch (error) {
      console.error('Error fetching filters:', error);
      throw error;
    }
  }
}

export const serviceApi = new ServiceAPI()
