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
  import WhyUs from '$lib/components/home/WhyUs.svelte';
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


<div class="min-h-screen bg-gradient-to-br from-base-100 via-white to-base-200 relative">
  
  <!-- Main content with subtle backdrop -->
  <div class="relative z-10">
    <Hero slides={heroProducts} />
    
    
    <div class="slide-left">
      <HomeCategories categories={mainCategories} />
    </div>
    
    <BestDeals products={newProducts} />
    
    <ShopByBrands brands={brands} />
    
    <BestSelling products={bestProducts} />
    
    <WhyUs />

    <Testimonials recentReviews={recentReviews} />
    
    <!-- Elegant call-to-action section (brand-aligned) -->
    <div class="relative py-20 text-center animate-on-scroll bg-gradient-to-b from-base-100 via-white to-base-200">
      <div class="max-w-3xl mx-auto px-6">
        <h3 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Ready to Create Magical Moments?
        </h3>
        <p class="text-xl text-gray-600 mb-8 leading-relaxed">
          Join thousands of happy families who trust us to bring joy, learning, and endless fun to their children.
        </p>
        <div class="flex justify-center space-x-8 mb-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-700">Safety First</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-700">Fast Delivery</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-700">Quality Assured</p>
          </div>
        </div>
        <a href="/shop" class="inline-flex items-center px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform transition-all hover:scale-105">
          Start Shopping
          <svg class="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
          </svg>
        </a>
      </div>
    </div>
  </div>
</div>
