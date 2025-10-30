<script>

  export let data; 
  let recentReviews = data.recentReviews;
  let bestProducts = data.bestProducts;
  let brands = data.brands; 
  let newProducts = data.newProducts;
  let mainCategories = data.mainCategories;
  let heroProducts = data.heroProducts;
  let homePage = data.homePage;
  console.log(homePage);
  // console.log(recentReviews)
  // console.log(data)
  import Hero from '$lib/components/home/Hero.svelte';
  import HomeCategories from '$lib/components/home/HomeCategories.svelte';

  import BestDeals from '$lib/components/home/BestDeals.svelte';
  import CompanySection from '$lib/components/CompanySection.svelte';
  import BestSelling from '$lib/components/home/BestSelling.svelte';
  import Testimonials from '$lib/components/home/Testimonials.svelte';
  import ShopByBrands from '$lib/components/home/ShopByBrands.svelte';
  import { onMount } from 'svelte';
  import { createScrollObserver } from '$lib/utils/scrollAnimation.js';
  // import Ads from '$lib/components/Ads.svelte';

  onMount(() => {
    createScrollObserver();
  });

</script>


<svelte:head>
  <title>{homePage?.meta_title || 'Khillona Buddy – The Ultimate Kids Toy Store | Fun & Learning Combined! 🎉'}</title>
  <meta name="description" content={homePage?.meta_description || 'Discover amazing toys at Khillona Buddy! From educational games to fun playsets, we have everything to make kids smile. Safe, high-quality toys with fast delivery!'} />
  <meta name="keywords" content="kids toys, educational toys, toy store online, children games, baby toys, toddler toys, learning toys, fun toys, safe toys, toy delivery, kids gifts, toy shop" />
  <meta property="og:title" content={homePage?.meta_title || 'Khillona Buddy – The Ultimate Kids Toy Store'} />
  <meta property="og:description" content={homePage?.meta_description || 'Discover amazing toys that combine fun and learning! Safe, high-quality toys for kids of all ages with fast delivery.'} />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="/toy-store-preview.jpg" />
</svelte:head>


