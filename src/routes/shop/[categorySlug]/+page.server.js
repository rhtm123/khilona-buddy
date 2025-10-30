
import { categoryApi } from '$lib/services/categoryApi.js';
export async function load({ params }) {
  const category = await categoryApi.getCategorySlug(params.categorySlug);
  
  return {
    category: category,
    }
}