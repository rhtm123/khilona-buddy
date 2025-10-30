
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';

  import { PUBLIC_API_URL, PUBLIC_ESTORE_ID } from '$env/static/public';

  import Product from '$lib/components/product/Product.svelte';
  import Service from '$lib/components/service/Service.svelte';
  import Icon from '@iconify/svelte';
  import { cart } from '$lib/stores/cart';
  import { page } from '$app/stores';

  import SkeltonSuggestions from '$lib/components/skeltons/SkeltonSuggestions.svelte';
  import SkeltonProducts from '$lib/components/skeltons/SkeltonProducts.svelte';
  import CartBar from '$lib/components/CartBar.svelte';

  // Search State
  let searchQuery = '';
  let showSearchResults = false;

  let isSearching = false;
  let isSuggesting = false;

  let searchResults = {
    categories: [],
    products: [],
    services: [],
    totalProducts: 0,
    totalServices: 0
  };

  let searchHistory = [];
  let searchTimeout;
  let searchInput;

  let suggestions = {
      products: [],
      categories: [],
      brands: []
  };

  async function fetchSuggestions(query) {

    if (!query.trim()) {
      return;
    }

  try {
    isSuggesting = true;
    const [catRes, brandRes] = await Promise.all([
      // fetch(PUBLIC_API_URL + `/search/autocomplete/products?q=${encodeURIComponent(query)}&estore_id=${PUBLIC_ESTORE_ID}`).then(r => r.json()),
      fetch(PUBLIC_API_URL +`/search/autocomplete/categories?q=${encodeURIComponent(query)}&estore_id=${PUBLIC_ESTORE_ID}`).then(r => r.json()),
      fetch(PUBLIC_API_URL+ `/search/autocomplete/brands?q=${encodeURIComponent(query)}&estore_id=${PUBLIC_ESTORE_ID}`).then(r => r.json())
    ]);

    suggestions = {
      categories: catRes || [],
      brands: brandRes || []
    };

    console.log("Suggestions",suggestions);
  } catch (err) {
    console.error("Autocomplete failed:", err);
    suggestions = { products: [], categories: [], brands: [] };
  } finally{
    isSuggesting = false;
  }
}

  onMount(() => {
    loadSearchHistory();
    // Focus search input
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 100);
    }
    // If there is a query param, search
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      searchQuery = q;
      performSearch(searchQuery);
    }
  });

  function loadSearchHistory() {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      searchHistory = JSON.parse(savedHistory);
    }
  }

  function saveSearchHistory() {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }

  function saveToHistory(query) {
    if (query.trim() && !searchHistory.includes(query)) {
      searchHistory = [query, ...searchHistory.slice(0, 9)];
      saveSearchHistory();
    }
  }

  function removeFromHistory(query) {
    searchHistory = searchHistory.filter(item => item !== query);
    saveSearchHistory();
  }

  function clearAllHistory() {
    searchHistory = [];
    saveSearchHistory();
  }

  async function performSearch(query) {
    

    if (!query.trim()) {
      return;
    }
    isSearching = true;

    const [productRes, catRes] = await Promise.all([
      fetch(PUBLIC_API_URL + `/search/products?q=${encodeURIComponent(query)}&estore_id=${PUBLIC_ESTORE_ID}`).then(r => r.json()),
      fetch(PUBLIC_API_URL +`/search/categories?q=${encodeURIComponent(query)}&estore_id=${PUBLIC_ESTORE_ID}`).then(r => r.json()),
      // fetch(PUBLIC_API_URL+ `/search/brands?q=${encodeURIComponent(query)}&estore_id=${PUBLIC_ESTORE_ID}`).then(r => r.json())
    ]);

    try {
      searchResults = {
        categories: catRes.hits || [],
        products: productRes.hits || [],
        services:  [],
        totalProducts: productRes.hits.length || 0,
        totalServices: 0
      };

      console.log(searchResults);
      showSearchResults = true;

      // console.log("search Results",searchResults);

      
    } catch (error) {
      console.error('Search error:', error);
      searchResults = {
        categories: [],
        products: [],
        services: [],
        totalProducts: 0,
        totalServices: 0
      };
    } finally {
      isSearching = false;
    }
  }

  function handleSearchInput(e) {
    showSearchResults = false;
    isSuggesting = true;
    isSearching = true;
    searchQuery = e.target.value;
    clearTimeout(searchTimeout);
    searchResults = {
        categories: [],
        products: [],
        services: [],
        totalProducts: 0,
        totalServices: 0
    };
    suggestions = { products: [], categories: [], brands: [] };

    searchTimeout = setTimeout(() => {
      fetchSuggestions(searchQuery);
      performSearch(searchQuery);
    }, 300);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    suggestions = { products: [], categories: [], brands: [] };
    if (searchQuery.trim()) {
      performSearch(searchQuery);
      saveToHistory(query);
      // Update URL
      const url = new URL(window.location);
      url.searchParams.set('q', query);
      window.history.replaceState({}, '', url);
    }
  }

  function handleHistoryClick(query) {
    searchQuery = query;
    performSearch(query);
    fetchSuggestions(query);
  }

  function handleCategoryClick(category) {
    goto(`/shop/${category.slug}`);
  }

  function handleBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      goto('/');
    }
  }


  async function handleSuggestionClick(query) {
    searchQuery = query;
    suggestions = { products: [], categories: [], brands: [] }; // clear suggestions
    performSearch(query); // perform actual search
    saveToHistory(query);
      // Update URL
      const url = new URL(window.location);
      url.searchParams.set('q', query);
      window.history.replaceState({}, '', url);
  }

  let totalResults = () => searchResults.totalProducts + searchResults.totalServices + searchResults.categories.length;
</script>

