<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';
  import { addToCart } from '../../../lib/stores/cart.js';
  import Icon from '@iconify/svelte';
  import { myFetch } from '$lib/utils/myFetch.js';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { addAlert } from '$lib/stores/alert.js';
  import { user } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';
  import Service from '$lib/components/service/Service.svelte';

  let { data } = $props();
  const { service, category } = data;
  
  let activeTab = $state('OVERVIEW');
  let quantity = $state(1);
  let selectedImage = $state(service.main_image || service.thumbnail);
  
  // Service data processing
  let serviceIncludes = $state([]);
  let serviceDuration = $state('');
  
  // Parse features from description or objectbox_items
  function parseServiceData() {
    if (service.objectbox_items) {
      try {
        const items = service.objectbox_items.split(',').map(item => 
          item.replace(/"/g, '').replace(/\r\n/g, '').trim()
        ).filter(item => item.length > 0);
        serviceIncludes = items;
      } catch (e) {
        console.error('Error parsing objectbox_items:', e);
      }
    }
    
    if (service.description) {
      const listMatch = service.description.match(/<ul>(.*?)<\/ul>/s);
      if (listMatch) {
        const items = listMatch[1].match(/<li>(.*?)<\/li>/g);
        if (items) {
          const features = items.map(item => item.replace(/<\/?li>/g, '').replace(/<br>/g, '').trim());
          if (serviceIncludes.length === 0) {
            serviceIncludes = features;
          }
        }
      }
      
      const durationMatch = service.description.match(/Duration:\s*([^<\n]+)/i);
      if (durationMatch) {
        serviceDuration = durationMatch[1].trim();
      }
    }
  }
  
  function updateQuantity(change) {
    if (change === 1 && quantity >= (service.buy_limit || 5)) {
      addAlert("Can't add more than the limit", "error");
      return;
    }
    quantity = Math.max(1, quantity + change);
  }
  
  function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price );
  }

  function calculateDiscount(mrp, price) {
    if (!mrp || !price || mrp <= price) return null;
    return Math.round(((mrp - price) / mrp) * 100);
  }
  
  let isInCart = $state(false);
  
  function handleBookService() {
    for (let i = 0; i < quantity; i++) {
      addToCart(service);
    }
    addAlert("Service added to cart successfully!", "success");
    isInCart = true;
  }

  let relatedServices = $state([]);
  let loadingRelatedServices = true;
  
  async function getRelatedServices() {
    try {
      let url = `${PUBLIC_API_URL}/product/product-listings/?is_service=true&approved=true&category_id=${service.category?.id}&page_size=8`;
      let data = await myFetch(url);
      relatedServices = data.results.filter(s => s.id !== service.id);
    } catch(e) {
      console.error('Error fetching related services:', e);
    } finally {
      loadingRelatedServices = false;
    }
  }

  let allImages = $state([service.main_image, service.thumbnail].filter(Boolean));
  let placeholderImages = $state([]);

  async function getServiceListingImages() {
    let url = `${PUBLIC_API_URL}/product/product-listing-images/?product_listing_id=${service.id}`;
    let data = await myFetch(url);
    placeholderImages = data.results.map(i => i.image);
    // Combine main image + listing images, remove duplicates
    allImages = [service.main_image, ...placeholderImages].filter(
      (img, idx, arr) => img && arr.indexOf(img) === idx
    );
    // Set selectedImage to first image if not already set
    if (!selectedImage && allImages.length > 0) {
      selectedImage = allImages[0];
    }
  }

  function handleImageClick(image) {
    selectedImage = image;
  }

  // Pincode availability
  let pincode = $state('');
  let pincodeResult = $state('');
  let pinData = $state(null);
  let checkingPincode = $state(false);

  async function checkPincodeAvailability() {
    if (!pincode || pincode.length !== 6) {
      pincodeResult = 'Please enter a valid 6-digit pincode.';
      return;
    }
    
    checkingPincode = true;
    try {
      const response = await fetch(`${PUBLIC_API_URL}/estore/delivery-pins/?page=1&page_size=100`);
      const data = await response.json();
      const foundPinData = data.results.find(pin => pin.pin_code === pincode);
      
      pinData = foundPinData;
      
      if (foundPinData) {
        pincodeResult = `Service available in ${foundPinData.city}, ${foundPinData.state}`;
      } else {
        pincodeResult = 'Service not available in this area';
      }
    } catch (e) {
      pincodeResult = 'Unable to check availability. Please try again.';
    } finally {
      checkingPincode = false;
    }
  }

  // Q&A functionality
  let questions = $state([]);
  let questionsLoading = $state(false);
  let questionsLoaded = false;
  let newQuestion = $state('');
  let currentUser = null;
  let userId = null;

  async function fetchQuestions() {
    if (questionsLoaded) return;
    questionsLoading = true;
    try {
      let url = `${PUBLIC_API_URL}/qna/questions/?product_listing_id=${service.id}&ordering=-id&answers_required=true`;
      let data = await myFetch(url, 'GET', {}, currentUser?.access_token);
      questions = data.results;
      questionsLoaded = true;
    } catch (e) {
      console.error("Error fetching questions:", e);
    } finally {
      questionsLoading = false;
    }
  }

  async function submitQuestion() {
    if (!userId) {
      goto('/login');
      return;
    }
    if (!newQuestion.trim()) return;

    try {
      const response = await myFetch(
        `${PUBLIC_API_URL}/qna/questions/`, 
        'POST',
        {
          question_text: newQuestion,
          user_id: userId,
          product_listing_id: service.id
        },
        currentUser?.access_token
      );
      
      if (response) {
        newQuestion = '';
        questionsLoaded = false;
        fetchQuestions();
        addAlert("Question submitted successfully!", "success");
      }
    } catch (e) {
      console.error("Error submitting question:", e);
      addAlert("Failed to submit question", "error");
    }
  }

  let showBadgeText = false;
  let showGuaranteeText = [false, false, false, false];
  let showProviderText = false;
  let showHighlightText = [false, false, false];

  onMount(async () => {
    parseServiceData();
    
    const unsubscribe = user.subscribe(value => {
      if (value) {
        currentUser = value;
        userId = value.user_id;
      } else {
        currentUser = null;
        userId = null;
      }
    });

    // Check if service is in cart (replace with your actual cart store logic if needed)
    if (typeof addToCart.subscribe === 'function') {
      const unsubscribeCart = addToCart.subscribe(cart => {
        isInCart = cart.some(item => item.id === service.id);
      });
      await getRelatedServices();
      await getServiceListingImages();
      return () => {
        unsubscribe();
        unsubscribeCart();
      };
    } else {
      await getRelatedServices();
      await getServiceListingImages();
      return () => {
        unsubscribe();
      };
    }
  });
