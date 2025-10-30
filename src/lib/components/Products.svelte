<script>
  import { onMount } from 'svelte';
  import { productApi } from '$lib/services/productApi';
  import { PUBLIC_API_URL, PUBLIC_ESTORE_ID } from '$env/static/public';
  import { myFetch } from '$lib/utils/myFetch';
  import { page } from '$app/stores';
  import { writable } from 'svelte/store';
  import Product from './product/Product.svelte';
  import { fade, fly } from 'svelte/transition';

  import SkeltonCategories from './skeltons/SkeltonCategories.svelte';
  import SkeltonProducts from './skeltons/SkeltonProducts.svelte';


  export let currentCategory = null;

  let products = [];
  let next = null;
  let allBrands = [];
  let filters = {};
  let loading = true;
  let loadingMore = false;
  let error = null;
  let currentPage = 1;
  let showFilters = false;
  let showSortModal = false;
  let isMobile = false;

  let selectedPriceRange = [null, null];
  let sortOption = 'default';
  let viewMode = 'grid';
  let totalProducts = 0;

  let parentsCategories = { parents: [] };
  let allCategories = [];
  let loadingCategories = true;

  // Track last applied parameters to avoid redundant applyFilters
  let lastAppliedParams = {};
  let initializedCategoryId = null;

  const brand_ids = $page.url.searchParams.get('brand_ids');
  let selectedBrands = writable(brand_ids ? brand_ids.split(',') : []);

  $: params = {
    category_id: currentCategory?.id,
    brand_ids: $selectedBrands.join(','),
  };

  let immediateParentCategory = null;

  $: immediateParentCategory = (parentsCategories?.parents && parentsCategories.parents.length > 0)
    ? parentsCategories.parents[parentsCategories.parents.length - 1]
    : null;

  onMount(() => {
    isMobile = window.innerWidth < 768;
    window.addEventListener('resize', () => {
      isMobile = window.innerWidth < 768;
    });

    // Initial load
    initializePage();
    loadInitialFilters(params);
  });

  $: if (currentCategory?.id !== undefined) {
    initializePage();
    loadInitialFilters(params);
  }

  function initializePage() {
    if (currentCategory?.id !== initializedCategoryId) {
      initializedCategoryId = currentCategory?.id;
      fetchCategories();
      applyFilters();
    }
  }

  async function fetchCategories() {
    try {
      loadingCategories=true; 
      allCategories = [];

      if (currentCategory?.id) {
        let url = `${PUBLIC_API_URL}/product/categories/parents-children/${currentCategory.id}/`+ `?estore_id=${PUBLIC_ESTORE_ID}`;
        let data = await myFetch(url);
        parentsCategories = data;
        console.log("parentsCategories",data);

        if (data.children.length === 0) {
          let urlsib = `${PUBLIC_API_URL}/product/categories/siblings/${currentCategory.id}/` + `?estore_id=${PUBLIC_ESTORE_ID}`;
          let datasib = await myFetch(urlsib);
          allCategories = datasib;
          console.log("siblings",allCategories);
        } else {
          allCategories = data.children;
          console.log("children",allCategories);
        }
      } else {
        let data = await myFetch(`${PUBLIC_API_URL}/product/categories/?level=1&estore_id=${PUBLIC_ESTORE_ID}`);
        allCategories = data.results;
        // console.log("allCategories 3",allCategories);
      }
    } catch (err) {
       console.error('Failed to fetch categories:', err);
    } finally {
      loadingCategories=false; 
    }
  }


  async function loadInitialFilters(params) {
    try {
      const filtersData = await productApi.getFilters({ ...params, brand_ids: '' });
      filters = filtersData;
      allBrands = filtersData.brands.map(brand => ({
        brand__id: brand.brand__id,
        brand__name: brand.brand__name,
        count: brand.count
      }));
      selectedPriceRange = [
        parseFloat(filters?.price_range?.min_price ?? ""),
        parseFloat(filters?.price_range?.max_price ?? "")
      ];
    } catch (err) {
      error = 'Failed to load filters';
      console.error(err);
    }
  }

  async function updateBrandCounts(params) {
    try {
      const filtersData = await productApi.getFilters(params);
      const brandCounts = filtersData.brands.reduce((acc, brand) => {
        acc[brand.brand__id] = brand.count;
        return acc;
      }, {});
      allBrands = allBrands.map(brand => ({
        ...brand,
        count: brandCounts[brand.brand__id] || 0
      }));
    } catch (err) {
      console.error('Error updating brand counts:', err);
    }
  }

  function getSortOrder(option) {
    switch (option) {
      case 'price_asc': return 'price';
      case 'price_desc': return '-price';
      case 'popularity': return '-popularity';
      case 'rating': return '-rating';
      case 'newest': return '-created';
      default: return '';
    }
  }

  async function applyFilters() {
    const newParams = {
      page: currentPage,
      category_id: currentCategory?.id,
      min_price: selectedPriceRange[0],
      max_price: selectedPriceRange[1],
      brand_ids: $selectedBrands.join(','),
      ordering: getSortOrder(sortOption)
    };

    // Avoid re-applying if parameters haven't changed
    if (JSON.stringify(newParams) === JSON.stringify(lastAppliedParams)) return;
    lastAppliedParams = { ...newParams };

    loading = true;
    products = [];

    try {
      const productsData = await productApi.getProducts(newParams);
      products = productsData.results;
      totalProducts = productsData.count;
      next = productsData.next;

      updateBrandCounts(newParams);

    } catch (err) {
      error = 'Failed to load products or filters';
      console.error(err);
    } finally {
      loading = false;
    }
  }

  async function loadMore() {
    if (!next || loadingMore) return;

    loadingMore = true;
    try {
      const response = await fetch(next);
      let dataNew = await response.json();
      products = [...products, ...dataNew.results];
      next = dataNew.next;
    } catch (err) {
      console.error('Failed to load more products:', err);
    } finally {
      loadingMore = false;
    }
  }

  // Auto-apply filters when sortOption, price range, or selected brands change
  $: autoApplyParamsTrigger = [
    sortOption,
    selectedPriceRange[0],
    selectedPriceRange[1],
    $selectedBrands.join(',')
  ];
  
  $: applyFilters(); // triggers only if autoApplyParamsTrigger changes


  function resetParams(){


  }