<div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 relative">
  <!-- Dynamic background elements -->
  <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <!-- Vibrant floating shapes -->
    <div class="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-300/20 to-indigo-400/20 rounded-full animate-bounce" style="animation-delay: 0.5s; animation-duration: 4s;"></div>
    <div class="absolute top-1/4 right-16 w-20 h-20 bg-gradient-to-br from-pink-400/25 to-red-400/25 rotate-45 animate-pulse" style="animation-delay: 1.2s; animation-duration: 3s;"></div>
    <div class="absolute bottom-1/3 left-1/5 w-24 h-24 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-full animate-ping" style="animation-delay: 2s; animation-duration: 2s;"></div>
    <div class="absolute bottom-20 right-1/4 w-16 h-16 bg-gradient-to-br from-cyan-400/25 to-blue-400/25 rotate-12 animate-spin" style="animation-delay: 0.8s; animation-duration: 8s;"></div>
    <div class="absolute top-1/2 left-1/2 w-12 h-12 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full animate-bounce" style="animation-delay: 3s; animation-duration: 5s;"></div>
  </div>
  
  <!-- Main content with subtle backdrop -->
  <div class="relative z-10">
    <Hero slides={heroProducts} />
    
    <!-- Fun animated divider -->
    <div class="relative py-12 animate-on-scroll">
      <div class="flex justify-center items-center">
        <div class="h-1 w-24 bg-gradient-to-r from-transparent via-purple-400 to-pink-400 rounded-full animate-pulse"></div>
        <div class="mx-8 flex items-center gap-3">
          <div class="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-xl animate-bounce">
            <span class="text-2xl">✨</span>
          </div>
          <div class="text-center">
            <h3 class="font-bold text-gray-900 text-xl">Explore Categories</h3>
            <p class="text-purple-600 text-sm font-medium">Find Your Perfect Toy</p>
          </div>
          <div class="p-4 bg-gradient-to-br from-pink-500 to-red-500 rounded-full shadow-xl animate-bounce" style="animation-delay: 0.5s;">
            <span class="text-2xl">🎉</span>
          </div>
        </div>
        <div class="h-1 w-24 bg-gradient-to-r from-pink-400 via-purple-400 to-transparent rounded-full animate-pulse"></div>
      </div>
    </div>
    
    <div class="slide-left">
      <HomeCategories categories={mainCategories} />
    </div>
    
    <!-- Exciting deals divider -->
    <div class="relative py-10 animate-on-scroll">
      <div class="flex justify-center items-center">
        <div class="h-2 w-20 bg-gradient-to-r from-transparent via-orange-400 to-red-400 rounded-full animate-pulse"></div>
        <div class="mx-8 text-center bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-6 shadow-xl">
          <div class="flex items-center justify-center gap-3 mb-2">
            <span class="text-3xl animate-bounce">🔥</span>
            <h3 class="text-2xl font-black text-gray-900">HOT DEALS</h3>
            <span class="text-3xl animate-bounce" style="animation-delay: 0.5s;">💰</span>
          </div>
          <p class="text-red-600 font-bold text-sm">Limited Time Offers!</p>
        </div>
        <div class="h-2 w-20 bg-gradient-to-r from-red-400 via-orange-400 to-transparent rounded-full animate-pulse"></div>
      </div>
    </div>
    
    <div class="slide-right">
      <BestDeals products={newProducts} />
    </div>
    
    <!-- Brand divider -->
    <div class="relative py-10 animate-on-scroll">
      <div class="flex justify-center items-center">
        <div class="h-px w-20 bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
        <div class="mx-6 text-center">
          <p class="text-sm text-amber-600 font-medium mb-1">Trusted Worldwide</p>
          <h3 class="text-xl font-bold text-gray-800">Premium Brands</h3>
          <div class="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full mx-auto mt-2"></div>
        </div>
        <div class="h-px w-20 bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
      </div>
    </div>
    
    <div class="scale-in">
      <ShopByBrands brands={brands} />
    </div>
    
    <!-- Bestseller divider -->
    <div class="relative py-10 animate-on-scroll">
      <div class="flex justify-center items-center">
        <div class="h-px w-24 bg-gradient-to-r from-transparent via-emerald-300 to-transparent"></div>
        <div class="mx-8 text-center">
          <p class="text-sm text-emerald-600 font-medium mb-1">Customer Favorites</p>
          <h3 class="text-xl font-bold text-gray-800">Best Sellers</h3>
          <div class="w-16 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mx-auto mt-2"></div>
        </div>
        <div class="h-px w-24 bg-gradient-to-r from-transparent via-emerald-300 to-transparent"></div>
      </div>
    </div>
    
    <div class="slide-left">
      <BestSelling products={bestProducts} />
    </div>
    
    <!-- Testimonials divider -->
    <div class="relative py-12 animate-on-scroll">
      <div class="flex justify-center items-center">
        <div class="h-px w-28 bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
        <div class="mx-8 text-center">
          <p class="text-sm text-purple-600 font-medium mb-1">What Parents Say</p>
          <h3 class="text-xl font-bold text-gray-800">Happy Families</h3>
          <div class="w-20 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mt-2"></div>
        </div>
        <div class="h-px w-28 bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
      </div>
    </div>
    
    <div class="slide-right">
      <Testimonials recentReviews={recentReviews} />
    </div>
    
    <!-- Elegant call-to-action section -->
    <div class="relative py-20 text-center animate-on-scroll">
      <div class="max-w-3xl mx-auto px-6">
        <h3 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Ready to Create Magical Moments?
        </h3>
        <p class="text-xl text-gray-600 mb-8 leading-relaxed">
          Join thousands of happy families who trust us to bring joy, learning, and endless fun to their children.
        </p>
        <div class="flex justify-center space-x-8 mb-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-700">Safety First</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-700">Fast Delivery</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-700">Quality Assured</p>
          </div>
        </div>
        <a href="/shop" class="inline-flex items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform transition-all hover:scale-105">
          Start Shopping
          <svg class="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
          </svg>
        </a>
      </div>
    </div>
  </div>
</div>
