import { PUBLIC_API_URL } from '$env/static/public';
import { myFetch } from '$lib/utils/myFetch.js';

export async function load({ params, parent }) {


  // console.log(layoutData);


  let url = `${PUBLIC_API_URL}/product/categories/slug/${params.slug}/`

  try {
    let category = await myFetch(url);
    let error = false;

    return {
        category,
        error
    }
  } catch (err) { 
    return {
      error: true,
    }
  }
} 