</script>

<!-- Breadcrumb Navigation (only one instance, above main content) -->
<nav class="text-sm text-gray-600 flex items-center gap-1 mb-2 mt-4" aria-label="Breadcrumb">
  <a href="/" class="hover:underline">Home</a>
  <span>&gt;</span>
  <a href="/shop" class="hover:underline">Shop</a>
  {#if parentsCategories?.parents}
    {#each parentsCategories.parents as parent}
      <span>&gt;</span>
      <a href={`/shop/${parent.slug}`} class="hover:underline">{parent.name}</a>
    {/each}
  {/if}
  {#if currentCategory}
    <span>&gt;</span>
    <span class="font-semibold">{currentCategory.name}</span>
  {/if}
</nav>

<!-- Main container -->
<div class="mt-4">
  <div class="min-h-screen">
    <!-- {/*-- Mobile Header --*/} -->

    <div class="md:hidden rounded-lg">
    
    <div class="sticky top-0 rounded-t-lg bg-white border-b border-gray-200 p-2 flex items-center justify-between">
      <h2 class="text-sm font-medium truncate max-w-[50vw]">
        {#if currentCategory}
          {currentCategory.name}
        {:else}
          All Products
        {/if}
      </h2>
      <div class="flex gap-2">
        <button 
          class="btn btn-sm btn-outline gap-1"
          on:click={() => showFilters = true}
          aria-label="Open filters"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
          </svg>
          Filter
        </button>
      </div>
    </div>

    <!-- {/*-- Mobile Categories Bar (Visible on mobile) --*/} -->
    <div class="sticky rounded-b-lg top-12 bg-white border-b border-gray-200 overflow-x-auto">
      <div class="flex space-x-2 p-2 min-w-max">
        {#each allCategories as category (category.id)}
        <a 
          href="/shop/{category.slug}"
          class="px-3 py-1.5 text-sm whitespace-nowrap rounded-full border border-gray-300 transition-colors 
                {category.id === currentCategory?.id ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' : 'text-gray-700 hover:bg-gray-50'}"
        >
          {category.name}
        </a>
      {/each}
      </div>
    </div>

    </div>

    <!-- {/*-- Desktop Title --*/} -->
    <div class="flex flex-col md:flex-row h-full">
      <!-- {/*-- Desktop Category Sidebar --*/} -->
      <div class="hidden md:block w-64 bg-white border-r border-gray-200 flex flex-col">
        <div class="flex-1 overflow-y-auto">
          <!-- Header above categories -->
          <div class="p-4 pb-2 border-b border-gray-200">
            {#if currentCategory}
              <div class="flex items-center gap-2">
                {#if immediateParentCategory}
                  <a href={`/shop/${immediateParentCategory.slug}`} class="text-blue-600 hover:underline flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                
                  </a>
                {:else}
                  <a href="/shop" class="text-blue-600 hover:underline flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                   
                  </a>
                {/if}
                <span class="font-semibold text-lg">{currentCategory.name}</span>
              </div>
            {:else}
              <span class="font-semibold text-lg">All Categories</span>
            {/if}
          </div>
          <!-- End header above categories -->
          <div class="p-2">
            {#if loadingCategories}
              <SkeltonCategories />
            {:else}
              {#each allCategories as category (category.id)}
                <div class="relative">
                  <a 
                    href="/shop/{category.slug}"
                    class="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors text-left {currentCategory?.id === category.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}"
                  >
                    <div class="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                      <img 
                        src={category.image || "/placeholder.svg?height=32&width=32"} 
                        alt={category.name}
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <span class="text-sm flex-1">{category.name}</span>
                  </a>
                </div>
              {/each}
            {/if}
          </div>
        </div>
      </div>

      <!-- {/*-- Main Content Area --*/} -->
      <div class="flex-1 flex flex-col">
        <!-- {/*-- Desktop Top Bar --*/} -->
        <div class="hidden md:flex px-4 py-3 border-b border-gray-200 bg-white justify-between items-center">
          <!-- Remove category name from here, only show product count -->
          <h1 class="font-medium opacity-80 hidden md:block ">
            {totalProducts} Products
          </h1>
          <div class="flex items-center gap-3">
            <select 
              class="select select-sm select-bordered bg-white text-sm min-w-0 w-auto"
              bind:value={sortOption}
              on:change={applyFilters}
            >
              <option value="default">Default </option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popularity">Sort by Popularity</option>
              <option value="rating">Sort by Rating</option>
              <option value="newest">Sort by Newest</option>
            </select>
            <button 
              class="btn btn-sm btn-outline gap-1"
              on:click={() => showFilters = !showFilters}
              aria-label="Toggle filters"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
              Filter
            </button>
          </div>
        </div>

        <!-- {/*-- Product Grid --*/} -->
        <div class="flex-1 overflow-hidden bg-gray-50 relative">
          <div class="flex h-full">
            <div class="flex-1 overflow-y-auto p-0 md:p-4">
              <!-- {/*-- Mobile product count --*/} -->
              <div class="md:hidden py-2 text-sm text-gray-500">
                {totalProducts} products
              </div>
              
              {#if loading}
                <SkeltonProducts />
              {:else if error}
                <div class="text-center py-10 text-sm text-red-600">{error}</div>
              {:else if products.length === 0}
                <div class="text-center py-10 text-gray-600">
                  <p class="text-lg font-medium mb-1">No products found</p>
                  <p class="text-sm">Try adjusting your filters or search query</p>
                </div>
              {:else}
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:px-0">
                  {#each products as product (product.id)}
                    <Product {product} />
                  {/each}
                </div>
                <div class="flex justify-center items-center py-4">
                  {#if loadingMore}
                    <SkeltonProducts />
                  {/if}
                  {#if next && !loadingMore && !loading}
                    <button class="btn btn-outline btn-sm" on:click={loadMore}>Load More</button>
                  {/if}
                </div>
              {/if}
            </div>
            
            <!-- {/*-- Filter Drawer (Mobile & Desktop) --*/} -->
            {#if showFilters}
              <div class="fixed inset-0 z-40 bg-white md:relative md:w-72 md:border-l md:shadow-lg" 
                   transition:fly={{ x: isMobile ? 300 : 0, duration: 300 }}>
                <div class="p-4 divide-y divide-gray-200 space-y-4 h-full overflow-y-auto">
                  <div class="flex justify-between items-center">
                    <h3 class="font-semibold text-gray-800 text-base">Filters</h3>
                    <button on:click={() => showFilters = false} class="text-gray-500 hover:text-gray-700">
                      ✕
                    </button>
                  </div>
              
                  <div class="pt-4">
                    <h4 class="text-sm font-medium text-gray-700 mb-2">Price Range</h4>
                    <div class="px-2">
                      <input
                        type="range"
                        min={filters.price_range?.min_price || 0}
                        max={filters.price_range?.max_price || 100}
                        bind:value={selectedPriceRange[1]}
                        class="range range-primary w-full"
                      />
                    </div>
                    <div class="flex justify-between text-sm text-gray-600 px-1">
                      <span>₹{filters.price_range?.min_price || 0}</span>
                      <span>₹{filters.price_range?.max_price || 100}</span>
                    </div>
                  </div>
              
                  <div class="pt-4">
                    <h4 class="text-sm font-medium text-gray-700 mb-2">Brands</h4>
                    <div class="space-y-2 max-h-60 overflow-y-auto">
                      {#each allBrands as brand}
                        <label class="flex items-center gap-2 text-sm text-gray-700 p-1">
                          <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" 
                            checked={$selectedBrands.includes(brand.brand__id?.toString())}
                            on:change={() => {
                              selectedBrands.update(sb =>
                                sb.includes(brand.brand__id.toString())
                                  ? sb.filter(id => id !== brand.brand__id.toString())
                                  : [...sb, brand.brand__id.toString()]
                              );
                            }}
                          />
                          <span class="truncate flex-1">{brand.brand__name}</span> 
                          <span class="text-gray-400 text-xs">({brand.count})</span>
                        </label>
                      {/each}
                    </div>
                  </div>
              
                  <div class="flex gap-2 pt-4">
                    <button class="btn btn-outline btn-sm flex-1" on:click={() => {
                      $selectedBrands = [];
                      selectedPriceRange = [
                        parseFloat(filters?.price_range?.min_price ?? 0),
                        parseFloat(filters?.price_range?.max_price ?? 100)
                      ];
                    }}>
                      Reset
                    </button>
                    <button class="btn btn-primary btn-sm flex-1" on:click={() => {
                      applyFilters();
                      if (isMobile) showFilters = false;
                    }}>
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <!-- {/*-- Mobile Sort Button (Fixed at bottom) --*/} -->
   

    <!-- Mobile Sort Button with Action -->
<div class="md:hidden fixed bottom-4 right-4 z-30">
  <button 
    class="btn btn-primary btn-circle shadow-lg"
    on:click={() => showSortModal = true}
    aria-label="Sort options"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"/>
    </svg>
  </button>
</div>

<!-- Mobile Sort Modal -->
{#if showSortModal}
  <div class="fixed inset-0 z-50 bg-black/50 flex items-end md:hidden" 
       on:click={() => showSortModal = false}>
    <div role="button" tabindex="0" class="bg-white w-full rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto"
         on:click|stopPropagation>
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-lg">Sort By</h3>
        <button on:click={() => showSortModal = false} class="text-gray-500">
          ✕
        </button>
      </div>
      
      <div class="space-y-2">
        {#each [
          { value: 'default', label: 'Default' },
          { value: 'price_asc', label: 'Price: Low to High' },
          { value: 'price_desc', label: 'Price: High to Low' },
          { value: 'popularity', label: 'Popularity' },
          { value: 'rating', label: 'Rating' },
          { value: 'newest', label: 'Newest' }
        ] as option}
          <button
            class="w-full text-left p-3 rounded-lg text-sm
                   {sortOption === option.value 
                     ? 'bg-blue-50 text-blue-600 font-medium' 
                     : 'text-gray-700 hover:bg-gray-50'}"
            on:click={() => {
              sortOption = option.value;
              applyFilters();
              showSortModal = false;
            }}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}


  </div>
</div>
