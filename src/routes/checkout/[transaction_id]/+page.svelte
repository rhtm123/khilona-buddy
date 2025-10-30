<script>

  import { PUBLIC_API_URL, PUBLIC_ESTORE_ID } from '$env/static/public';
  import { myFetch } from '$lib/utils/myFetch.js';

  import { user } from '$lib/stores/auth';


  export let data;
  $: payment = data?.payment;

  let authUser;
  $: authUser = $user;

  let creating = false;



  // Helper function to format payment method
  const formatPaymentMethod = (method) => {
    return method === "pg" ? "Online" : "Cash on Delivery";
  };

  async function createPayment(){
    creating = true;
    let urlp = `${PUBLIC_API_URL}/payment/payments/`;

    payment = await myFetch(urlp, "POST", {
              "order_id": payment.order_id,
              "amount": payment.amount,
              "estore_id": PUBLIC_ESTORE_ID,
              payment_method: "pg",
            }, authUser.access_token);

            if (payment.payment_method=="pg") {
              window.location = payment.payment_url 
            } else {
              goto("/checkout/"+payment.transaction_id);
            }
  }
</script>

<div class="min-h-screen flex items-center justify-center p-4">
  {#if data?.error}
    <div class="max-w-md w-full bg-red-50 p-6 rounded-lg shadow-md text-center">
      <h2 class="text-xl font-bold text-red-700 mb-4">Error Occurred</h2>
      <p class="text-red-600">Error: {data.error}</p>
      <p class="mt-2 text-gray-600">Please try again later or contact support.</p>
    </div>
  {:else if payment}
    {#if payment.status === "completed" && payment.payment_method === "pg"}
      <div class="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <h1 class="text-2xl font-bold text-center mb-6 text-green-600">Payment Successful</h1>
        
        <div class="space-y-4">
          <div class="flex justify-between border-b pb-2">
            <span class="font-medium text-gray-700">Payment Status:</span>
            <span class="capitalize">{payment.status}</span>
          </div>
          <div class="flex justify-between border-b pb-2">
            <span class="font-medium text-gray-700">Payment Method:</span>
            <span>{formatPaymentMethod(payment.payment_method)}</span>
          </div>
          <div class="flex justify-between border-b pb-2">
            <span class="font-medium text-gray-700">Amount:</span>
            <span>₹ {payment.amount?.toLocaleString() || 'N/A'}</span>
          </div>
          <div class="flex justify-between border-b pb-2">
            <span class="font-medium text-gray-700">Order Number:</span>
            <span>{payment.order_number || 'N/A'}</span>
          </div>
          <div class="flex justify-between border-b pb-2">
            <span class="font-medium text-gray-700">Date:</span>
            <span>{payment.created ? new Date(payment.created).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>

        <div class="text-center mt-6">
          <a href="/profile/orders" class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors duration-200">
            Go to Orders
          </a>
        </div>
      </div>
    {:else if payment.status === "pending" && payment.payment_method === "pg"}
      <div class="max-w-md w-full bg-yellow-50 p-6 rounded-lg shadow-md text-center">
        <h2 class="text-xl font-bold text-yellow-700 mb-4">Payment Pending</h2>
        <div class="text-center mt-4">
          <p class="text-gray-600">Your payment is being processed. Please wait for confirmation.</p>

          <p class="text-gray-600">If you have not completed your payment, please 

            <button on:click={createPayment} class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors duration-200">
              {#if creating}
                    <span class="loading loading-spinner loading-sm mr-2"></span>
                        Creating..
                    {:else}
                        Create Payment
                    {/if}
            </button>
          </p>
        </div>
      </div>

    {:else if payment.status === "failed"}
      <div class="max-w-md w-full bg-red-50 p-6 rounded-lg shadow-md text-center">
        <h2 class="text-xl font-bold text-red-700 mb-4">Payment Failed</h2>
        <p class="text-red-600">Unfortunately, your payment could not be processed.</p>
        <p class="mt-2 text-gray-600">Please check your payment details or try again later.</p>
        <div class="text-center mt-6">
          <button on:click={createPayment} class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors duration-200">
            {#if creating}
                  <span class="loading loading-spinner loading-sm mr-2"></span>
                      Creating..
                  {:else}
                      Create Payment
                  {/if}
          </button>
        </div>
      </div>
    {:else if payment.payment_method === "cod"}
      <div class="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <h1 class="text-2xl font-bold text-center mb-6 text-blue-600">Order Received</h1>
        
        <div class="space-y-4">
          <div class="flex justify-between border-b pb-2">
            <span class="font-medium text-gray-700">Order Number:</span>
            <span>{payment.order_number || 'N/A'}</span>
          </div>
          <div class="flex justify-between border-b pb-2">
            <span class="font-medium text-gray-700">Date:</span>
            <span>{payment.created ? new Date(payment.created).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div class="flex justify-between border-b pb-2">
            <span class="font-medium text-gray-700">Total:</span>
            <span>₹ {payment.amount?.toLocaleString() || 'N/A'}</span>
          </div>
          <div class="flex justify-between border-b pb-2">
            <span class="font-medium text-gray-700">Payment Method:</span>
            <span>{formatPaymentMethod(payment.payment_method)}</span>
          </div>
        </div>

        <p class="text-center text-gray-600 mt-6">**Please pay with cash upon delivery.**</p>
        <div class="text-center mt-6">
          <a href="/profile/orders" class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors duration-200">
            Go to Orders
          </a>
        </div>
      </div>
    {/if}
  {:else}
    <div class="max-w-md w-full bg-gray-50 p-6 rounded-lg shadow-md text-center">
      <p class="text-gray-600">No payment information available.</p>
    </div>
  {/if}
</div>