
<script>
  import { page } from "$app/stores";
  import { onMount, onDestroy } from "svelte";
  import { PUBLIC_API_URL } from "$env/static/public";
  import { myFetch } from "$lib/utils/myFetch";
  import { user } from "$lib/stores/auth";
  import { addAlert } from "$lib/stores/alert";
  import { goto } from '$app/navigation';

  let authUser;
  $: authUser = $user;

  let orderItem;
  let verificationChecking = true;
  let verified = false;
  let reviewFound = false;
  let isSubmitting = false;
  let submissionSuccess = false;
  let errors = {};

  let orderItemId = $page.params.orderItemId;
  let review = {
    title: "",
    rating: 5,
    comment: "",
  };

  async function getOrderItem() {
    let url = `${PUBLIC_API_URL}/order/order-items/${orderItemId}/`;
    try {
      let data = await myFetch(url);
      console.log(data)
      orderItem = data;
      verified = data.order.user_id === authUser.user_id;
    } catch (e) {
      console.log(e);
    } finally {
      verificationChecking = false;
    }
  }

  function setRating(selectedRating) {
    review.rating = selectedRating;
    errors.rating = null;
  }

  async function checkReview() {
    let url = `${PUBLIC_API_URL}/review/reviews/order-item/${orderItemId}`;
    try {
      let data = await myFetch(url);
      review = data;
      reviewFound = true;
    } catch (e) {
    }
  }

  onMount(() => {
    getOrderItem();
    checkReview();
  });

  function validate() {
    errors = {};
    let isValid = true;

    if (review.rating < 1) {
      errors.rating = "Please select a rating";
      isValid = false;
    }

    if (review.comment.trim().length < 10) {
      errors.comment = "Review must be at least 10 characters";
      isValid = false;
    }

    return isValid;
  }

  async function submitReview() {
    if (!validate()) return;

    isSubmitting = true;

    try {
      let url1 = `${PUBLIC_API_URL}/review/reviews/`;
      let formData = {
        title: review.title,
        comment: review.comment,
        rating: review.rating,
        user_id: authUser.user_id,
        order_item_id: orderItemId,
        product_listing_id: orderItem?.product_listing.id,
      };

      let url2 = `${PUBLIC_API_URL}/review/reviews/${review.id}/`;

      if (reviewFound) {
        let data = await myFetch(url2, "PUT", formData, authUser.access_token);
        review = data;
      } else {
        let data = await myFetch(url1, "POST", formData, authUser.access_token);
        review = data;
      }
      submissionSuccess = true;
      addAlert("You have reviewed the product successfully", "success");
    } catch (error) {
      console.log(error);
      errors.submission = error.message;
    } finally {
      isSubmitting = false;
    }
  }
</script>



{#if verificationChecking}
    <div class="text-center p-8">
      <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      <p class="mt-4 text-gray-600">Verifying your purchase...</p>
    </div>

{:else}
  {#if !verified}
  <div class="max-w-2xl mx-auto p-6 my-8 bg-red-50 rounded-lg border border-red-200">
    <div class="flex items-center gap-3 text-red-700">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p class="font-medium">You need to purchase this product to write a review</p>
    </div>
  </div>

  {:else}
      {#if submissionSuccess}
          <div class="max-w-2xl mx-auto p-6 my-8">
              <div class="p-4 bg-green-50 rounded-lg border border-green-200 flex items-center gap-3 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-green-700 font-medium">Review submitted successfully!</span>
              </div>
              <a href="/profile/orders" class="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                  </svg>
                  Return to Your Orders
              </a>
          </div>
      {:else}
      <div class="max-w-2xl mx-auto p-6 my-8 bg-white rounded-xl shadow-lg">
        <!-- Rest of the form content remains the same -->
        <div class="mb-8 flex items-start gap-4 border-b pb-6">
          {#if orderItem?.product_main_image}
            <img
              src={orderItem.product_main_image}
              alt={orderItem.product_listing.name}
              class="w-20 h-20 object-cover rounded-lg"
            />
          {:else}
            <div class="w-20 h-20 bg-gray-100 rounded-lg"></div>
          {/if}
          <div>
            <p class="text-sm text-gray-500">Reviewing your purchase</p>
            <h1 class="text-xl font-semibold text-gray-900">{orderItem?.product_listing?.name}</h1>
            <div class="mt-1 text-sm text-gray-500">
              Purchased on {new Date(orderItem?.created).toLocaleDateString()}
            </div>
          </div>
        </div>
      
        {#if reviewFound}
          <div class="mb-6 bg-blue-50 p-4 rounded-lg flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <span class="text-blue-700 font-medium">You've already reviewed this product. You can update your review below.</span>
          </div>
        {/if}
      
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Overall Rating</label>
            <div class="flex items-center gap-1">
              {#each Array(5) as _, i}
                <button
                  on:click|preventDefault={() => setRating(i + 1)}
                  class={`p-1 transition-colors ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  aria-label={`Rate ${i + 1} stars`}
                >
                  <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              {/each}
            </div>
            {#if errors.rating}
              <p class="mt-2 text-sm text-red-600">{errors.rating}</p>
            {/if}
          </div>
      
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Review Title</label>
            <input
              bind:value={review.title}
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Summarize your experience"
            />
          </div>
      
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
            <textarea
              bind:value={review.comment}
              rows="5"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What did you like or dislike about this product? How does it compare to similar products?"
            ></textarea>
            {#if errors.comment}
              <p class="mt-2 text-sm text-red-600">{errors.comment}</p>
            {/if}
          </div>
      
          {#if errors.submission}
            <div class="p-4 bg-red-50 rounded-lg border border-red-200 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <span class="text-red-700 font-medium">{errors.submission}</span>
            </div>
          {/if}
      
          <button
            on:click|preventDefault={submitReview}
            disabled={isSubmitting}
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if isSubmitting}
              <span class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            {:else}
              {reviewFound ? 'Update Review' : 'Submit Review'}
            {/if}
          </button>
        </div>
      </div>

      {/if}
  {/if}
{/if}




