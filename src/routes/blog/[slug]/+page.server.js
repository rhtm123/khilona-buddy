
import { PUBLIC_API_URL } from '$env/static/public';
import { myFetch } from '$lib/utils/myFetch.js';

export async function load({ params }) {

  // console.log(params.slug);
  let url = `${PUBLIC_API_URL}/blog/blogs/slug/${params.slug}`
  // console.log(url);

  try {
    let blog = await myFetch(url);
    // console.log(blog);
    return {
      blog: blog,
      error: false,
    }
  } catch (err) { 
    return {
      error: true,
    }
  }
} 