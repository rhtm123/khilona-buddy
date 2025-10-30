import { PUBLIC_API_URL } from "$env/static/public"
import { PUBLIC_ESTORE_ID } from "$env/static/public"
import { myFetch } from "$lib/utils/myFetch"

export const categoryApi = {
  // Get all categories with filters
  getParentsChildrenCategories: async (category_id) => {
    try {
      const data = await myFetch(`${PUBLIC_API_URL}/product/categories/parents-children/${category_id}/`)
      return data
    } catch (e) {
      throw new Error("Failed to fetch")
    }
  },

  getMainCategories: async () => {
    try {
      const data = await myFetch(
        `${PUBLIC_API_URL}/product/categories/?page=1&page_size=10&estore_id=${PUBLIC_ESTORE_ID}&level=1&category_type=product&approved=true`,
      )
      return data
    } catch (e) {
      throw new Error("Failed to fetch")
    }
  },

  // Get service categories specifically
  getServiceCategories: async (params = {}) => {
    try {
      const searchParams = new URLSearchParams({
        category_type: "service",
        page_size: 50,
        estore_id: PUBLIC_ESTORE_ID,
        ...params,
      })
      const data = await myFetch(`${PUBLIC_API_URL}/product/categories/?${searchParams}`)
      // console.log(data)
      return data
    } catch (e) {
      throw new Error("Failed to fetch service categories")
    }
  },

  // Get single category by slug
  getCategorySlug: async (slug) => {
    try {
      const data = await myFetch(`${PUBLIC_API_URL}/product/categories/slug/${slug}/`)
      return data
    } catch (err) {
      throw new Error("Failed to fetch")
    }
  },
}
