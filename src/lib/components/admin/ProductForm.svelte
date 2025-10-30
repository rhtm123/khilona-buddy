<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import TiptapEditor from '$lib/components/wyswyg/TiptapEditor.svelte';

  export let product = {
    id: null,
    name: '',
    about: '',
    description: '',
    important_info: '',
    unit_size: 1.00,
    size_unit: '',
    is_service: false,
    category_id: null,
    brand_id: null,
    tax_category_id: null,
    country_of_origin: 'India'
  };
  export let categories = [];
  export let brands = [];
  export let taxCategories = [];
  export let isSubmitting = false;
  export let errors = {};

  const dispatch = createEventDispatcher();
  let editorContent = typeof product.description === 'string' ? product.description : '<p></p>';

  $: if (product.description !== editorContent) {
    editorContent = typeof product.description === 'string' ? product.description : '<p></p>';
  }

  function handleEditorChange(event) {
    editorContent = event.detail;
    console.log('Description',product.description)
    product.description = editorContent;
    dispatch('change', { product });
  }

  function handleInputChange() {
    dispatch('change', { product });
  }

  function submitForm(event) {
    event.preventDefault();
    dispatch('submit', { product, editorContent });
  }
</script>

<form on:submit={submitForm} class="space-y-10 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-1 flex items-center">
      <svg class="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      Product Details
    </h1>
    <p class="text-gray-600">Fill in the product information below</p>
  </div>

  <!-- Basic Information -->
  <div class="bg-blue-50 rounded-xl p-6 mb-8">
    <h2 class="text-lg font-semibold text-blue-900 mb-6 flex items-center">
      <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      Basic Information
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Product Name -->
      <div class="md:col-span-2">
        <label for="product-name" class="block text-sm font-medium text-gray-700 mb-2">
          Product Name <span class="text-red-500">*</span>
        </label>
        <input 
          type="text" 
          bind:value={product.name}
          id="product-name"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors {errors.name ? 'border-red-500' : ''}"
          placeholder="Enter a descriptive product name"
          on:input={handleInputChange}
        />
        {#if errors.name}
          <p class="mt-1 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            {errors.name}
          </p>
        {/if}
      </div>
      <!-- Category -->
      <div>
        <label for="product-category" class="block text-sm font-medium text-gray-700 mb-2">
          Category <span class="text-red-500">*</span>
        </label>
        <select 
          bind:value={product.category_id}
          id="product-category"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors {errors.category_id ? 'border-red-500' : ''}"
          on:change={handleInputChange}
        >
          <option value="">Select a category</option>
          {#each categories as category}
            <option value={category.id}>{category.name}</option>
          {/each}
        </select>
        {#if errors.category_id}
          <p class="mt-1 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            {errors.category_id}
          </p>
        {/if}
      </div>
      <!-- Brand -->
      <div>
        <label for="product-brand" class="block text-sm font-medium text-gray-700 mb-2">
          Brand <span class="text-red-500">*</span>
        </label>
        <select 
          bind:value={product.brand_id}
          id="product-brand"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors {errors.brand_id ? 'border-red-500' : ''}"
          on:change={handleInputChange}
        >
          <option value="">Select a brand</option>
          {#each brands as brand}
            <option value={brand.id}>{brand.name}</option>
          {/each}
        </select>
        {#if errors.brand_id}
          <p class="mt-1 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            {errors.brand_id}
          </p>
        {/if}
      </div>
      <!-- Tax Category -->
      <div>
        <label for="product-tax" class="block text-sm font-medium text-gray-700 mb-2">Tax Category</label>
        <select 
          bind:value={product.tax_category_id}
          id="product-tax"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          on:change={handleInputChange}
        >
          <option value="">Select tax category</option>
          {#each taxCategories as tax}
            <option value={tax.id}>{tax.name}</option>
          {/each}
        </select>
      </div>
      <!-- Country of Origin -->
      <div>
        <label for="product-country" class="block text-sm font-medium text-gray-700 mb-2">Country of Origin</label>
        <input 
          type="text" 
          bind:value={product.country_of_origin}
          id="product-country"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="e.g., India"
          on:input={handleInputChange}
        />
      </div>
      <!-- Unit Size -->
      <div>
        <label for="product-unit-size" class="block text-sm font-medium text-gray-700 mb-2">
          Unit Size
        </label>
        <input 
          type="number" 
          bind:value={product.unit_size}
          id="product-unit-size"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="e.g., 200.5"
          step="0.01"
          on:input={handleInputChange}
        />
        <p class="mt-1 text-xs text-gray-500">Specify the size of a single unit (e.g., 200.5 for 200.5ml or 1 for 1 piece).</p>
      </div>
      <!-- Size Unit -->
      <div>
        <label for="product-size-unit" class="block text-sm font-medium text-gray-700 mb-2">
          Size Unit
        </label>
        <input 
          type="text" 
          bind:value={product.size_unit}
          id="product-size-unit"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="e.g., ml, g, pcs"
          on:input={handleInputChange}
        />
        <p class="mt-1 text-xs text-gray-500">Unit of measurement for the product (e.g., ml, g, pcs).</p>
      </div>
      <!-- Is Service -->
      <div class="flex items-center md:col-span-2">
        <input 
          type="checkbox" 
          bind:checked={product.is_service} 
          class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          on:change={handleInputChange}
          id="is-service-checkbox"
        />
        <label for="is-service-checkbox" class="ml-3 text-sm font-medium text-gray-700">This is a service</label>
        <span class="ml-2 text-xs text-gray-500">(Check if this product is a service rather than a physical item. Services do not require shipping.)</span>
      </div>
    </div>
  </div>

  <!-- Product Details -->
  <div class="bg-green-50 rounded-xl p-6 mb-8">
    <h2 class="text-lg font-semibold text-green-900 mb-6 flex items-center">
      <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      Product Details
    </h2>
    <div class="space-y-6">
      <!-- About -->
      <div>
        <label for="product-about" class="block text-sm font-medium text-gray-700 mb-2">About</label>
        <textarea 
          bind:value={product.about}
          id="product-about"
          rows="3"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          placeholder="Brief description about the product"
          on:input={handleInputChange}
        ></textarea>
        <p class="mt-1 text-xs text-gray-500">A short summary or highlight about the product.</p>
      </div>
      <!-- Important Info -->
      <div>
        <label for="product-important-info" class="block text-sm font-medium text-gray-700 mb-2">Important Information</label>
        <textarea 
          bind:value={product.important_info}
          id="product-important-info"
          rows="3"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          placeholder="Important information customers should know"
          on:input={handleInputChange}
        ></textarea>
        <p class="mt-1 text-xs text-gray-500">Any critical information or warnings for the customer.</p>
      </div>
      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Detailed Description</label>
        <div class="border border-gray-300 rounded-lg overflow-hidden">
          <TiptapEditor content={editorContent} on:change={handleEditorChange} />
        </div>
        <p class="mt-1 text-xs text-gray-500">Provide a detailed description of the product, including features, usage, and benefits.</p>
      </div>
    </div>
  </div>

  <!-- Submit Button -->
  <div class="flex justify-end pt-6 border-t border-gray-200">
    <button 
      type="submit"
      disabled={isSubmitting} 
      class="inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {#if isSubmitting}
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Saving...
      {:else}
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Continue to Listings
      {/if}
    </button>
  </div>
</form> 