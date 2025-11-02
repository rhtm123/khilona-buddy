<script>
  import Slider from "../Slider.svelte";
  export let recentReviews;

  const StarIcon = ({ filled }) => `
    <svg class="w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  `;
</script>


<section class="py-16 md:py-20 bg-base-100">
  <div class="mx-auto px-4 md:px-8 lg:px-16">
    <div class="mb-10 text-center">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-900"><span class="brand-gradient">What Our Families Say</span></h2>
      <p class="text-gray-600 mt-2">Real reviews from real families who love our toys.</p>
    </div>

    <Slider items={recentReviews}>
      {#each recentReviews as review}
        <div class="item rounded-2xl p-6 md:p-8 w-[320px] md:w-[360px] flex-shrink-0 border bg-white shadow-sm">
          <div class="flex items-center mb-4 gap-4">
            <img src={review?.product_listing?.main_image} alt={review?.product_listing?.name} class="w-14 h-14 rounded-full object-cover border" />
            <div>
              <h3 class="font-semibold text-gray-900">{review?.user?.first_name} {review?.user?.last_name}</h3>
              <p class="text-xs text-gray-500">{review?.product_listing?.name}</p>
            </div>
          </div>
          <div class="flex mb-3">
            {#each Array(5) as _, i}
              <svg class="w-4 h-4 {i < review.rating ? 'text-accent' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            {/each}
          </div>
          <p class="text-gray-700 text-sm">“{review.comment}”</p>
        </div>
      {/each}
    </Slider>
  </div>
</section>
