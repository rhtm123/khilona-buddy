<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { myFetch } from '$lib/utils/myFetch';

  export let productListings = [];
  export let currentListing = {};
  export let variants = [];
  export let entities = [];
  export let returnExchangePolicies = [];
  export let taxCategories = [];
  export let featureTemplates = [];
  export let errors = {};
  export let isSubmitting = false;
  export let pendingGalleryImages = [];
  export let galleryImages = [];
  export let newFeature = { feature_template_id: null, value: '', feature_group_id: null };
  export let productId = null;
  export let showModal = false; // Now controlled by parent

  let modalMode = 'add'; // 'add' or 'edit'
  let modalGalleryImages = [];
  let featureGroups = [];

  const dispatch = createEventDispatcher();

  console.log("clistings", currentListing);
  console.log("plistings", productListings);

  // Ensure all fields are set when editing a listing
  onMount(() => {
    console.log(currentListing);
    if (currentListing && currentListing.id) {
      if (!currentListing.features) currentListing.features = [];
      if (!currentListing.manufacturer_id) currentListing.manufacturer_id = '';
      if (!currentListing.packer_id) currentListing.packer_id = '';
      if (!currentListing.importer_id) currentListing.importer_id = '';
      if (!currentListing.return_exchange_policy_id) currentListing.return_exchange_policy_id = '';
      if (!currentListing.tax_category_id) currentListing.tax_category_id = '';
      if (!currentListing.box_items) currentListing.box_items = '';
      if (!currentListing.variant_id) currentListing.variant_id = '';
    }
  });

  function handleInputChange(e) {
    dispatch('change', { currentListing });
  }

  function handleBoxItemsChange(e) {
    currentListing.box_items = e.target.value;
    dispatch('change', { currentListing });
  }

  // Fetch feature groups dynamically based on selected category
  async function fetchFeatureGroups(categoryId) {
    if (!categoryId) {
      featureGroups = [];
      return;
    }
    try {
      const res = await myFetch(`${PUBLIC_API_URL}/product/feature-groups/?category_id=${categoryId}&page=1&page_size=100`);
      featureGroups = res.results || [];
    } catch (e) {
      featureGroups = [];
    }
  }

  // Watch for category change and fetch feature groups
  $: if (currentListing && currentListing.category_id) {
    fetchFeatureGroups(currentListing.category_id);
    // Reset feature group selection when category changes
    newFeature.feature_group_id = null;
    newFeature.feature_template_id = null;
  }

  function handleAddFeature() {
    if (!newFeature.feature_template_id || !newFeature.value.trim() || !newFeature.feature_group_id) return;
    if (!currentListing.features) currentListing.features = [];
    currentListing.features = [...currentListing.features, {
      feature_template_id: newFeature.feature_template_id,
      value: newFeature.value
      // Do NOT include feature_group_id here
    }];
    dispatch('change', { currentListing });
    newFeature = { feature_template_id: null, value: '', feature_group_id: null };
  }

  function handleRemoveFeature(index) {
    if (!currentListing.features) return;
    currentListing.features = currentListing.features.filter((_, i) => i !== index);
    dispatch('change', { currentListing });
  }

  function handleSubmitListing(e) {
    e.preventDefault();
    dispatch('submitListing', { currentListing });
    // Do NOT close modal here; parent will control closing after success
  }

  function handleEditListing(listing) {
    // Instead of deep copy, emit event to parent to fetch full details
    dispatch('editListing', { listing });
  }

  function handleDeleteListing(id) {
    dispatch('deleteListing', { id });
  }

  function handleMainImageChange(event) {
    const file = event.target.files[0];
    dispatch('mainImageChange', { file });
  }

  function handleDeleteMainImage() {
    dispatch('mainImageChange', { file: null });
  }

  function handleGalleryImagesSelect(event) {
    dispatch('galleryImagesSelect', { files: Array.from(event.target.files) });
  }

  function handleDeleteGalleryImage(imageId, listingId) {
    dispatch('deleteGalleryImage', { imageId, listingId });
  }

  function handleResetListingForm() {
    dispatch('resetListingForm');
  }

  async function openModal(mode, listing = null) {
    modalMode = mode;
    if (mode === 'edit' && listing) {
      // Fetch full listing data from API (keep this logic)
      const res = await fetch(`${PUBLIC_API_URL}/product/product-listings/${listing.id}/`);
      if (res.ok) {
        const data = await res.json();
        // Flatten all feature groups into a single array and set feature_group_id
        let featuresArr = [];
        if (data.features) {
          for (const [groupName, features] of Object.entries(data.features)) {
            for (const f of features) {
              featuresArr.push({
                ...f,
                feature_group_id: featureGroups.find(fg => fg.name === groupName)?.id || null,
                feature_group_name: groupName
              });
            }
          }
        }
        currentListing = {
          id: data.id,
          product_id: data.product?.id || data.product_id || null,
          name: data.name || '',
          price: data.price || '',
          mrp: data.mrp || '',
          stock: data.stock || '',
          buy_limit: data.buy_limit || 10,
          box_items: data.box_items || '',
          features: featuresArr,
          approved: data.approved || false,
          featured: data.featured || false,
          variant_id: data.variant?.id || '',
          seller_id: data.seller?.id || '',
          packer_id: data.packer?.id || '',
          importer_id: data.importer?.id || '',
          manufacturer_id: data.manufacturer?.id || '',
          return_exchange_policy_id: data.return_exchange_policy?.id || '',
          tax_category_id: data.tax_category?.id || '',
          estore_id: data.estore_id || '',
          main_image: data.main_image || null,
          category_id: data.category?.id || data.category_id || ''
        };
        // Fetch feature groups for this category
        await fetchFeatureGroups(currentListing.category_id);
        newFeature.feature_group_id = null;
        newFeature.feature_template_id = null;
        // Fetch gallery images for this listing
        const galleryRes = await fetch(`${PUBLIC_API_URL}/product/product-listing-images/?product_listing_id=${data.id}`);
        if (galleryRes.ok) {
          const galleryData = await galleryRes.json();
          modalGalleryImages = galleryData.results || [];
        } else {
          modalGalleryImages = [];
        }
        showModal = true;
      } else {
        // fallback to previous logic if API fails
        currentListing = JSON.parse(JSON.stringify(listing));
        modalGalleryImages = [];
        showModal = true;
        await fetchFeatureGroups(currentListing.category_id);
        newFeature.feature_group_id = null;
        newFeature.feature_template_id = null;
      }
    } else {
      // Blank template for new listing
      currentListing = {
        id: null,
        product_id: productId,
        name: '',
        price: '',
        mrp: '',
        stock: '',
        buy_limit: 10,
        box_items: '',
        features: [],
        approved: false,
        featured: false,
        variant_id: '',
        seller_id: '',
        packer_id: '',
        importer_id: '',
        manufacturer_id: '',
        return_exchange_policy_id: '',
        tax_category_id: '',
        estore_id: '',
        main_image: null,
        category_id: ''
      };
      modalGalleryImages = [];
      showModal = true;
      await fetchFeatureGroups(currentListing.category_id);
      newFeature.feature_group_id = null;
      newFeature.feature_template_id = null;
    }
  }

  function closeModal() {
    showModal = false;
  }

  function handleModalInputChange(e, field) {
    currentListing[field] = e.target.value;
  }

  function handleModalSelectChange(e, field) {
    currentListing[field] = e.target.value;
  }

  function handleModalAddFeature() {
    if (!newFeature.feature_template_id || !newFeature.value.trim()) return;

    if (!currentListing.features) currentListing.features = [];
    currentListing.features = [...currentListing.features, { ...newFeature }];
    newFeature = { feature_template_id: null, value: '' };
  }

  function handleModalRemoveFeature(index) {
    if (!currentListing.features) return;
    currentListing.features = currentListing.features.filter((_, i) => i !== index);
  }

  function validateModalListingForm(data) {
    errors = {};
    const price = parseFloat(data.price);
    const stock = parseInt(data.stock);
    const buy_limit = parseInt(data.buy_limit);

    if (isNaN(price) || price <= 0) errors.price = 'Price must be a positive number.';
    if (isNaN(stock) || stock < 0) errors.stock = 'Stock must be a non-negative number.';
    if (isNaN(buy_limit) || buy_limit < 1) errors.buy_limit = 'Buy limit must be at least 1.';

    return Object.keys(errors).length === 0;
  }

  function handleModalSubmit(e) {
    e.preventDefault();
    if (!validateModalListingForm(currentListing)) return;

    dispatch('submitListing', { currentListing });
    // Only close modal if submit is successful (parent should control this)
    // closeModal(); // Removed as per new logic
  }

  function handleModalClick(e) {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  }

  function handleEscape(event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  });

  $: isEditing = !!currentListing.id;
  $: mainImagePreview = currentListing.main_image && typeof currentListing.main_image === 'string'
    ? currentListing.main_image
    : (currentListing.main_image instanceof File ? URL.createObjectURL(currentListing.main_image) : null);
