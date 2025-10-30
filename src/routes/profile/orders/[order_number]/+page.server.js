   // src/routes/product/[id]/+page.js

   export async function load({ params }) {
     
       return {
        //  relatedProducts: [],
       order_number: params.order_number
       };
      
   }