<!-- Navbar -->
<div class="bg-white border-b border-gray-200 fixed w-full left-0 top-0 z-30 shadow">
  <div class="max-w-7xl mx-auto px-2 py-2 flex items-center gap-0 md:gap-4">
    <!-- Back Button -->
    <button onclick={handleBack} class="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Go back">
      <Icon icon="mdi:arrow-left" class="w-6 h-6 text-gray-600" />
    </button>
   
    <!-- Search Bar and Suggestions (wrapped in relative container) -->
<div class="relative flex-1 w-full">
  <input
    bind:this={searchInput}
    type="text"
    class="w-full px-4 py-2 md:py-3 bg-gray-100 rounded-full border border-blue-200 focus:border-blue-500 focus:outline-none text-base md:text-md"
    placeholder="Search products and services..."
    value={searchQuery}
    oninput={handleSearchInput}
    autocomplete="off"
    onkeydown={(e) => { if (e.key === 'Enter') { handleSearchSubmit(e); } }}
  />


</div>



    <!-- Cart Icon (hidden on mobile) -->
    
    <CartBar />

    


  </div>
</div>

<div class="min-h-[50vh]">

<!-- Recent Searches (below navbar, only on empty state) -->
{#if (!showSearchResults && searchHistory.length > 0 && searchQuery.length==0)}
  <div class="max-w-7xl mx-auto pt-4 px-4 flex flex-col md:flex-row md:items-center md:justify-between">
    <div>
      <h3 class="text-base font-semibold text-gray-900 mb-2 md:mb-0">Recent Searches</h3>
      <div class="flex flex-wrap gap-2 py-2">
        {#each searchHistory.slice(0, 8) as query}
          <button 
            onclick={() => handleHistoryClick(query)}
            class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
          >
            {query}
          </button>
        {/each}
      </div>
    </div>
    <button
      onclick={clearAllHistory}
      class="text-green-700 text-sm font-medium hover:underline mt-2 md:mt-0 md:ml-4"
      style="align-self:flex-start"
    >clear</button>
  </div>
{/if}


{#if (searchQuery)}

<div class="max-w-7xl mx-auto max-h-72 pt-6 px-4 overflow-y-auto">

  {#if isSuggesting}
   <SkeltonSuggestions />
  {/if}
  
  <ul class="">

    <!-- Categories Suggestions -->
{#each suggestions.categories as category}
<li
  class="py-2 flex items-center cursor-pointer"
  onclick={() => handleSuggestionClick(category)}
>
  
  <span>📂 {category}</span>
</li>
{/each}

<!-- Brands Suggestions -->
{#each suggestions.brands as brand}
<li
  class="py-2 flex items-center cursor-pointer"
  onclick={() => handleSuggestionClick(brand)}
>
  
  <span>🏷️ {brand}</span>
</li>
{/each}


  </ul>
</div>

{/if}

<!-- Main Content -->
<div class="max-w-7xl mx-auto md:pt-4  px-4 pb-16 pt-4">
  {#if searchQuery }
    <!-- Results Summary -->
    <div class="mb-4" in:fade={{ duration: 200 }}>
      <h1 class="text-xl font-semibold text-gray-900 mb-2">
        Search results for "{searchQuery}"
      </h1>
    </div>

    <!-- Category Suggestions -->
    {#if searchResults.categories.length > 0}
      <div class="mb-8" in:fly={{ y: 20, duration: 300 }}>
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Icon icon="mdi:tag-multiple" class="w-5 h-5 text-blue-600" />
          Related Categories
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {#each searchResults.categories as category}
            <button 
              onclick={() => handleCategoryClick(category)}
              class="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
            >
              <div class="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center overflow-hidden">
                {#if category.image}
                  <img src={category.image || "/placeholder.svg"} alt={category.name} class="w-full h-full object-cover" />
                {:else}
                  <Icon icon="mdi:tag" class="w-5 h-5 text-blue-600" />
                {/if}
              </div>
              <span class="font-medium text-gray-900">{category.name}</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}

    {#if isSearching}
      <SkeltonProducts />
    {/if}


    <!-- Products Section -->
    {#if searchResults.products.length > 0}
      <div class="mb-8" in:fly={{ y: 20, duration: 300, delay: 100 }}>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Icon icon="mdi:package-variant" class="w-5 h-5 text-blue-600" />
            Products ({searchResults.totalProducts})
          </h2>
          {#if searchResults.totalProducts > searchResults.products.length}
            <a 
              href="/shop?q={encodeURIComponent(searchQuery)}"
              class="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all products →
            </a>
          {/if}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {#each searchResults.products as product}
            <Product {product} />
          {/each}
        </div>
      </div>
    {/if}

    <!-- Services Section -->
    {#if searchResults.services.length > 0}
      <div class="mb-8" in:fly={{ y: 20, duration: 300, delay: 200 }}>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Icon icon="mdi:hand-heart" class="w-5 h-5 text-blue-600" />
            Services ({searchResults.totalServices})
          </h2>
          {#if searchResults.totalServices > searchResults.services.length}
            <a 
              href="/services?q={encodeURIComponent(searchQuery)}"
              class="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all services →
            </a>
          {/if}
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {#each searchResults.services as service}
            <Service service={service} />
          {/each}
        </div>
      </div>
    {/if}

  {/if}



  {#if totalResults() === 0 && !isSearching && searchQuery}
      <div class="text-center py-12" in:fade={{ duration: 300 }}>
        <Icon icon="mdi:magnify" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-xl font-medium text-gray-900 mb-2">No results found</h3>
        <p class="text-gray-600 mb-6">
          Try different keywords or browse our categories.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a 
            href="/shop"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Browse Products
          </a>
        </div>
      </div>
    {/if}

</div>

</div>

