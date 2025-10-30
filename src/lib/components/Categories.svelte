<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { categoryApi } from '$lib/services/categoryApi';
  
    // Props
    export let currentCategory = null;
  
    // State
    let allCategories = [];
    let parentsCategories = [];
    let childCategories = [];
    let categories = [];
    let parentCategory = null;
    let displayCategories = [];
  
    // Find category by ID
    function findCategoryById(id) {
      return allCategories.find(cat => cat.id === id);
    }
  
    // Update display based on current category
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
  
    // Build category hierarchy from flat list
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
  
    // Fetch parent and child categories for current category
    async function loadParentsChildrenCategories() {
      if (currentCategory?.id) {
        try {
          const data = await categoryApi.getParentsChildrenCategories(currentCategory.id);
          parentsCategories = data.parents || [];
          childCategories = data.children || [];
        } catch (err) {
          console.error('Error loading parent/child categories:', err);
        }
      }
    }
  
    // Fetch all categories
    async function fetchAllCategories() {
      try {
        const data = await categoryApi.getMainCategories();
        const flatCategories = data.results || [];
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
        console.error('Error fetching categories:', err);
      }
    }
  
    // Navigate to a category
    function navigateToCategory(slug) {
      goto(`/shop/${slug}`);
    }
  
    // Handle back navigation
    function handleBackClick() {
      if (parentsCategories.length > 0) {
        const parentSlug = parentsCategories[parentsCategories.length - 1].slug;
        navigateToCategory(parentSlug);
      } else {
        goto('/shop');
      }
    }
  
    // Clear current category (go to all categories)
    function clearCategory() {
      goto('/shop');
    }
  
    // Go to parent category
    function goToParentCategory() {
      if (parentCategory) {
        navigateToCategory(parentCategory.slug);
      }
    }
  
    // Reactive updates
    $: if (currentCategory && browser) {
      loadParentsChildrenCategories();
      updateCategoryContext(currentCategory.id);
    }
  
    // Initial fetch
    onMount(async () => {
      await fetchAllCategories();
      if (currentCategory?.id) {
        updateCategoryContext(currentCategory.id);
      }
    });
  </script>
  
  <div class="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
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
          <span>All Categories</span>
        {/if}
      </h2>
    </div>
    <div class="flex-1 overflow-y-auto">
      <div class="p-2">
        {#each displayCategories as category (category.id)}
          <div class="relative">
            <a 
              href="/shop/{category.slug}"
              class="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors text-left {currentCategory?.id === category.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}"
              on:click|preventDefault={() => navigateToCategory(category.slug)}
            >
              <div class="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                <img 
                  src={category.image || "/placeholder.svg?height=32&width=32"} 
                  alt={category.name}
                  class="w-full h-full object-cover"
                />
              </div>
              <span class="text-sm truncate">{category.name}</span>
              {#if category.children?.length > 0}
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
  
  <style>
    .h-full {
      height: 100%;
    }
  </style>