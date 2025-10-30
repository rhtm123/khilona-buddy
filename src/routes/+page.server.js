import { PUBLIC_API_URL } from '$env/static/public';
import { PUBLIC_ESTORE_ID } from '$env/static/public';
import { myFetch } from '$lib/utils/myFetch';
import { categoryApi } from '$lib/services/categoryApi';





// export const hydrate = false;

export const prerender = true;


export async function load() {
  
  let recentReviews = [];
  let bestProducts = [];
  let brands = [];
  let newProducts = [];
  let mainCategories = [];
  let estore = {};



  try{
    let url = `${PUBLIC_API_URL}/review/reviews/?page_size=6&estore_id=${PUBLIC_ESTORE_ID}&approved=true&ordering=-id`;
    let data1 = await myFetch(url);
    recentReviews = data1.results; // Ensure this matches the API response structure
  
  } catch(e) { 

  }


  let url1 = PUBLIC_API_URL + "/product/product-listings/?page=1&page_size=12&ordering=-popularity&approved=true&estore_id=" + PUBLIC_ESTORE_ID;
    // console.log(url);
    try {
      let data = await myFetch(url1);
      bestProducts = data.results;
    } catch (e) {
      console.log(e, "Error fetching data");
    }


    try {
        let data = await myFetch(`${PUBLIC_API_URL}/user/entities/?entity_type=brand&featured=true&estore_id=${PUBLIC_ESTORE_ID}`);
        brands = data.results;
      } catch (e) {
        
      } 

      
      try {
        let url2 = PUBLIC_API_URL + "/product/product-listings/?page=1&page_size=12&ordering=-id&approved=true&estore_id=" + PUBLIC_ESTORE_ID;
        // console.log(url);
        let data = await myFetch(url2);
        // console.log(data);
        newProducts = data.results;
        
      } catch (e) {
        console.log(e, "Error fetching data");
      }

      try {
        let data = await categoryApi.getMainCategories();
        mainCategories = data.results;
    
      } catch (e) {

      }

    let heroProducts = []

    let url3 = PUBLIC_API_URL + "/product/product-listings/?page=1&page_size=5&featured=true&ordering=-popularity&estore_id=" + PUBLIC_ESTORE_ID;
    try {
      let data = await myFetch(url3);
      heroProducts = data.results;
    } catch (e) {
      console.log(e, "Error fetching data");
    }


    
      try {
        let url = `${PUBLIC_API_URL}/estore/estores/${PUBLIC_ESTORE_ID}`;
        estore = await myFetch(url);
        
      } catch (e) {
        console.error("Error fetching estore data store:", e);
    }


  let homePage = {};
  try{
    let url = `${PUBLIC_API_URL}/estore/web-pages?estore_id=${PUBLIC_ESTORE_ID}&name=home`;
    let data1 = await myFetch(url);

    // console.log("Terms of Service Data:", data1);
    homePage =  data1.results[0] || {}; // Ensure this matches the API response structure
    // console.log(homePage);
  } catch(e) {
    console.error("Error fetching terms of service:", e);
  }
    

  return {
    recentReviews: recentReviews,
    bestProducts:bestProducts,
    brands: brands,
    newProducts: newProducts,
    mainCategories: mainCategories,
    heroProducts: heroProducts,
    estore: estore,
    homePage: homePage,
  };
}