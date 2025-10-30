<script>
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { serviceApi } from '$lib/services/serviceApi';
  import { categoryApi } from '$lib/services/categoryApi';
  import Service from '$lib/components/service/Service.svelte';
  import { PUBLIC_API_URL, PUBLIC_ESTORE_ID } from '$env/static/public';
  import { myFetch } from '$lib/utils/myFetch';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { writable } from 'svelte/store';
  import MobileServicesView from './MobileServicesView.svelte';

  export let currentCategory = null;
  export let searchQuery = '';

  let services = [];
  let next = null;
  let categories = [];
  let allCategories = [];
  let allBrands = [];
  let filters = {};
  let loading = true;
  let loadingMore = false;
  let error = null;
  let currentPage = 1;
  let showFilters = false;
  let parentCategory = null;
  let childCategories = [];
  let displayCategories = [];
  let selectedPriceRange = [0, 10000];
  let sortOption = 'default';
  let totalServices = 0;

  const brand_ids = $page.url.searchParams.get('brand_ids');
  const search = $page.url.searchParams.get('q');
  let selectedBrands = writable(brand_ids ? brand_ids.split(',') : []);

  let params = {
    category_id: currentCategory?.id ?? null,
    brand_ids: $selectedBrands.join(','),
    search: search ? search : ""
  };

  async function loadInitialSideFilters(paramsToUse) {
    try {
      const filtersData = await serviceApi.getFilters({ ...paramsToUse, brand_ids: '' });
      filters = filtersData;
      allBrands = filtersData.brands.map(brand => ({
        brand__id: brand.brand__id,
        brand__name: brand.brand__name,
        count: brand.count
      }));
      selectedPriceRange = [
        parseFloat(filters?.price_range?.min_price ?? 0),
        parseFloat(filters?.price_range?.max_price ?? 10000)
      ];
    } catch (err) {
      error = 'Failed to load filters';
      console.error(err);
    }
  }

  async function updateBrandCounts(paramsToUse) {
    try {
      const filtersData = await serviceApi.getFilters({ ...paramsToUse, brand_ids: '' });
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

  onMount(() => {
    loadServices(params);
    fetchAllCategories();
    loadInitialSideFilters(params);
  });

  function updateCategoryContext(categoryId) {
    const category = findCategoryById(categoryId);
    if (!category) {
      displayCategories = categories;
      parentCategory = null;
      childCategories = [];
      return;
    }
    parentCategory = null;
    if (category.level > 1) {
      for (const cat of allCategories) {
        if (cat.level === category.level - 1 && cat.children.some(child => child.id === categoryId)) {
          parentCategory = cat;
          break;
        }
      }
    }
    childCategories = category.children || [];
    if (childCategories.length > 0) {
      displayCategories = childCategories;
    } else if (parentCategory && parentCategory.children) {
      displayCategories = parentCategory.children;
    } else {
      displayCategories = categories;
    }
  }

  function findCategoryById(id) {
    return allCategories.find(cat => cat.id === id);
  }

  async function loadMore() {
    loadingMore = true;
    if (typeof next === 'string') {
      const response = await fetch(next);
      let dataNew = await response.json();
      services = [...services, ...dataNew.results];
      next = datasony
    }
    loadingMore = false;
  }

  async function fetchAllCategories() {
    try {
      let data = await categoryApi.getServiceCategories();
      const flatCategories = data.results;
      allCategories = flatCategories.map(cat => ({
        ...cat,
        children: []
      }));
      categories = buildCategoryHierarchy(flatCategories);
      if (currentCategory) {
        updateCategoryContext(currentCategory.id);
      } else {
        displayCategories = categories;
      }
    } catch (err) {
      console.log(err);
    }
  }

  function buildCategoryHierarchy(flatCategories) {
    const categoryMap = new Map();
    flatCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    const rootCategories = [];
    let currentRoot = null;
    let currentLevel2 = null;

    flatCategories.forEach(cat => {
      const node = categoryMap.get(cat.id);
      if (cat.level === 1) {
        rootCategories.push(node);
        currentRoot = node;
        currentLevel2 = null;
      } else if (cat.level === 2 && currentRoot) {
        currentRoot.children.push(node);
        currentLevel2 = node;
      } else if (cat.level === 3 && currentLevel2) {
        currentLevel2.children.push(node);
      }
    });

    rootCategories.forEach(root => {
      const index = allCategories.findIndex(c => c.id === root.id);
      if (index !== -1) {
        allCategories[index].children = root.children;
      }
      root.children.forEach(child => {
        const childIndex = allCategories.findIndex(c => c.id === child.id);
        if (childIndex !== -1) {
          allCategories[childIndex].children = child.children;
        }
      });
    });

    return rootCategories;
  }

  async function loadServices(newParams = {}) {
    loading = true;
    services = [];
    try {
      const servicesData = await serviceApi.getServices({...params, ...newParams});
      services = servicesData.results;
      totalServices = servicesData.count;
      next = servicesData.next;
    } catch (err) {
      error = 'Failed to load services';
      console.error(err);
    } finally {
      loading = false;
    }
  }

  async function applyFilters() {
    const newParams = {
      page: currentPage,
      category_id: currentCategory?.id ?? null,
      min_price: selectedPriceRange[0] * 100,
      max_price: selectedPriceRange[1] * 100,
      brand_ids: $selectedBrands.join(','),
      ordering: getSortOrder(sortOption)
    };
    await loadServices(newParams);
    await updateBrandCounts(newParams);
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

  function clearCategory() {
    currentCategory = null;
    parentCategory = null;
    childCategories = [];
    displayCategories = categories;
    loadServices({ category_id: null });
    goto('/services');
  }

  function goToParentCategory() {
    if (parentCategory) {
      goto(`/services/${parentCategory.slug}`);
    } else {
      clearCategory();
    }
  }

  $: params = {
    category_id: currentCategory?.id ?? null,
    brand_ids: $selectedBrands.join(','),
    search: search ? search : ""
  };

  $: if (currentCategory) {
    loadServices(params);
    updateBrandCounts(params);
    if (allCategories.length > 0) {
      updateCategoryContext(currentCategory.id);
    }
  }

  $: if (search !== undefined) {
    loadServices(params);
    updateBrandCounts(params);
  }
</script>

<div class="md:hidden">
  <MobileServicesView 
    {currentCategory}
    {services}
    {filters}
    {params}
    {loadServices}
    loading={loading}
  />
</div>

<div class="hidden md:block">
<div class="h-screen bg-white">
  <div class="flex h-full">
    <div class="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <h2 class="font-bold text-gray-800 flex items-center gap-2">
          {#if currentCategory}
            <button 
              class="p-1 hover:bg-gray-100 rounded-full transition-colors"
              on:click={parentCategory ? goToParentCategory : clearCategory}
              aria-label="Back to parent category"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <span>{currentCategory.name}</span>
          {:else}
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            <span>All Services</span>
          {/if}
        </h2>
      </div>
      <div class="flex-1 overflow-y-auto">
        <div class="p-2">
          {#each displayCategories as category (category.id)}
            <div class="relative">
              <a 
                href="/services/{category.slug}"
                class="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors text-left {currentCategory?.id === category.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}"
              >
                <div class="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                  <img 
                    src={category.image || "/placeholder.svg?height=32&width=32"} 
                    alt={category.name}
                    class="w-full h-full object-cover"
                  />
                </div>
                <span class="text-sm truncate">{category.name}</span>
                {#if category.children && category.children.length > 0}
                  <svg class="w-4 h-4 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                {/if}
              </a>
            </div>
          {/each}
        </div>
      </div>
    </div>
    <div class="flex-1 flex flex-col">
      <div class="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
        <div>
          <h1 class="text-lg font-semibold text-gray-900">
            {currentCategory ? currentCategory.name : 'All Services'}
          </h1>
          <p class="text-xs text-gray-500">
            {totalServices} professional services
          </p>
        </div>
        <div class="flex items-center gap-3">
          <select 
            class="select select-sm select-bordered bg-white text-sm min-w-0 w-auto"
            bind:value={sortOption}
            on:change={applyFilters}
          >
            <option value="default">Default Sorting</option>
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
      <div class="flex-1 overflow-hidden bg-gray-50 relative">
        <div class="flex h-full">
          <div class="flex-1 overflow-y-auto p-4">
            {#if loading}
              <div class="flex justify-center items-center py-8">
                <div class="loading loading-spinner loading-md text-blue-500"></div>
              </div>
            {:else if error}
              <div class="text-center py-8">
                <p class="text-red-500 text-sm">{error}</p>
              </div>
            {:else if services.length === 0}
              <div class="text-center py-8">
                <div class="text-gray-400 mb-2">
                  <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <h3 class="text-base font-medium text-gray-900 mb-1">No services found</h3>
                <p class="text-gray-500 text-sm">Try adjusting your search or filters</p>
              </div>
            {:else}
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {#each services as service (service.id)}
                  <Service {service} />
                {/each}
              </div>
              <div class="flex justify-center items-center py-4">
                {#if loadingMore}
                  <div class="loading loading-spinner loading-sm"></div>
                {/if}
                {#if next && !loadingMore && !loading}
                  <button class="btn btn-outline btn-sm" on:click={loadMore}>Load More</button>
                {/if}
              </div>
            {/if}
          </div>
          {#if showFilters}
            <div class="w-72 bg-white border-l border-gray-200 overflow-y-auto" transition:fly={{ x: 300, duration: 300 }}>
              <div class="p-4">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-semibold text-gray-900">Filters</h3>
                  <button 
                    class="btn btn-ghost btn-xs"
                    on:click={() => showFilters = false}
                    aria-label="Close filters"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <div class="mb-6">
                  <h3 class="text-sm font-medium mb-2">Price Range (₹)</h3>
                  <div class="flex flex-col gap-4">
                    <div class="relative group">
                      <div 
                        class="absolute -top-8 transform -translate-x-1/2 transition-all duration-200 pointer-events-none"
                        style="left: calc({((selectedPriceRange[1] - selectedPriceRange[0]) / (selectedPriceRange[1] - selectedPriceRange[0]) * 100)}%)"
                      >
                        <div class="bg-primary text-white px-2 py-1 rounded text-xs shadow-md opacity-0 group-hover:opacity-100 whitespace-nowrap">
                          ₹{selectedPriceRange[1]}
                        </div>
                        <div class="w-2 h-2 bg-primary rotate-45 transform -translate-x-1/2 left-1/2 absolute -bottom-1"></div>
                      </div>
                      <input
                        type="range"
                        min={selectedPriceRange[0]}
                        max="10000"
                        bind:value={selectedPriceRange[1]}
                        on:change={applyFilters}
                        class="range range-primary w-full cursor-pointer"
                      />
                    </div>
                    <div class="flex justify-between text-sm text-gray-600">
                      <span>₹{selectedPriceRange[0]}</span>
                      <span>₹10,000</span>
                    </div>
                  </div>
                </div>
                <div class="mb-6">
                  <h4 class="font-medium text-gray-900 mb-3 text-sm">Service Providers</h4>
                  <div class="space-y-2">
                    {#each allBrands as brand}
                      <label class="flex items-center gap-2 text-sm">
                        <input 
                          type="checkbox" 
                          class="checkbox checkbox-primary checkbox-sm"
                          checked={$selectedBrands.includes(brand.brand__id.toString())}
                          on:change={() => {
                            selectedBrands.update(sb => 
                              sb.includes(brand.brand__id.toString())
                                ? sb.filter(id => id !== brand.brand__id.toString())
                                : [...sb, brand.brand__id.toString()]
                            );
                            applyFilters();
                          }}
                        />
                        {brand.brand__name} ({brand.count})
                      </label>
                    {/each}
                  </div>
                </div>
                <button class="btn btn-primary btn-sm w-full" on:click={applyFilters}>
                  Apply Filters
                </button>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
</div>