<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { fade, slide } from 'svelte/transition';
  import { addToCart, cart } from '../../../lib/stores/cart.js';
  import  Icon  from '@iconify/svelte';
  import { myFetch } from '$lib/utils/myFetch.js';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { addAlert } from '$lib/stores/alert.js';
  import Slider from '$lib/components/Slider.svelte';
  import { user } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';


  export let data;

  let product_listing;
  let category;

  $: if (data) {
        ({ product_listing, category } = data);
  }
  
  
  let activeTab = 'DETAIL';
  
  // console.log(product_listing.return_exchange_policy.conditions);
  
  // Selected image state (default to main image)
  $: selectedImage = product_listing?.main_image;


  
  let placeholderImages = [];
  
  // Use provided images if available, otherwise use placeholders
  let images = placeholderImages;
  
  function updateQuantity(change) {
    if (change===1 && quantity >= product_listing.buy_limit) {
      addAlert("Can't add more than 10", "error");
      return;
    }
    quantity = Math.max(1, quantity + change);
  }
  
  function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  }

  function calculateDiscount(mrp, price) {
    if (!mrp || !price || mrp <= price) return null;
    return Math.round(((mrp - price) / mrp) * 100);
  }
  
  // function handleAddToCart() {
  //   for (let i = 0; i < quantity; i++) {
  //     addToCart(product_listing);
  //   }
  // }

  $: cartItem = $cart.find(item => item.id === product_listing.id);
  $: quantity = cartItem ? cartItem.quantity : 0;
  $: showQtyControls = quantity>0?true:false;



  function handleAddToCart() {
    addToCart(product_listing);
    quantity = 1;
  }

  function handleIncrement() {
    if (quantity < 10) {
      cart.update(items => items.map(item => item.id === product_listing.id ? { ...item, quantity: item.quantity + 1 } : item));
    }
  }
  
  function handleDecrement() {

    if (quantity > 1) {
      cart.update(items => items.map(item => item.id === product_listing.id ? { ...item, quantity: item.quantity - 1 } : item));
    }

  }
  
  function handleRemove() {
    cart.update(items => items.filter(item => item.id !== product_listing.id));
  }


  async function getProductListingImages(){
    let url = `${PUBLIC_API_URL}/product/product-listing-images/?product_listing_id=${product_listing.id}`
    let data = await myFetch(url);
    // console.log(data);

    placeholderImages = data.results.map(i => i.image); // Assign new array
    images = placeholderImages; // Trigger reactivity
  }
  
  let mainImage;
  let currentImageIndex = 0;

  // Add main image to gallery if not already included
  $: allImages = [
    product_listing.main_image,
    ...placeholderImages
  ];

  // console.log(allImages);
  $: {
    if (selectedImage) {
      currentImageIndex = allImages.indexOf(selectedImage);
    }
  }

  

  function handleImageHover(image) {
    selectedImage = image;
  }


  function nextImage() {
    if (currentImageIndex < allImages.length - 1) {
      selectedImage = allImages[currentImageIndex + 1];
    }
  }

  function prevImage() {
    if (currentImageIndex > 0) {
      selectedImage = allImages[currentImageIndex - 1];
    }
  }

  let RelatedProducts;
  let Reviews;
  let Variants;
  let AvailabilityCheck;
  let ProductOffers;
  // let Qna;


  onMount( () => {
    
    getProductListingImages();

    RelatedProducts = import('$lib/components/product/RelatedProducts.svelte');
    Reviews = import('$lib/components/product/Reviews.svelte');
    Variants = import('$lib/components/product/Variants.svelte');
    AvailabilityCheck = import('$lib/components/product/AvailabilityCheck.svelte');
    ProductOffers = import('$lib/components/product/ProductOffers.svelte');



    // Qna = import('$lib/components/product/Qna.svelte');


  });

 

  let showModal = false;
  let returnExchangeConditions = '';

  function openModal(conditions) {
    returnExchangeConditions = conditions;
    showModal = true; // Open the modal
    // console.log("Modal opened with conditions:", conditions); // Debugging line
  }

  function closeModal() {
    showModal = false; // Close the modal
    // console.log("Modal closed"); // Debugging line
  }



  let isExpanded = false;



  
</script>