</script>

<svelte:head>
  <title>{service.name} | Professional Service Booking</title>
  <meta name="description" content="Book {service.name} - {service.product?.description || 'Professional service with quality guarantee'}. Starting at {formatPrice(service.price)}.">
</svelte:head>

<div class="bg-gray-50 min-h-screen">
  <!-- Breadcrumb -->
  <div class="bg-white border-b">
    <div class="mx-auto px-4 sm:px-8 md:px-16 py-2">
      <nav class="flex items-center space-x-1 text-xs sm:text-sm text-gray-600 overflow-x-auto whitespace-nowrap">
        <a href="/" class="hover:text-blue-600">
          <Icon icon="mdi:home" class="w-4 h-4" />
        </a>
        <Icon icon="mdi:chevron-right" class="w-3 h-3" />
        <a href="/services" class="hover:text-blue-600">Services</a>
        <Icon icon="mdi:chevron-right" class="w-3 h-3" />
        <a href="/services/{category?.slug}" class="hover:text-blue-600">{category?.name}</a>
        <Icon icon="mdi:chevron-right" class="w-3 h-3" />
        <span class="text-gray-900">{service.name}</span>
      </nav>
    </div>
  </div>

  <div class="mx-auto px-2 sm:px-4 md:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left Column - Images -->
      <div class="space-y-3">
        <!-- Main Image -->
        <div class="relative bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="aspect-[4/3] relative">
            <img 
              src={selectedImage || "/placeholder.svg?height=400&width=500"} 
              alt={service.name}
              class="w-full h-full object-cover"
            />
            
            <!-- Badges -->
            <div class="absolute top-3 left-3 flex flex-col gap-1">
              <!-- Professional Service Badge -->
              <button
                class="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center md:inline"
                onclick={() => showBadgeText = !showBadgeText}
                onblur={() => showBadgeText = false}
                tabindex="0"
              >
                <Icon icon="mdi:star" class="w-3 h-3 inline" />
                <span class="hidden md:inline ml-1">Professional Service</span>
              </button>
              {#if showBadgeText}
                <div class="md:hidden absolute left-0 mt-8 bg-white shadow rounded p-2 text-xs z-10">
                  Professional Service
          </div>
              {/if}
              {#if calculateDiscount(service.mrp, service.price)}
                <button
                  class="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center md:inline mt-1"
                  onclick={() => showBadgeText = !showBadgeText}
                  onblur={() => showBadgeText = false}
                  tabindex="0"
                >
                  <span class="hidden md:inline">{calculateDiscount(service.mrp, service.price)}% OFF</span>
                  <Icon icon="mdi:tag" class="w-3 h-3 inline md:hidden" />
                </button>
                {#if showBadgeText}
                  <div class="md:hidden absolute left-0 mt-16 bg-white shadow rounded p-2 text-xs z-10">
                    {calculateDiscount(service.mrp, service.price)}% OFF
                  </div>
                {/if}
              {/if}
      </div>

            {#if service.popularity > 50}
              <span class="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                Popular
          </span>
        {/if}
      </div>
    </div>

        <!-- Thumbnails -->
        {#if allImages.length > 1}
          <div class="flex gap-2 mt-2 overflow-x-auto">
            {#each allImages as image, index}
              <button
                class="w-12 h-12 sm:w-16 sm:h-16 rounded border-2 overflow-hidden {selectedImage === image ? 'border-blue-500' : 'border-gray-200'}"
                onclick={() => selectedImage = image}
              >
                <img src={image || "/placeholder.svg"} alt={`View ${index + 1}`} class="w-full h-full object-cover" />
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Right Column - Service Details -->
    <div class="space-y-4">
        <!-- Service Header -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">{service.name}</h1>
          
          <div class="flex items-center gap-2 mb-3">
            {#if category}
              <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                <Icon icon="mdi:tag" class="w-3 h-3 inline mr-1" />
                {category.name}
              </span>
            {/if}
        {#if service.rating > 0}
              <div class="flex items-center gap-1">
                <div class="flex">
              {#each Array(5) as _, i}
                <Icon 
                      icon={i < Math.floor(service.rating) ? "mdi:star" : "mdi:star-outline"}
                      class="w-4 h-4 text-yellow-400"
                />
              {/each}
                </div>
                <span class="text-xs text-gray-600">
                  {service.rating} ({service.review_count})
              </span>
            </div>
            {/if}
          </div>

          <!-- Pricing -->
          <div class="flex items-baseline gap-2 mb-4">
            <span class="text-2xl font-bold text-blue-600">{formatPrice(service.price)}</span>
            {#if service.mrp && service.mrp > service.price}
              <span class="text-lg text-gray-500 line-through">{formatPrice(service.mrp)}</span>
              <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                Save {formatPrice(service.mrp - service.price)}
              </span>
        {/if}
      </div>

      <!-- Service Guarantees -->
          <div class="grid grid-cols-4 gap-2 mb-4">
            {#each [
              { icon: 'mdi:shield-check', text: '100% Satisfaction', color: 'text-blue-600' },
              { icon: 'mdi:account-check', text: 'Verified Professionals', color: 'text-green-600' },
              { icon: 'mdi:clock-fast', text: 'Quick Booking', color: 'text-purple-600' },
              { icon: 'mdi:home-city', text: 'At Your Location', color: 'text-orange-600' }
            ] as guarantee, i}
              <div class="text-center p-2 bg-blue-50 rounded relative">
                <button
                  class="mx-auto flex items-center justify-center md:hidden"
                  onclick={() => showGuaranteeText[i] = !showGuaranteeText[i]}
                  onblur={() => showGuaranteeText[i] = false}
                  tabindex="0"
                >
                  <Icon icon={guarantee.icon} class={`w-5 h-5 ${guarantee.color}`} />
                </button>
                <span class="hidden md:inline text-xs font-medium">{guarantee.text}</span>
                {#if showGuaranteeText[i]}
                  <div class="md:hidden absolute left-1/2 -translate-x-1/2 mt-2 bg-white shadow rounded p-2 text-xs z-10">
                    {guarantee.text}
          </div>
                {/if}
          </div>
            {/each}
          </div>
          </div>
          
        <!-- Service Provider + Booking Card (Modern, Compact, Combined) -->
        <div class="service-booking-card bg-white rounded-xl shadow-md border border-gray-100 p-2 sm:p-4 md:p-6 flex flex-col md:flex-row gap-4 items-stretch mb-6">
          <!-- Provider Info (fixed width, compact) -->
          <div class="w-full md:max-w-xs flex flex-col justify-center items-center md:items-start gap-2 md:gap-3">
            <button
              class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow md:hidden"
              onclick={() => showProviderText = !showProviderText}
              onblur={() => showProviderText = false}
              tabindex="0"
            >
              {service.brand?.name?.charAt(0).toUpperCase()}
            </button>
            <div class="hidden md:flex items-center gap-3">
              <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow">
                {service.brand?.name?.charAt(0).toUpperCase()}
          </div>
              <div>
                <div class="font-semibold text-gray-900 text-base md:text-lg">{service.brand?.name}</div>
                <div class="text-xs text-gray-500">Professional Service Provider</div>
                <div class="flex items-center gap-1 mt-1">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span class="text-xs text-green-600">Verified Provider</span>
        </div>
      </div>
            </div>
            {#if showProviderText}
              <div class="md:hidden mt-2 bg-white shadow rounded p-2 text-xs z-10 text-center">
                <div class="font-semibold text-gray-900">{service.brand?.name}</div>
                <div class="text-xs text-gray-500">Professional Service Provider</div>
                <div class="flex items-center gap-1 mt-1 justify-center">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span class="text-xs text-green-600">Verified Provider</span>
            </div>
              </div>
            {/if}
            <!-- Service ID and Availability below provider info -->
            <div class="flex flex-col gap-2 mt-4 w-full">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2"/></svg>
                <span class="font-medium">Service ID:</span> <span class="font-bold text-gray-900">SRV_{service.id}</span>
          </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v4a1 1 0 001 1h3m10 0h3a1 1 0 001-1V7m-1-4H5a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"/></svg>
                <span class="font-medium">Availability:</span> <span class="font-bold text-green-600">In Stock</span>
        </div>
          </div>
          </div>
          <!-- Booking Controls (right side, only button and quantity) -->
          <div class="flex-1 w-full flex flex-col justify-center gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8 items-center">
            <div class="flex items-center justify-between w-full max-w-xs mb-1">
              <span class="text-sm text-gray-700 font-medium">Quantity:</span>
              <div class="flex items-center border rounded-md overflow-hidden bg-gray-50">
                <button class="px-2 py-1 hover:bg-gray-100 text-gray-600 disabled:opacity-50" onclick={() => updateQuantity(-1)} disabled={quantity <= 1 || isInCart}>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
                </button>
                <span class="px-3 py-1 text-base font-semibold text-gray-900">{quantity}</span>
                <button class="px-2 py-1 hover:bg-gray-100 text-gray-600 disabled:opacity-50" onclick={() => updateQuantity(1)} disabled={quantity >= (service.buy_limit || 5) || isInCart}>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          </button>
        </div>
              <span class="text-xs text-gray-400 ml-2">Max: {service.buy_limit || 5}</span>
        </div>
            <div class="flex justify-center w-full mt-2">
              <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-base flex items-center justify-center gap-2 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed" style="min-width:180px;" onclick={handleBookService} disabled={isInCart}>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                {isInCart ? 'ADDED TO CART' : 'BOOK SERVICE NOW'}
              </button>
        </div>
          </div>
        </div>

        <!-- Pincode Checker -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Icon icon="mdi:map-marker-check" class="w-4 h-4 text-blue-600" />
            Check Service Availability
          </h3>
          <div class="flex gap-2">
            <input 
              type="text" 
              placeholder="Enter 6-digit pincode" 
              bind:value={pincode}
              class="flex-1 px-3 py-2 border rounded text-sm focus:border-blue-500 focus:outline-none"
              maxlength="6"
            />
            <button 
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              onclick={checkPincodeAvailability}
              disabled={checkingPincode}
            >
              {#if checkingPincode}
                <Icon icon="mdi:loading" class="w-3 h-3 animate-spin" />
              {:else}
              Check
              {/if}
            </button>
          </div>
          {#if pincodeResult}
            <div class="mt-2 p-2 rounded text-xs {pinData ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}">
              <div class="flex items-center gap-1">
                <Icon icon={pinData ? "mdi:check-circle" : "mdi:alert-circle"} class="w-3 h-3" />
                <span>{pincodeResult}</span>
              </div>
                {#if pinData}
                <p class="mt-1">COD: {pinData.cod_available ? 'Available' : 'Not Available'}</p>
                {/if}
            </div>
          {/if}
      </div>
    </div>
  </div>

    <!-- Service Details Tabs -->
    <div class="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
    <!-- Tab Headers -->
      <div class="border-b">
        <nav class="flex overflow-x-auto">
          {#each ['OVERVIEW', 'DETAILS', 'POLICY', 'QNA'] as tab}
        <button 
              class="flex-1 py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium transition-colors {activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}"
              onclick={() => activeTab = tab}
            >
              {#if tab === 'OVERVIEW'}
                <Icon icon="mdi:information" class="w-4 h-4 inline mr-1" />
              {:else if tab === 'DETAILS'}
                <Icon icon="mdi:format-list-bulleted" class="w-4 h-4 inline mr-1" />
              {:else if tab === 'POLICY'}
                <Icon icon="mdi:shield-account" class="w-4 h-4 inline mr-1" />
              {:else if tab === 'QNA'}
                <Icon icon="mdi:help-circle" class="w-4 h-4 inline mr-1" />
              {/if}
              {tab}
              {#if tab === 'QNA' && questions.length > 0}
                <span class="ml-1 bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs">
                  {questions.length}
                </span>
          {/if}
        </button>
          {/each}
        </nav>
    </div>
  
    <!-- Tab Content -->
      <div class="p-4">
        {#if activeTab === 'OVERVIEW'}
          <div class="space-y-4" in:fade={{ duration: 200 }}>
            <!-- About Service -->
            {#if service.product?.description}
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">About This Service</h3>
                <div class="prose prose-sm max-w-none text-gray-700">
                  {@html service.product.description}
                </div>
              </div>
              {/if}

            <!-- What's Included -->
            {#if serviceIncludes.length > 0}
              <div>
                <h3 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Icon icon="mdi:check-circle" class="w-4 h-4 text-green-600" />
                  What's Included
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {#each serviceIncludes as feature}
                    <div class="flex items-center gap-2 p-2 bg-green-50 rounded text-sm">
                      <Icon icon="mdi:check" class="w-3 h-3 text-green-600 flex-shrink-0" />
                      <span class="text-gray-800">{feature}</span>
            </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Service Highlights -->
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">Service Highlights</h3>
              <div class="grid grid-cols-3 gap-3">
                {#each [
                  { icon: 'mdi:clock-outline', text: serviceDuration || '45-60 mins', label: 'Duration', color: 'text-blue-600' },
                  { icon: 'mdi:star-circle', text: service.popularity + '% satisfaction', label: 'Popularity', color: 'text-green-600' },
                  { icon: 'mdi:account-group', text: 'Professional', label: 'Experience', color: 'text-purple-600' }
                ] as highlight, i}
                  <div class="text-center p-3 bg-blue-50 rounded relative">
            <button 
                      class="mx-auto flex items-center justify-center md:hidden"
                      onclick={() => showHighlightText[i] = !showHighlightText[i]}
                      onblur={() => showHighlightText[i] = false}
                      tabindex="0"
                    >
                      <Icon icon={highlight.icon} class={`w-6 h-6 ${highlight.color}`} />
            </button>
                    <div class="hidden md:block">
                      <h4 class="text-sm font-medium text-gray-900">{highlight.label}</h4>
                      <p class="text-xs text-gray-600">{highlight.text}</p>
          </div>
                    {#if showHighlightText[i]}
                      <div class="md:hidden absolute left-1/2 -translate-x-1/2 mt-2 bg-white shadow rounded p-2 text-xs z-10">
                        <h4 class="text-sm font-medium text-gray-900 mb-1">{highlight.label}</h4>
                        <p class="text-xs text-gray-600">{highlight.text}</p>
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
        </div>

        {:else if activeTab === 'DETAILS'}
          <div class="space-y-3" in:fade={{ duration: 200 }}>
            <h3 class="font-semibold text-gray-900">Service Information</h3>
          <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <tbody class="divide-y divide-gray-200">
                  <tr>
                    <td class="py-2 font-medium text-gray-700 w-1/3">Service Name</td>
                    <td class="py-2 text-gray-900">{service.name}</td>
                  </tr>
                  <tr>
                    <td class="py-2 font-medium text-gray-700">Category</td>
                    <td class="py-2 text-gray-900">{category?.name || 'N/A'}</td>
                  </tr>
                <tr>
                    <td class="py-2 font-medium text-gray-700">Service Provider</td>
                    <td class="py-2 text-gray-900">{service.brand?.name || 'N/A'}</td>
                </tr>
                <tr>
                    <td class="py-2 font-medium text-gray-700">Base Price</td>
                    <td class="py-2 text-gray-900">{formatPrice(service.product?.base_price || service.price)}</td>
                </tr>
                  <tr>
                    <td class="py-2 font-medium text-gray-700">Booking Limit</td>
                    <td class="py-2 text-gray-900">{service.buy_limit || 5} per booking</td>
                  </tr>
                  <tr>
                    <td class="py-2 font-medium text-gray-700">Availability</td>
                    <td class="py-2">
                      <span class="inline-flex items-center gap-1 {service.stock > 0 ? 'text-green-600' : 'text-red-600'}">
                        <Icon icon={service.stock > 0 ? "mdi:check-circle" : "mdi:close-circle"} class="w-3 h-3" />
                        {service.stock > 0 ? `Available` : 'Currently Unavailable'}
                      </span>
                    </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {:else if activeTab === 'POLICY'}
          <div class="space-y-3" in:fade={{ duration: 200 }}>
            <h3 class="font-semibold text-gray-900">Return & Exchange Policy</h3>
            {#if service.return_exchange_policy}
              <div class="bg-blue-50 rounded p-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 class="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Icon icon="mdi:keyboard-return" class="w-4 h-4 text-blue-600" />
                      Return Policy
                    </h4>
                    <div class="space-y-1">
                      <p class="flex items-center gap-2 text-sm">
                        <Icon icon={service.return_exchange_policy.return_available ? "mdi:check" : "mdi:close"} 
                              class="w-3 h-3 {service.return_exchange_policy.return_available ? 'text-green-600' : 'text-red-600'}" />
                        <span>{service.return_exchange_policy.return_available ? 'Returns Accepted' : 'No Returns'}</span>
                      </p>
                      {#if service.return_exchange_policy.return_available}
                        <p class="text-xs text-gray-600">
                          Return within {service.return_exchange_policy.return_days} days
                        </p>
                      {/if}
                    </div>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Icon icon="mdi:swap-horizontal" class="w-4 h-4 text-green-600" />
                      Exchange Policy
                    </h4>
                    <div class="space-y-1">
                      <p class="flex items-center gap-2 text-sm">
                        <Icon icon={service.return_exchange_policy.exchange_available ? "mdi:check" : "mdi:close"} 
                              class="w-3 h-3 {service.return_exchange_policy.exchange_available ? 'text-green-600' : 'text-red-600'}" />
                        <span>{service.return_exchange_policy.exchange_available ? 'Exchanges Accepted' : 'No Exchanges'}</span>
                      </p>
                      {#if service.return_exchange_policy.exchange_available}
                        <p class="text-xs text-gray-600">
                          Exchange within {service.return_exchange_policy.exchange_days} days
                        </p>
                      {/if}
                    </div>
                  </div>
                </div>
                {#if service.return_exchange_policy.conditions}
                  <div class="mt-3 pt-3 border-t border-blue-200">
                    <h4 class="font-medium text-gray-900 mb-2">Terms & Conditions</h4>
                    <div class="text-xs text-gray-700 space-y-1">
                      {#each service.return_exchange_policy.conditions.split(',') as condition}
                        <p class="flex items-start gap-1">
                          <Icon icon="mdi:circle-small" class="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>{condition.trim()}</span>
                        </p>
                      {/each}
                    </div>
                  </div>
                {/if}
              </div>
            {:else}
              <div class="text-center py-6 text-gray-500">
                <Icon icon="mdi:information-outline" class="w-8 h-8 mx-auto mb-2" />
                <p class="text-sm">No specific return/exchange policy available for this service.</p>
              </div>
            {/if}
        </div>

      {:else if activeTab === 'QNA'}
          <div class="space-y-4" in:fade={{ duration: 200 }}>
          <!-- Question Input -->
            <div class="bg-blue-50 rounded p-4">
              <h3 class="font-medium text-gray-900 mb-2">Ask a Question</h3>
              <div class="flex gap-2">
              <textarea
                bind:value={newQuestion}
                  placeholder="Have a question about this service?"
                  class="flex-1 px-3 py-2 border rounded text-sm focus:border-blue-500 focus:outline-none resize-none"
                  rows="2"
                disabled={questionsLoading}
              ></textarea>
              <button
                onclick={submitQuestion}
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                disabled={questionsLoading || !newQuestion.trim()}
              >
                Submit
              </button>
            </div>
          </div>

          <!-- Questions List -->
          {#if questionsLoading}
              <div class="flex justify-center py-4">
                <Icon icon="mdi:loading" class="w-6 h-6 animate-spin text-blue-600" />
            </div>
          {:else if questions.length === 0}
            <div class="text-center py-8 text-gray-500">
                <Icon icon="mdi:help-circle-outline" class="w-12 h-12 mx-auto mb-2" />
                <h4 class="font-medium text-gray-600 mb-1">No Questions Yet</h4>
                <p class="text-sm">Be the first to ask a question about this service!</p>
            </div>
          {:else}
              <div class="space-y-3">
              {#each questions as question}
                  <div class="border rounded p-3">
                  <!-- Question -->
                    <div class="flex gap-3 mb-2">
                      <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span class="text-blue-600 font-medium text-xs">
                          {question.user?.first_name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="font-medium text-gray-900 text-sm">
                          {question.user?.first_name} {question.user?.last_name}
                        </span>
                          <span class="text-xs text-gray-500">
                            {new Date(question.created).toLocaleDateString()}
                          </span>
                      </div>
                        <p class="text-gray-700 text-sm">{question.question_text}</p>
                    </div>
                  </div>

                  <!-- Answers -->
                  {#if question.answers?.length}
                      <div class="ml-11 space-y-2">
                      {#each question.answers as answer}
                          <div class="bg-green-50 rounded p-2 border-l-2 border-green-500">
                            <div class="flex items-center gap-2 mb-1">
                              <Icon icon="mdi:reply" class="w-3 h-3 text-green-600" />
                              <span class="font-medium text-gray-900 text-xs">
                                {answer.user?.first_name} {answer.user?.last_name}
                              </span>
                              <span class="text-xs text-gray-500">
                                {new Date(answer.created).toLocaleDateString()}
                              </span>
                              </div>
                            <p class="text-gray-700 text-xs">{answer.answer_text}</p>
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

    <!-- Related Services -->
    {#if relatedServices.length > 0}
      <div class="mt-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Related Services</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {#each relatedServices as relatedService}
          <Service service={relatedService} />
        {/each}
      </div>
      </div>
    {/if}

    <!-- Social Sharing -->
    <div class="mt-6 bg-white rounded-lg shadow-sm p-4">
      <h3 class="font-medium text-gray-900 mb-3 text-center">Share This Service</h3>
      <div class="flex justify-center gap-3">
        <a 
          href="https://www.facebook.com/sharer/sharer.php?u={encodeURIComponent($page.url.href)}"
          target="_blank" 
          rel="noopener noreferrer"
          class="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
        >
          <Icon icon="mdi:facebook" class="w-4 h-4" />
          <span class="hidden sm:inline">Facebook</span>
        </a>
        <a 
          href="https://twitter.com/intent/tweet?url={encodeURIComponent($page.url.href)}&text={encodeURIComponent(service.name)}"
          target="_blank" 
          rel="noopener noreferrer"
          class="flex items-center gap-1 bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded text-sm transition-colors"
        >
          <Icon icon="mdi:twitter" class="w-4 h-4" />
          <span class="hidden sm:inline">Twitter</span>
        </a>
        <a 
          href="https://wa.me/?text={encodeURIComponent(service.name + ' ' + $page.url.href)}"
          target="_blank" 
          rel="noopener noreferrer"
          class="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors"
        >
          <Icon icon="mdi:whatsapp" class="w-4 h-4" />
          <span class="hidden sm:inline">WhatsApp</span>
        </a>
      </div>
    </div>
  </div>
</div>

<style>
  .prose h1, .prose h2, .prose h3, .prose h4 {
    color: #1f2937;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .prose p {
    color: #4b5563;
    line-height: 1.6;
    margin-bottom: 0.75rem;
  }
  
  .prose ul {
    list-style-type: none;
    padding-left: 0;
    margin-bottom: 1rem;
  }
  
  .prose li {
      position: relative;
    padding-left: 1.25rem;
    margin-bottom: 0.25rem;
  }
  
  .prose li::before {
    content: "✓";
      position: absolute;
      left: 0;
    color: #10b981;
    font-weight: bold;
  }
</style>
