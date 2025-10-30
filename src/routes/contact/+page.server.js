export const prerender = true;

import { PUBLIC_ESTORE_ID } from '$env/static/public';
import { PUBLIC_API_URL } from '$env/static/public';
import { myFetch } from '$lib/utils/myFetch';



export async function load() {
//   console.log("Loading Terms of Service Page");
  let staticPage = "";

  let estore = {};

    try {
      let url = `${PUBLIC_API_URL}/estore/estores/${PUBLIC_ESTORE_ID}`;
      estore = await myFetch(url);
      
    } catch (e) {
      console.error("Error fetching estore data store:", e);
  }

  try{
    let url = `${PUBLIC_API_URL}/estore/web-pages?estore_id=${PUBLIC_ESTORE_ID}&name=contact`;
    let data1 = await myFetch(url);
    // console.log("Terms of Service Data:", data1);
    staticPage =  data1.results[0] || ""; // Ensure this matches the API response structure
  } catch(e) {
    console.error("Error fetching terms of service:", e);
  }

  return {
    staticPage,
    estore
  };
}

