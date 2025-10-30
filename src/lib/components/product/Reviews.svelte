<script>
    
    import { myFetch } from "$lib/utils/myFetch";
    import { PUBLIC_API_URL } from "$env/static/public";
    import { createEventDispatcher } from 'svelte';
    import Icon from '@iconify/svelte';
    const dispatch = createEventDispatcher();
    
    export let product_listing;
    // console.log(product_listing)
    import { onMount } from "svelte";
    import SkeltonReviews from "../skeltons/SkeltonReviews.svelte";

    let reviews = [];
    let loading = false;
    let next;
    let reviewsLoaded = false; // New flag to track if reviews have been loaded

    async function fetchReviews() {
        if (reviewsLoaded) return; // Skip if already loaded
        loading = true;
        try {
            let url = `${PUBLIC_API_URL}/review/reviews/?product_listing_id=${product_listing.id}&ordering=-id`;
            let data = await myFetch(url);
            console.log(data);
            reviews = data.results;
            next = data.next;
            // console.log(recentReviews);
            reviewsLoaded = true; // Mark as loaded
        } catch (e) {
            console.error("Error fetching reviews:", e);
        } finally {
            loading = false;
        }
    }

    // Only fetch on mount, not on every product_listing change
    onMount(() => {
        fetchReviews();
    });

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    async function loadMore() {
        loading = true;
        // console.log("Hello Bhai")
        const dataNew = await myFetch(next);
        console.log(dataNew);
        reviews = [...reviews, ...dataNew.results];
        next = dataNew.next;
        loading = false
    }
    function getFullName(user) {
        if (user.first_name || user.last_name) {
            return `${user.first_name} ${user.last_name}`.trim();
        }
        return user.username;
    }

</script>

<div class="space-y-4">
    
    {#each reviews as review (review.id)}
        <div class="border rounded-lg p-3 md:p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <div class="flex items-start space-x-4">
                <div class="flex-1">
                    <!-- Review Header -->
                    <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                        <div>
                            <div class="flex flex-wrap items-center gap-2">
                                <h3 class="font-medium text-base md:text-lg">{review.title}</h3>
                                {#if review.order_item_id}
                                    <span class="inline-flex items-center text-green-600 text-xs md:text-sm">
                                        <Icon icon="mdi:check-circle" class="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                        Verified Purchase
                                    </span>
                                {/if}
                            </div>
                            
                            <!-- Rating Stars -->
                            <div class="flex items-center mt-1">
                                {#each Array(5) as _, i}
                                    <svg 
                                        class="w-3 h-3 md:w-4 md:h-4 {i < review.rating ? 'text-yellow-400' : 'text-gray-300'}" 
                                        fill="currentColor" 
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                    </svg>
                                {/each}
                                <span class="ml-2 text-xs md:text-sm text-gray-600">
                                    {review.rating} out of 5
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Review Content -->
                    <p class="text-gray-700 mt-2 md:mt-3 text-sm md:text-base">{review.comment}</p>
                    
                    <!-- Review Footer -->
                    <div class="flex flex-col md:flex-row items-start md:items-center justify-between mt-3 md:mt-4 text-xs md:text-sm text-gray-500 gap-2 md:gap-0">
                        <div class="flex items-center flex-wrap gap-2">
                            <Icon icon="mdi:account" class="w-3 h-3 md:w-4 md:h-4" />
                            <span class="font-medium">{getFullName(review.user)}</span>
                            <span class="text-gray-400">•</span>
                            <Icon icon="mdi:calendar" class="w-3 h-3 md:w-4 md:h-4" />
                            <span>Posted on {formatDate(review.created)}</span>
                        </div>

                        {#if review.order_item_id}
                            <div class="flex items-center gap-1 text-green-600">
                                <Icon icon="mdi:shopping-outline" class="w-3 h-3 md:w-4 md:h-4" />
                                <span class="text-[10px] md:text-xs">Purchased Item</span>
                            </div>
                        {:else}
                            <div class="flex items-center gap-1 text-blue-600">
                                <Icon icon="mdi:comment-outline" class="w-3 h-3 md:w-4 md:h-4" />
                                <span class="text-[10px] md:text-xs">Product Review</span>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    {/each}

    {#if loading}
        <SkeltonReviews />
    {/if}

    {#if (next && !loading)}
        <button class="btn btn-sm w-full md:w-auto my-3 md:my-4" on:click={() => loadMore()}>
            Load More
        </button>
    {/if}

    {#if (reviews.length === 0 && !loading)}
        <div class="text-center py-8 md:py-12">
            <div class="mb-4">
                <svg class="mx-auto h-8 w-8 md:h-12 md:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
            </div>
            <h3 class="text-base md:text-lg font-medium text-gray-900">No reviews yet</h3>
            <p class="mt-1 text-xs md:text-sm text-gray-500">Share your experience by reviewing products you've purchased</p>
        </div>
    {/if}
</div>

<style>
    /* Mobile-friendly scrolling for long content */
    @media (max-width: 768px) {
        .mobile-scroll-container {
            -webkit-overflow-scrolling: touch;
        }
    }

    /* Improved touch targets for mobile */
    @media (max-width: 768px) {
        button {
            min-height: 44px;
        }
    }

    /* Optional: Add hover effects only for non-touch devices */
    @media (hover: hover) {
        .review-card:hover {
            transform: translateY(-2px);
        }
    }
</style>