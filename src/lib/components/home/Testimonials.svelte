<script>
  import Slider from "../Slider.svelte";
  export let recentReviews;

  const StarIcon = ({ filled }) => `
    <svg class="w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  `;
</script>


<section class="py-16 md:py-24 bg-fun-gradient relative overflow-hidden">
  <!-- Playful background -->
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute top-10 left-10 w-32 h-32 bg-accent/15 rounded-full animate-float" style="animation-delay: 0.8s;"></div>
    <div class="absolute top-32 right-16 w-20 h-20 bg-primary/20 rounded-full animate-bounce-gentle" style="animation-delay: 1.3s;"></div>
    <div class="absolute bottom-20 left-20 w-28 h-28 bg-secondary/15 rounded-full animate-wiggle" style="animation-delay: 0.5s;"></div>
    <div class="absolute bottom-10 right-10 w-16 h-16 bg-warning/25 rounded-full animate-bounce-gentle" style="animation-delay: 1.8s;"></div>
  </div>
  
  <div class="mx-auto px-4 md:px-8 lg:px-16 relative">
    <!-- Fun Section Header -->
    <div class="mb-16 text-center">
      <p class="text-primary text-lg font-bold mb-3 animate-bounce-gentle">
        <span class="inline-block animate-wiggle mr-2">🗣️</span>
        Happy Parents & Kids!
        <span class="inline-block animate-wiggle ml-2">😍</span>
      </p>
      <h2 class="text-2xl md:text-4xl lg:text-5xl font-bold font-['Comic_Neue'] text-gray-800 mb-4">What Our Families Say</h2>
      <p class="text-gray-600 text-lg font-semibold">✨ Real reviews from real families who love our toys! ✨</p>
      <div class="mt-4 mx-auto w-32 h-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-full animate-bounce-gentle"></div>
    </div>


    <Slider items={recentReviews}>
      {#each recentReviews as review, index}
        <div class="item snap-start glass-toy rounded-2xl p-6 md:p-8 transform hover:scale-105 transition-all duration-500 w-[320px] md:w-[360px] flex-shrink-0 shadow-toy hover:shadow-fun animate-bounce-gentle" style="animation-delay: {index * 0.2}s;">
          <!-- Fun review header -->
          <div class="flex items-center mb-6 relative">
            <div class="relative">
              <img
                src={review?.product_listing?.main_image}
                alt={review?.product_listing?.name}
                class="w-20 h-20 rounded-full border-4 border-gradient-to-r from-primary to-accent object-cover shadow-fun animate-float"
              />
              <!-- Product sparkle -->
              <div class="absolute -top-1 -right-1 w-6 h-6 bg-warning rounded-full animate-sparkle opacity-80"></div>
            </div>
            <div class="ml-6">
              <h3 class="font-bold text-xl text-gray-800 font-['Comic_Neue']">{review?.user?.first_name} {review?.user?.last_name}</h3>
              <p class="text-sm text-gray-600 font-semibold bg-primary/10 px-2 py-1 rounded-full">🎨 {review?.product_listing?.name}</p>
            </div>
            <!-- Happy face -->
            <div class="absolute -top-2 -right-2 text-2xl animate-bounce-gentle">😊</div>
          </div>
          
          <!-- Fun rating stars -->
          <div class="flex justify-center mb-4 gap-1">
            {#each Array(5) as _, i}
              <div class="{i < review.rating ? 'text-warning animate-wiggle' : 'text-gray-300'} text-xl" style="animation-delay: {i * 0.1}s;">
                {i < review.rating ? '⭐' : '☆'}
              </div>
            {/each}
          </div>
          
          <!-- Review text with fun styling -->
          <div class="relative">
            <p class="text-gray-700 text-base md:text-lg font-semibold text-center leading-relaxed">
              💬 "{review.comment}" 💬
            </p>
            <!-- Quote decorations -->
            <div class="absolute -top-4 -left-2 text-4xl text-primary/30 font-bold">“</div>
            <div class="absolute -bottom-4 -right-2 text-4xl text-primary/30 font-bold">”</div>
          </div>
          
          <!-- Fun bottom decoration -->
          <div class="mt-4 flex justify-center">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-primary rounded-full animate-bounce-gentle"></div>
              <div class="w-2 h-2 bg-accent rounded-full animate-bounce-gentle" style="animation-delay: 0.1s;"></div>
              <div class="w-2 h-2 bg-secondary rounded-full animate-bounce-gentle" style="animation-delay: 0.2s;"></div>
            </div>
          </div>
        </div>
      {/each}
    </Slider>
  </div>
</section>