</script>

<!-- Main Container -->
<div class="overflow-hidden">
  <!-- Header -->
  <div class="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-1 flex items-center">
          <svg class="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
          Product Listings
        </h2>
        <p class="text-gray-600">Manage your product listings and inventory</p>
      </div>
      <div class="flex items-center space-x-3">
        <div class="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
          <span class="text-sm font-medium text-gray-600">Total Listings:</span>
          <span class="text-lg font-bold text-green-600 ml-2">{productListings.length}</span>
        </div>
        <button 
          on:click={() => openModal('add')}
          class="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Add New Listing
        </button>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="px-8 py-8">
    {#if productListings.length > 0}
      <!-- Listing Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {#each productListings as listing (listing.id)}
          <div class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group {currentListing.id === listing.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:border-gray-300'}"
            on:click={() => openModal('edit', listing)}>
            
            <!-- Image Section -->
            <div class="aspect-w-16 aspect-h-9 bg-gray-100">
              {#if listing.main_image}
                <img 
                  src={listing.main_image || "/placeholder.svg"} 
                  alt={listing.name || `Listing #${listing.id}`}
                  class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                />
              {:else}
                <div class="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
              {/if}
            </div>

            <!-- Content Section -->
            <div class="p-6">
              <!-- Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h3 class="font-bold text-gray-900 text-lg mb-1 line-clamp-2">
                    {listing.name || `Listing #${listing.id}`}
                  </h3>
                  <div class="flex items-center space-x-2">
                    {#if listing.approved}
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L16 16m-2-2l1.586-1.586a1 1 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" clip-rule="evenodd"/>
                        </svg>
                        Approved
                      </span>
                    {:else}
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        Pending
                      </span>
                    {/if}
                  </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    on:click|stopPropagation={() => handleEditListing(listing)}
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit listing"
                    aria-label="Edit listing"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586a2 2 0 011.414 0z"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    on:click|stopPropagation={() => handleDeleteListing(listing.id)}
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete listing"
                    aria-label="Delete listing"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Details Grid -->
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-gray-600">Price:</span>
                  <div class="flex items-center space-x-2">
                    <span class="text-lg font-bold text-gray-900">₹{listing.price?.toLocaleString()}</span>
                    {#if listing.mrp && listing.mrp > listing.price}
                      <span class="text-sm text-gray-500 line-through">₹{listing.mrp?.toLocaleString()}</span>
                    {/if}
                  </div>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-gray-600">Stock:</span>
                  <div class="flex items-center space-x-2">
                    <span class="text-sm font-semibold text-gray-900">{listing.stock} units</span>
                    {#if listing.stock > 50}
                      <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                    {:else if listing.stock > 10}
                      <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    {:else if listing.stock > 0}
                      <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                    {:else}
                      <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                    {/if}
                  </div>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-gray-600">Rating:</span>
                  <div class="flex items-center space-x-1">
                    <span class="text-sm font-semibold text-gray-900">{listing.rating || 0}</span>
                    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span class="text-xs text-gray-500">({listing.review_count || 0})</span>
                  </div>
                </div>

                {#if listing.variant_name}
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-600">Variant:</span>
                    <span class="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded-md">{listing.variant_name}</span>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <!-- Empty State -->
      <div class="text-center py-16">
        <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No Product Listings</h3>
        <p class="text-gray-600 mb-6">Get started by creating your first product listing.</p>
        <button 
          on:click={() => openModal('add')}
          class="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Create First Listing
        </button>
      </div>
    {/if}

    <!-- Listing Modal -->
    {#if showModal}
      <div class="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={handleModalClick} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" on:click|stopPropagation>
          <!-- Modal Header -->
          <div class="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div class="flex items-center justify-between">
              <div>
                <h3 id="modal-title" class="text-2xl font-bold text-gray-900">
                  {modalMode === 'edit' ? 'Edit Listing' : 'Add New Listing'}
                </h3>
                <p class="text-gray-600 mt-1">
                  {modalMode === 'edit' ? 'Update your product listing details' : 'Create a new product listing'}
                </p>
              </div>
              <button 
                on:click={closeModal}
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Modal Content -->
          <form on:submit|preventDefault={handleModalSubmit} class="px-8 py-8 space-y-8">
            <!-- Basic Information -->
            <div class="bg-gray-50 rounded-xl p-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Basic Information
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="listing-name" class="block text-sm font-semibold text-gray-700 mb-2">Listing Name</label>
                  <input
                    type="text"
                    bind:value={currentListing.name}
                    id="listing-name"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter listing name (optional)"
                    on:input={handleInputChange}
                  />
                </div>
                <div>
                  <label for="listing-variant" class="block text-sm font-semibold text-gray-700 mb-2">Variant</label>
                  <select
                    bind:value={currentListing.variant_id}
                    id="listing-variant"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    on:change={handleInputChange}
                  >
                    <option value="">No variant</option>
                    {#each variants as variant}
                      <option value={variant.id}>{variant.name}</option>
                    {/each}
                  </select>
                </div>
              </div>
            </div>

            <!-- Pricing & Inventory -->
            <div class="bg-green-50 rounded-xl p-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
                Pricing & Inventory
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label for="listing-price" class="block text-sm font-semibold text-gray-700 mb-2">
                    Price (₹) <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span class="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      bind:value={currentListing.price}
                      id="listing-price"
                      class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors {errors.price ? 'border-red-500' : ''}"
                      placeholder="0.00"
                      step="0.01"
                      on:input={handleInputChange}
                    />
                  </div>
                  {#if errors.price}
                    <p class="mt-1 text-sm text-red-600 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                      </svg>
                      {errors.price}
                    </p>
                  {/if}
                </div>

                <div>
                  <label for="listing-mrp" class="block text-sm font-semibold text-gray-700 mb-2">MRP (₹)</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span class="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      bind:value={currentListing.mrp}
                      id="listing-mrp"
                      class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="0.00"
                      step="0.01"
                      on:input={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label for="listing-stock" class="block text-sm font-semibold text-gray-700 mb-2">
                    Stock <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    bind:value={currentListing.stock}
                    id="listing-stock"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors {errors.stock ? 'border-red-500' : ''}"
                    placeholder="0"
                    on:input={handleInputChange}
                  />
                  {#if errors.stock}
                    <p class="mt-1 text-sm text-red-600 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                      </svg>
                      {errors.stock}
                    </p>
                  {/if}
                </div>

                <div>
                  <label for="listing-buy-limit" class="block text-sm font-semibold text-gray-700 mb-2">
                    Buy Limit <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    bind:value={currentListing.buy_limit}
                    id="listing-buy-limit"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors {errors.buy_limit ? 'border-red-500' : ''}"
                    placeholder="10"
                    on:input={handleInputChange}
                  />
                  {#if errors.buy_limit}
                    <p class="mt-1 text-sm text-red-600 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                      </svg>
                      {errors.buy_limit}
                    </p>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Additional Details -->
            <div class="bg-purple-50 rounded-xl p-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-2a1 1 0 011-1h1a1 1 0 011 1v2"/>
                </svg>
                Additional Details
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="manufacturer" class="block text-sm font-semibold text-gray-700 mb-2">Manufacturer</label>
                  <select
                    bind:value={currentListing.manufacturer_id}
                    id="manufacturer"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    on:change={handleInputChange}
                  >
                    <option value="">Select manufacturer</option>
                    {#each entities as entity}
                      <option value={entity.id}>{entity.name}</option>
                    {/each}
                  </select>
                </div>
                <div>
                  <label for="packer" class="block text-sm font-semibold text-gray-700 mb-2">Packer</label>
                  <select
                    bind:value={currentListing.packer_id}
                    id="packer"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    on:change={handleInputChange}
                  >
                    <option value="">Select packer</option>
                    {#each entities as entity}
                      <option value={entity.id}>{entity.name}</option>
                    {/each}
                  </select>
                </div>
                <div>
                  <label for="importer" class="block text-sm font-semibold text-gray-700 mb-2">Importer</label>
                  <select
                    bind:value={currentListing.importer_id}
                    id="importer"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    on:change={handleInputChange}
                  >
                    <option value="">Select importer</option>
                    {#each entities as entity}
                      <option value={entity.id}>{entity.name}</option>
                    {/each}
                  </select>
                </div>
                <div>
                  <label for="return-policy" class="block text-sm font-semibold text-gray-700 mb-2">Return/Exchange Policy</label>
                  <select
                    bind:value={currentListing.return_exchange_policy_id}
                    id="return-policy"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    on:change={handleInputChange}
                  >
                    <option value="">Select policy</option>
                    {#each returnExchangePolicies as policy}
                      <option value={policy.id}>{policy.name}</option>
                    {/each}
                  </select>
                </div>
                <div class="md:col-span-2">
                  <label for="tax-category" class="block text-sm font-semibold text-gray-700 mb-2">Tax Category</label>
                  <select
                    bind:value={currentListing.tax_category_id}
                    id="tax-category"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    on:change={handleInputChange}
                  >
                    <option value="">Select tax category</option>
                    {#each taxCategories as tax}
                      <option value={tax.id}>{tax.name}</option>
                    {/each}
                  </select>
                </div>
              </div>
            </div>

            <!-- Box Contents -->
            <div class="bg-orange-50 rounded-xl p-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 013.438 0 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
                Box Contents
              </h4>
              <textarea
                bind:value={currentListing.box_items}
                rows="3"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="List items included in the box"
                on:input={handleBoxItemsChange}
              ></textarea>
            </div>

            <!-- Features Section -->
            <div class="bg-yellow-50 rounded-xl p-6 mt-8">
              <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4"/>
                </svg>
                Features
              </h4>
              <div class="flex items-end space-x-4 mb-6">
                <div class="flex-1">
                  <label for="feature-group" class="block text-sm font-medium text-gray-700 mb-2">Feature Group</label>
                  <select
                    bind:value={newFeature.feature_group_id}
                    id="feature-group"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select Feature Group</option>
                    {#each featureGroups as fg}
                      <option value={fg.id}>{fg.name}</option>
                    {/each}
                  </select>
                </div>
                <div class="flex-1">
                  <label for="feature-template" class="block text-sm font-medium text-gray-700 mb-2">Feature</label>
                  <select 
                    bind:value={newFeature.feature_template_id} 
                    id="feature-template"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select Feature</option>
                    {#each featureTemplates.filter(ft => ft.feature_group_id == newFeature.feature_group_id) as ft}
                      <option value={ft.id}>{ft.name}</option>
                    {/each}
                  </select>
                </div>
                <div class="flex-1">
                  <label for="feature-value" class="block text-sm font-medium text-gray-700 mb-2">Value</label>
                  <input 
                    type="text" 
                    bind:value={newFeature.value} 
                    id="feature-value"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    placeholder="Enter feature value" 
                  />
                </div>
                <button 
                  type="button" 
                  on:click={handleAddFeature} 
                  class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  aria-label="Add Feature"
                >
                  Add Feature
                </button>
              </div>

              <!-- Features List -->
              {#if currentListing.features && currentListing.features.length > 0}
                <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature Group</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      {#each currentListing.features as feature, i}
                        <tr class="hover:bg-gray-50">
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {featureGroups.find(fg => fg.id == feature.feature_group_id)?.name || feature.feature_group_name || feature.feature_group_id}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {featureTemplates.find(ft => ft.id == feature.feature_template_id)?.name || feature.feature_template_id}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{feature.value}</td>
                          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              type="button" 
                              on:click={() => handleRemoveFeature(i)} 
                              class="text-red-600 hover:text-red-900 transition-colors"
                              aria-label="Remove Feature"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
              {:else}
                <div class="text-center py-8 bg-white rounded-lg border border-gray-200">
                  <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 013.438 0 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-.806-.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                  <p class="text-gray-500 text-sm">No features added yet. Add features to highlight product specifications.</p>
                </div>
              {/if}
            </div>

            <!-- Images Section -->
            <div class="bg-pink-50 rounded-xl p-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <svg class="w-5 h-5 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Product Images
              </h4>
              
              <!-- Main Image -->
              <div class="mb-8">
                <h5 class="text-md font-semibold text-gray-800 mb-4">Main Image</h5>
                {#if currentListing.main_image}
                  <div class="relative inline-block mb-4">
                    <img 
                      src={currentListing.main_image || "/placeholder.svg"} 
                      alt="" 
                      class="h-32 w-32 object-cover rounded-lg border border-gray-200 shadow-sm" 
                    />
                    <button 
                      type="button" 
                      class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm" 
                      on:click={handleDeleteMainImage}
                      aria-label="Delete Main Image"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                {/if}
                <div class="flex items-center justify-center w-full">
                  <label for="main-image-upload" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg class="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                      </svg>
                      <p class="mb-2 text-sm text-gray-500"><span class="font-semibold">Click to upload</span> main image</p>
                      <p class="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                    </div>
                    <input id="main-image-upload" type="file" accept="image/*" on:change={handleMainImageChange} class="hidden" />
                  </label>
                </div>
              </div>

              <!-- Gallery Images -->
              <div>
                <h5 class="text-md font-semibold text-gray-800 mb-4">Gallery Images</h5>
                <div class="flex items-center justify-center w-full mb-4">
                  <label for="gallery-images-upload" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg class="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                      </svg>
                      <p class="mb-2 text-sm text-gray-500"><span class="font-semibold">Click to upload</span> gallery images</p>
                      <p class="text-xs text-gray-500">Multiple PNG, JPG or JPEG files</p>
                    </div>
                    <input id="gallery-images-upload" type="file" accept="image/*" multiple on:change={handleGalleryImagesSelect} class="hidden" />
                  </label>
                </div>
                
                <!-- Gallery Preview -->
                {#if modalGalleryImages.length > 0}
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {#each modalGalleryImages as img}
                      <div class="relative group">
                        <img 
                          src={img.image || img.url} 
                          alt="" 
                          class="h-24 w-24 object-cover rounded-lg border border-gray-200 shadow-sm" 
                        />
                        <button 
                          type="button" 
                          class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm opacity-0 group-hover:opacity-100" 
                          on:click={() => handleDeleteGalleryImage(img.id, currentListing.id)}
                          aria-label="Delete Gallery Image"
                        >
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    {/each}
                  </div>
                {:else}
                  <div class="text-center py-8 bg-white rounded-lg border border-gray-200">
                    <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <p class="text-gray-500 text-sm">No gallery images uploaded yet.</p>
                  </div>
                {/if}
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="flex justify-end space-x-4 pt-8 border-t border-gray-200">
              <button 
                type="button" 
                on:click={closeModal} 
                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                aria-label={modalMode === 'edit' ? 'Update Listing' : 'Create Listing'}
              >
                {#if isSubmitting}
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 118-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                {:else}
                  {modalMode === 'edit' ? 'Update Listing' : 'Create Listing'}
                {/if}
              </button>
            </div>
          </form>
        </div>
      </div>
    {/if}
  </div>
</div>
 