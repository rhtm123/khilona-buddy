
import { categoryApi } from '$lib/services/categoryApi.js';
export async function load({ params }) {
  const category = await categoryApi.getCategory(params.categorySlug);

  return {
    category: category
    }
}