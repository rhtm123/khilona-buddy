import { PUBLIC_API_URL } from '$env/static/public';
import { myFetch } from '$lib/utils/myFetch.js';

export async function load({ params }) {

  let url = `${PUBLIC_API_URL}/blog/tags/slug/${params.slug}`

  try {
    let tag = await myFetch(url);

    return {
      tag: tag,
      error: false,
    }
  } catch (err) { 
    console.log(err);
    return {
      error: true,
    }
  }
} 