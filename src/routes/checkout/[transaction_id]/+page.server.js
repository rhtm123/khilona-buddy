import { PUBLIC_API_URL } from '$env/static/public';
import { myFetch } from '$lib/utils/myFetch.js';

export async function load({ params }) {
  const transaction_id = params.transaction_id;
  
  
  let url = `${PUBLIC_API_URL}/payment/verify-payment?transaction_id=${transaction_id}`;
  // console.log(url);

  try {
    let payment = await myFetch(url);
    // console.log(payment);
    // console.log(blog);
    return {
      payment: payment,
      error: false,
    }
  } catch (err) { 
    return {
      error: true,
    }
  }


}