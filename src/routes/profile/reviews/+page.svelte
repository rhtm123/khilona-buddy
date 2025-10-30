<script>
  import { onMount, onDestroy } from "svelte";
  import { user } from "$lib/stores/auth";
  import { PUBLIC_API_URL, PUBLIC_ESTORE_ID } from "$env/static/public";
  import { myFetch } from "$lib/utils/myFetch";
  import { addAlert } from "$lib/stores/alert";
    import SkeltonReviews from "$lib/components/skeltons/SkeltonReviews.svelte";

  let authUser;
  
  $: authUser = $user;

  
  let loading = true;
  let reviews = [];
  let next; 

  async function fetchReviews(){

    let url = `${PUBLIC_API_URL}/review/reviews/?user_id=${authUser.user_id}&estore_id=${PUBLIC_ESTORE_ID}`;
    let data = await myFetch(url);
    // console.log(data);

    reviews = data.results;
    next = data.next;

    loading = false;
  }

  onMount(()=>{
    fetchReviews();
  })

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  async function deleteReview(id) {
    let url = `${PUBLIC_API_URL}/review/reviews/${id}/`;
    myFetch(url, "DELETE", {}, authUser.access_token);
    addAlert("You have successfully deleted the review", "success")
    reviews = reviews.filter(review => review.id !== id);
  }

  // function editReview(id) {
  //   // Implement edit functionality
  //   console.log('Edit review:', id);
  // }


  async function loadMore() {
    loading = true;
        // console.log("Hello Bhai")
		const dataNew = await myFetch(next);
        console.log(dataNew);
    reviews = [...reviews,...dataNew.results];
    next = dataNew.next;
    loading = false
    }

</script>

<div class="space-y-6">
  <h2 class="text-2xl font-bold md:block hidden">My Reviews & Ratings</h2>


    <div class="space-y-4">
      {#each reviews as review (review.id)}
        <div class="border rounded-lg p-4">
          <div class="flex items-start space-x-4">
            <img 
              src={review?.product_listing?.main_image} 
              alt={review?.product_listing.name}
              class="w-20 h-20 object-cover rounded"
            />
            
            <div class="flex-1">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-medium">{review?.product_listing.name}</h3>
                  <div class="flex items-center mt-1">
                    {#each Array(5) as _, i}
                      <svg 
                        class="w-4 h-4 {i < review.rating ? 'text-yellow-400' : 'text-gray-300'}" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    {/each}
                  </div>
                </div>
                
                <div class="flex space-x-2">
                  
                  <a 
                    href={"/profile/add-review/"+review?.order_item_id}
                    on:click={() => editReview(review.id)}
                    class="text-gray-600 hover:text-gray-800"
                  >
                    Edit
                  </a>
                  <button 
                    on:click={() => deleteReview(review.id)}
                    class="text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p class="text-gray-600 mt-2">{review.comment}</p>
              
              <div class="flex items-center justify-between mt-4 text-sm text-gray-500">
                <div class="flex items-center space-x-4">
                  <span>Posted on {formatDate(review.created)}</span>
                  <!-- <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
                    </svg>
                    {review.likes} people found this helpful
                  </span> -->
                </div>
                <!-- <span class="inline-block px-2 py-1 rounded-full text-xs 
                  {review.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                  {review.status}
                </span> -->
              </div>
            </div>
          </div>
        </div>
      {/each}

      {#if loading}
        <SkeltonReviews />
      {/if}


      {#if (next && !loading)}
        <button class="btn btn-sm my-4" on:click={loadMore}>Load More</button>
      {/if}

    </div>
  {#if (reviews.length ==0 && !loading)}
    <div class="text-center py-12">
      <div class="mb-4">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900">No reviews yet</h3>
      <p class="mt-1 text-gray-500">Share your experience by reviewing products you've purchased</p>
      <div class="mt-6">
        <a href="/profile/orders" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600">
          View Orders
        </a>
      </div>
    </div>
  {/if}
</div> 