<svelte:head>
  <title>Buy {product_listing.name} Online in Naigaon | Best Price & Fast Delivery</title>
  <meta name="description" content="Shop {product_listing.name} at the best price in Naigaon, and more. Fast delivery, secure payments & top-quality products!">
  <meta name="keywords" content="{product_listing.name}, buy {product_listing.name} online, {category?.name} in Naigaon, {product_listing?.brand?.name} {product_listing.name}, best {product_listing.name} price, fast delivery in Naigaon">
  <meta property="og:title" content="Buy {product_listing.name} Online in Naigaon | Best Price & Fast Delivery">
  <meta property="og:description" content="Get {product_listing.name} at the best price in Naigaon and more. Order now for quick delivery!">
  <meta property="og:type" content="website" />
</svelte:head>

<div class="bg-white">
  <!-- Breadcrumbs -->
  <div class="container mx-auto px-4 md:px-6 lg:px-8 pt-3">
    <div class="flex items-center gap-2 text-sm text-gray-600 mb-3">
      <a href="/" class="hover:text-indigo-600 transition-colors">Home</a>
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
      </svg>
      <a href="/shop" class="hover:text-indigo-600 transition-colors">Shop</a>
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
      </svg>
      <a href="/shop/{category?.slug}" class="hover:text-indigo-600 transition-colors">{category?.name}</a>
    </div>
  </div>

  <!-- Product Section -->
  <div class="container mx-auto px-4 md:px-6 lg:px-8 py-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      <!-- Product Images - Modern Gallery -->
      <div class="lg:sticky lg:top-4 h-fit">
        <!-- Main Image -->
        <div class="relative border border-gray-200 rounded-lg overflow-hidden mb-3 group bg-gray-50">
          {#if calculateDiscount(product_listing.mrp, product_listing.price)}
            <div class="absolute top-3 left-3 z-10">
              <div class="bg-red-500 text-white px-3 py-1 rounded-md text-sm font-bold shadow-md">
                {calculateDiscount(product_listing.mrp, product_listing.price)}% OFF
              </div>
            </div>
          {/if}
          
          <div class="p-4">
            <img 
              src={selectedImage || "/placeholder.svg"} 
              alt={product_listing.name}
              class="w-full h-[350px] md:h-[450px] object-contain"
            />
          </div>
        </div>

        <!-- Thumbnail Gallery -->
        <div class="flex gap-2 overflow-x-auto pb-2">
          {#each allImages as image, i}
            <button
              class="relative flex-shrink-0 w-16 h-16 border-2 rounded-md overflow-hidden transition-all {selectedImage === image ? 'border-indigo-600' : 'border-gray-300'}"
              on:click={() => handleImageHover(image)}
            >
              <img 
                src={image || "/placeholder.svg"} 
                alt="Thumbnail"
                class="w-full h-full object-contain p-1 bg-gray-50"
                loading="lazy"
              />
            </button>
          {/each}
        </div>
      </div>

      <!-- Product Info Section -->
      <div class="space-y-3">
        <!-- Brand and Category -->
        <div class="flex items-center gap-2 text-xs text-gray-500">
          {#if product_listing.brand}
            <a href="/brand/{product_listing.brand.name.toLowerCase()}" class="hover:text-indigo-600 transition-colors font-medium">
              {product_listing.brand.name}
            </a>
            <span>•</span>
          {/if}
          <span>{category?.name}</span>
        </div>

        <!-- Product Title with Verified & Rating -->
        <div class="space-y-2">
          <div class="flex items-start justify-between gap-4">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900 leading-tight flex-1">
              {product_listing.name}
            </h1>
            <div class="flex items-center gap-2 flex-shrink-0">
              <div class="flex items-center gap-1 px-2 py-1 bg-indigo-50 rounded-md">
                <svg class="w-3 h-3 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-xs font-semibold text-indigo-600">Verified</span>
              </div>
            </div>
          </div>
          
          <!-- Rating inline -->
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-0.5">
              {#each Array(5) as _, i}
                <svg class="w-4 h-4 {i < Math.floor(product_listing.rating || 0) ? 'text-yellow-400' : 'text-gray-300'} fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              {/each}
            </div>
            <span class="text-sm font-bold text-gray-900">{product_listing.rating || '4.8'}</span>
            <span class="text-xs text-gray-500">• {product_listing.review_count}+ reviews</span>
          </div>
        </div>

        <!-- Price Section - Horizontal Layout -->
        <div class="flex items-center gap-4 py-3 border-y border-gray-200">
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-black text-gray-900">
              {formatPrice(product_listing.price)}
            </span>
            {#if product_listing.mrp > product_listing.price}
              <span class="text-base text-gray-400 line-through">
                {formatPrice(product_listing.mrp)}
              </span>
            {/if}
          </div>
          {#if calculateDiscount(product_listing.mrp, product_listing.price)}
            <div class="flex items-center gap-2">
              <span class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                {calculateDiscount(product_listing.mrp, product_listing.price)}% OFF
              </span>
              <span class="text-sm text-gray-600">Save <span class="font-bold text-green-600">₹{product_listing.mrp - product_listing.price}</span></span>
            </div>
          {/if}
          <span class="text-xs text-gray-400 ml-auto">incl. taxes</span>
        </div>


      <!-- Variants and Offers -->
  <div class="space-y-4">
    {#if Variants}
      {#await Variants then { default: Variants }}
        <Variants product_listing={product_listing} />
      {/await}
    {/if}

    {#if ProductOffers}
      {#await ProductOffers then { default: ProductOffers }}
        <ProductOffers product_listing={product_listing} />
      {/await}
    {/if}
  </div>


        <!-- Trust Badges - Inline -->
        <div class="flex items-center gap-3 py-2">
          <div class="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            <span class="text-xs font-semibold text-green-700">100% Safe</span>
          </div>
          <div class="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <span class="text-xs font-semibold text-blue-700">Free Delivery</span>
          </div>
          <div class="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-200">
            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-xs font-semibold text-purple-700">Cash on Delivery</span>
          </div>
          <div class="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200">
            <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span class="text-xs font-semibold text-orange-700">Easy Returns</span>
          </div>
        </div>

      

        <!-- Add to Cart Section -->
        {#if product_listing.stock && product_listing.stock > 0}
          <div class="space-y-3">
            <!-- Stock indicator inline with button -->
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1.5 text-sm">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span class="font-semibold text-green-700">In Stock</span>
              </div>
            </div>

            {#if showQtyControls}
              <div class="flex items-center gap-3">
                <div class="inline-flex items-center bg-white border-2 border-gray-300 rounded-lg p-1 shadow-sm">
                  <button
                    class="w-12 h-12 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    on:click={quantity > 1 ? handleDecrement : handleRemove}
                    aria-label={quantity === 1 ? 'Remove' : 'Decrease'}
                  >
                    {#if quantity === 1}
                      <Icon icon="mdi:delete-outline" class="text-red-500 h-6 w-6" />
                    {:else}
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                      </svg>
                    {/if}
                  </button>
                  <span class="font-bold text-gray-900 min-w-[3rem] text-center text-xl">{quantity}</span>
                  <button
                    class="w-12 h-12 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    on:click={handleIncrement}
                    disabled={quantity >= 10}
                    aria-label="Increase"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                  </button>
                </div>
                <span class="text-sm text-gray-600">Qty</span>
              </div>
            {:else}
              <button
                class="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
                on:click={handleAddToCart}
              >
                <span class="flex items-center justify-center gap-2">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  Add to Cart
                </span>
              </button>
            {/if}

          </div>
        {:else}
          <div class="px-6 py-4 bg-red-50 border border-red-200 rounded-xl">
            <span class="text-red-600 font-semibold text-lg">Out of Stock</span>
          </div>
        {/if}




        <!-- Delivery Check & Share - Horizontal -->
        <div class="flex items-center justify-between gap-4 pt-3 border-t border-gray-200">
          <!-- Delivery Check -->
          {#if AvailabilityCheck}
            {#await AvailabilityCheck then { default: AvailabilityCheck }}
              <div class="flex-1">
                <AvailabilityCheck product_listing={product_listing} />
              </div>
            {/await}
          {/if}
          
          <!-- Share -->
          <div class="flex items-center gap-3">
            <span class="text-xs font-semibold text-gray-600">Share:</span>
            <div class="flex gap-2">
              <a 
                href={"https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent($page.url.href)}
                target="_blank" rel="noopener noreferrer"
                class="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-all"
                aria-label="Share on Facebook"
              >
                <Icon icon="ic:outline-facebook" class="w-4 h-4" />
              </a>
              <a 
                href={"https://x.com/intent/tweet?url=" + encodeURIComponent($page.url.href) + "&text=" + encodeURIComponent(product_listing.name)}
                target="_blank" rel="noopener noreferrer"
                class="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-black hover:border-black hover:text-white transition-all"
                aria-label="Share on Twitter"
              >
                <Icon icon="pajamas:twitter" class="w-4 h-4" />
              </a>
              <a 
                href={"https://wa.me/?text=" + encodeURIComponent(product_listing.name + " " + $page.url.href)}
                target="_blank" rel="noopener noreferrer"
                class="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-500 hover:text-green-600 transition-all"
                aria-label="Share on WhatsApp"
              >
                <Icon icon="ic:outline-whatsapp" class="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Tabs Section -->
    <div class="container mx-auto px-4 md:px-6 lg:px-8 mt-6 mb-8">
    <!-- Tab Headers -->
    <div class="flex justify-center mb-4">
      <div class="tabs tabs-boxed bg-inherit gap-2 flex-nowrap overflow-x-auto">
        <button 
          class="tab tab-lg inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 hover:bg-primary/10 {activeTab === 'DETAIL' ? 'tab-active bg-primary text-white' : ''}"
          on:click={() => activeTab = 'DETAIL'}
        >
          DETAIL
        </button>
        <button 
          class="tab tab-lg inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 hover:bg-primary/10 {activeTab === 'INFO' ? 'tab-active bg-primary text-white' : ''}"
          on:click={() => activeTab = 'INFO'}
        >
          INFO
        </button>
        <!-- <button 
          class="tab tab-lg inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 hover:bg-primary/10 {activeTab === 'QNA' ? 'tab-active bg-primary text-white' : ''}"
          on:click={() => activeTab = 'QNA'}
        >
          <span>Q&A</span>
          
        </button> -->
        <button 
          class="tab tab-lg inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 hover:bg-primary/10 {activeTab === 'REVIEWS' ? 'tab-active bg-primary text-white' : ''}"
          on:click={() => activeTab = 'REVIEWS'}
        >
          <span>REVIEWS</span>
          {#if product_listing.review_count > 0}
            <span class="ml-1">({product_listing.review_count})</span>
          {/if}
        </button>
      </div>
    </div>
  
    <!-- Tab Content -->
    <div class="" in:fade={{ duration: 300 }}>
      {#if activeTab === 'DETAIL'}
        <div class="max-w-3xl mx-auto" in:fade={{ duration: 300 }}>
          <div class="text-gray-600 prose-sm description-container">
            <div class="description-text" class:expanded={isExpanded}>
              {@html product_listing.product.description}
            </div>
            <!-- Show More button only on mobile when text is truncated -->
            <button 
              class="show-more-btn md:hidden"
              on:click={() => isExpanded = !isExpanded}
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
          </div>
        </div>
      {:else if activeTab === 'INFO'}

      
        <div class="max-w-3xl mx-auto" in:fade={{ duration: 300 }}>
          <div class="overflow-x-auto">
            <table class="table border-4 w-full">
              <tbody>
                <!-- {#if product_listing.weight}
                  <tr class="border-t">
                    <td class="font-medium text-gray-600 w-1/3 border-l">WEIGHT</td>
                    <td class=" italic text-gray-500 border-l border-r">{product_listing.weight}</td>
                  </tr>
                {/if} -->
                
                <!-- {#if product_listing.dimensions}
                  <tr>
                    <td class="font-medium text-gray-600 w-1/3 border-l">DIMENSIONS</td>
                    <td class="italic text-gray-500 border-l border-r">{product_listing.dimensions}</td>
                  </tr>
                {/if} -->
                
                <!-- {#if product_listing.color}
                  <tr>
                    <td class="font-medium text-gray-600 w-1/3 border-l">COLOR</td>
                    <td class="italic text-gray-500 border-l border-r">{product_listing.color}</td>
                  </tr>
                {/if} -->
                
         
                
                {#if product_listing.brand}
                  <tr>
                    <td class="font-medium text-gray-600 w-1/3 border-l">BRAND</td>
                    <td class="italic text-gray-500 border-l border-r">{product_listing.brand.name}</td>
                  </tr>
                {/if}

                <tr>

                  <td class="font-medium text-gray-600 w-1/3 border-l">SKU</td>
                  <td class="italic text-gray-500 border-l border-r">NM_{product_listing.id}</td>

                </tr>

                <tr>

                  <td class="font-medium text-gray-600 w-1/3 border-l">CATEGORY</td>
                  <td class="italic text-gray-500 border-l border-r">{category?.name}</td>
                  
                </tr>

    
                <!-- Dynamically render any additional properties -->
                <!-- {#each Object.entries(product_listing.additionalInfo || {}) as [key, value]}
                  <tr class="border-b">
                    <td class="font-medium text-gray-600 w-1/3 border-l">{key}</td>
                    <td class="italic text-gray-500 border-l border-r">{value}</td>
                  </tr>
                {/each} -->
              </tbody>
            </table>
          </div>
        </div>

      <!-- {:else if activeTab === 'QNA'}
        
        {#if Qna}
              {#await Qna then { default: Qna }}
                <Qna product_listing={product_listing} />
              {/await}
            {/if} -->
      {:else}
        <div in:fade>
          <div class="overflow-x-auto max-w-3xl mx-auto">
            

            {#if Reviews}
              {#await Reviews then { default: Reviews }}
                <Reviews product_listing={product_listing} />
              {/await}
            {/if}


          </div>
        </div>
      {/if}
    </div>
    </div>

    <!-- Related Products Section -->
    <div class="container mx-auto px-4 md:px-6 lg:px-8">
      {#if RelatedProducts}
        {#await RelatedProducts then { default: RelatedProducts }}
          <RelatedProducts product_listing={product_listing} />
        {/await}
      {/if}
    </div>
  </div>
</div>



<!-- Modal for Return and Exchange Conditions -->
{#if showModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h2 class="font-bold text-lg">Return & Exchange Conditions</h2>
      <div class="py-4">{@html returnExchangeConditions}</div>
      <div class="modal-action">
        <button class="btn" on:click={closeModal}>Close</button>
      </div>
    </div>
  </div>
{/if}



<style>
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  img {
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
  }

  /* Smooth transitions */
  .transition-transform {
    transition: transform 0.1s ease-out;
  }

  /* Prevent text selection during zoom */
  .overflow-hidden {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }


  /* Prevent image dragging */
  img {
    -webkit-user-drag: none;
    user-select: none;
  }


  /* Smooth transitions */
  .transition-all {
    transition: all 0.3s ease;
  }

  /* Better focus states */
  button:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  /* Mobile Specific Styles */
  @media (max-width: 768px) {


    /* Scrollable guarantee icons */
    .mobile-scroll-container {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding: 1rem 0;
    }

    .mobile-scroll-container::-webkit-scrollbar {
      display: none;
    }


    /* Compact price display */
    .mobile-price-stack {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }

  /* Add styles for the pincode check section */


  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .modal-content {
    background-color: white;
    z-index: 1001; /* Add this */
    position: relative; /* Add this */
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
  }
  .close {
    cursor: pointer;
    float: right;
    font-size: 20px;
  }

  /* Custom styles for Q&A section */
  .qna-container {
    max-width: 800px;
    margin: 0 auto;
  }

  .question-card {
    transition: all 0.3s ease;
  }

  .question-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .qna-container {
      padding: 0 1rem;
    }

    .textarea {
      font-size: 0.9rem;
    }

    .btn {
      padding: 0.5rem 1rem;
    }

    .avatar {
      width: 2rem;
      height: 2rem;
    }
  }

  /* Mobile tab improvements */
  @media (max-width: 768px) {
    .tabs {
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding: 0.5rem;
      display: flex;
      align-items: center;
    }
    
    .tabs::-webkit-scrollbar {
      display: none;
    }
    
    .tab {
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
      height: auto;
      min-height: 2.5rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  }

  /* Description text container styles */
  @media (max-width: 768px) {
    .description-container {
      position: relative;
    }

    .description-text {
      max-height: 300px; /* Adjust this value as needed */
      overflow: hidden;
      position: relative;
      transition: max-height 0.3s ease-out;
    }

    .description-text::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100px;
      background: linear-gradient(to bottom, transparent, white);
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .description-text.expanded {
      max-height: none;
    }

    .description-text.expanded::after {
      opacity: 0;
    }

    .show-more-btn {
      width: 100%;
      padding: 0.5rem;
      text-align: center;
      color: var(--primary-color);
      font-weight: 500;
      background: white;
      border: none;
      cursor: pointer;
      transition: color 0.2s ease;
      margin-top: 0.5rem;
    }

    .show-more-btn:hover {
      color: var(--primary-color-dark);
    }
  }

  /* Add these styles for better mobile responsiveness */
  @media (max-width: 768px) {
    .input-sm {
      font-size: 0.875rem;
    }
    
    .btn-sm {
      font-size: 0.875rem;
    }
  }
</style>
