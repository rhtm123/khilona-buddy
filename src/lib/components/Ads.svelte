<!-- Add this component after Hero and before HomeCategories -->
<script>
    import { onMount } from 'svelte';
    import { PUBLIC_API_URL } from '$env/static/public';
    import { myFetch } from '$lib/utils/myFetch';
    import { fade } from 'svelte/transition';
    
    let ads = [];
    let currentPage = 0;
    let interval;
    let isHovering = false;
    const adsPerPage = 3;
    
    onMount(async () => {
      try {
        const response = await myFetch(`${PUBLIC_API_URL}/ads/advertisements?page=1&page_size=5`);
        console.log(response)
        const today = new Date();
        ads = response.results.filter(ad => {
          const startDate = new Date(ad.start_date);
          const endDate = new Date(ad.end_date);
          return startDate <= today && today <= endDate;
        });
        
        startAutoplay();
      } catch (error) {
        console.error("Error fetching ads:", error);
      }

      return () => {
        if (interval) clearInterval(interval);
      };
    });
    
    $: totalPages = Math.ceil(ads.length / adsPerPage);
    $: visibleAds = ads.slice(currentPage * adsPerPage, (currentPage + 1) * adsPerPage);
    
    function startAutoplay() {
      if (!isHovering && ads.length > adsPerPage) {
        interval = setInterval(() => {
          nextPage();
        }, 5000);
      }
    }
    
    function stopAutoplay() {
      if (interval) {
        clearInterval(interval);
      }
    }
    
    function nextPage() {
      currentPage = (currentPage + 1) % totalPages;
    }
    
    function prevPage() {
      currentPage = (currentPage - 1 + totalPages) % totalPages;
    }

    function goToPage(index) {
      currentPage = index;
    }
</script>

{#if ads.length > 0}
  <div 
    class="py-4 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-base-200 via-base-100 to-base-200"
    on:mouseenter={() => {isHovering = true; stopAutoplay();}}
    on:mouseleave={() => {isHovering = false; startAutoplay();}}
  >
    <div class="max-w-6xl mx-auto mt-4">
      <div class="overflow-x-auto">
        <div class="flex gap-5 md:gap-6 snap-x snap-mandatory overflow-x-auto pb-2 justify-center">
          {#each visibleAds as ad (ad.id)}
            <a href={ad.link} class="ad-card-ui block snap-center" target="_blank" rel="noopener noreferrer">
              <div class="relative w-[220px] md:w-[300px] aspect-[16/9] rounded-xl overflow-hidden shadow-md bg-gray-100 border border-gray-200 transition-shadow duration-200 cursor-pointer">
                <img 
                  src={ad.image} 
                  alt={ad.title} 
                  class="w-full h-full object-cover" 
                  loading="lazy"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                <div class="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-1">
                  <span class="badge badge-sm badge-primary">Ad</span>
                  <h3 class="text-base md:text-lg font-bold text-white drop-shadow line-clamp-2">
                    {ad.title}
                  </h3>
                </div>
              </div>
            </a>
          {/each}
        </div>
      </div>

      {#if totalPages > 1}
        <div class="flex justify-center items-center mt-4 gap-4">
          <div class="flex items-center gap-2">
            {#each Array(totalPages) as _, i}
              <button 
                class="w-2 h-2 rounded-full transition-all duration-300 {i === currentPage ? 'w-6 bg-primary' : 'bg-gray-300 hover:bg-gray-400'}"
                on:click={() => goToPage(i)}
              />
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .ad-card-ui {
    min-width: 180px;
    max-width: 300px;
    aspect-ratio: 16/9;
    border-radius: 0.75rem;
    box-shadow: 0 2px 8px 0 rgba(0,0,0,0.08);
    background: #f3f4f6;
    position: relative;
    border: none;
    transition: box-shadow 0.2s;
  }
  .ad-card-ui img {
    border-radius: 0.75rem;
  }
  .ad-card-ui h3 {
    text-shadow: 0 1px 4px rgba(0,0,0,0.18);
    font-size: 1.1rem;
  }
  .ad-card-ui .bg-primary {
    background: linear-gradient(90deg, #6366f1 0%, #4338ca 100%);
  }
  .ad-card-ui .bg-primary-100 {
    color: #6366f1;
  }
  .ad-card-ui:active, .ad-card-ui:focus {
    box-shadow: 0 4px 16px 0 rgba(99,102,241,0.10);
  }
  @media (max-width: 768px) {
    .ad-card-ui {
      min-width: 140px;
      max-width: 220px;
    }
    .ad-card-ui h3 {
      font-size: 1rem;
    }
  }
</style>