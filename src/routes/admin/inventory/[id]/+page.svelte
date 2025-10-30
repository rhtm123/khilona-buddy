<script>
    import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { myFetch } from '$lib/utils/myFetch';
    import { PUBLIC_API_URL } from '$env/static/public';
    
    export let data;
    const productId = data.id;

	// let { productId } = $props();

    console.log(productId)
	let loading = true;
	let activeTab = 'overview';
    let product = null;
	let productListings = [];
	let selectedListing = null;
	let listingImages = {};
	let error = null;

	let featureGroups = [];
	let featureTemplates = [];

	async function loadProductData() {
		try {
			loading = true;
			error = null;
			// Fetch product details
			const productData = await myFetch(`${PUBLIC_API_URL}/product/products/${productId}/`);
			product = productData;
            console.log(product)

			// Fetch product listings
			const listingsData = await myFetch(`${PUBLIC_API_URL}/product/product-listings/?product_id=${productId}&page_size=100`);
			productListings = listingsData.results || [];

			// Load images for each listing
			for (const listing of productListings) {
				const imagesData = await myFetch(`${PUBLIC_API_URL}/product/product-listing-images/?product_listing_id=${listing.id}&page_size=100`);
				listingImages[listing.id] = imagesData.results || [];
			}

		} catch (err) {
			error = err.message || err.detail || 'Unknown error';
			console.error('Error loading product data:', err);
		} finally {
        loading = false;
		}
	}

	async function loadListingDetails(listingId) {
		try {
			const listingData = await myFetch(`${PUBLIC_API_URL}/product/product-listings/${listingId}/`);
			selectedListing = listingData;
		} catch (err) {
			console.error('Error loading listing details:', err);
        }
    }
    
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
			month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
	function formatCurrency(amount) {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR'
		}).format(amount);
	}

	function getStockStatus(stock) {
		if (stock > 50) return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
		if (stock > 10) return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
		if (stock > 0) return { text: 'Very Low Stock', color: 'text-orange-600 bg-orange-100' };
		return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
	}

	function getApprovalStatus(approved) {
		return approved 
			? { text: 'Approved', color: 'text-green-600 bg-green-100' }
			: { text: 'Pending Approval', color: 'text-yellow-600 bg-yellow-100' };
	}

	function calculateDiscount(mrp, price) {
		if (!mrp || mrp <= price) return 0;
		return Math.round(((mrp - price) / mrp) * 100);
    }
    
    function handleEditProduct() {
        if (!product?.id && !product?.product?.id) return;
        const pid = product.id || product.product?.id || product.id;
        goto(`/admin/inventory/add-product?product_id=${pid}&edit_step=1`);
    }

	onMount(async () => {
		if (productId) {
			loadProductData();
		}
		// Fetch all feature groups (optionally filter by category if needed)
		try {
			const fgRes = await myFetch(`${PUBLIC_API_URL}/product/feature-groups/?page=1&page_size=100`);
			featureGroups = fgRes.results || [];
		} catch (e) {
			featureGroups = [];
		}
		// Fetch all feature templates
		try {
			const ftRes = await myFetch(`${PUBLIC_API_URL}/product/feature-templates/?page=1&page_size=100`);
			featureTemplates = ftRes.results || [];
		} catch (e) {
			featureTemplates = [];
		}
	});
</script>
    
<div class="min-h-screen bg-gray-50">
    {#if loading}
		<div class="flex items-center justify-center min-h-screen">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			<span class="ml-3 text-lg text-gray-600">Loading product details...</span>
		</div>
	{:else if error}
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
				<div class="text-red-600 text-lg font-medium mb-2">Error Loading Product</div>
				<p class="text-red-500 mb-4">{error}</p>
				<button 
					onclick={() => goto('/admin/inventory')}
					class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
				>
					← Back to Inventory
				</button>
            </div>
        </div>
    {:else if product}
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Header -->
			<div class="mb-8">
				<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
					<div class="flex flex-col gap-1">
						<div class="flex items-center gap-3">
                            <button 
								onclick={() => goto('/admin/inventory')}
								class="inline-flex items-center text-gray-500 hover:text-gray-700 md:mr-2"
                            >
								<svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
							<h1 class="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-0">{product.name}</h1>
							{#if productListings.length > 0 && productListings.every(l => l.approved)}
								<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
									Approved
								</span>
							{:else if productListings.length > 0}
								<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-yellow-600 bg-yellow-100">
									Pending Approval
								</span>
							{:else}
								<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
									No Listings
								</span>
							{/if}
                            </div>
						<p class="text-xs md:text-sm text-gray-500 mt-0.5">
							Product ID: {product.id} • Created {formatDate(product.created)}
						</p>
                        </div>
					<button onclick={handleEditProduct} class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mt-2 md:mt-0">
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Product
                                </button>
                </div>
            </div>
    
                <!-- Tabs -->
                <div class="border-b border-gray-200 mb-8">
                    <nav class="-mb-px flex space-x-8">
                        <button 
						onclick={() => activeTab = 'overview'}
                            class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                        >
                            Overview
                        </button>
                        <button 
						onclick={() => activeTab = 'details'}
                            class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                        >
                            Product Details
                        </button>
                        <button 
						onclick={() => activeTab = 'listings'}
						class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'listings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
					>
						Product Listings ({productListings.length})
					</button>
					<button 
						onclick={() => activeTab = 'images'}
                            class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'images' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                        >
						Images & Gallery
                        </button>
                        <button 
						onclick={() => activeTab = 'analytics'}
                            class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'analytics' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                        >
                            Analytics
                        </button>
                    </nav>
                </div>
    
			<!-- Tab Content -->
                {#if activeTab === 'overview'}
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<!-- Basic Information -->
                        <div class="lg:col-span-2 space-y-6">
						<div class="bg-white shadow rounded-lg p-6">
							<h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
									<label class="block text-sm font-medium text-gray-700 mb-1" for="productName">Product Name</label>
									<p class="text-sm text-gray-900" id="productName">{product.name}</p>
                                        </div>
                                        <div>
									<label class="block text-sm font-medium text-gray-700 mb-1" for="basePrice">Base Price</label>
									<p class="text-sm text-gray-900" id="basePrice">{formatCurrency(product.base_price)}</p>
                                        </div>
                                        <div>
									<label class="block text-sm font-medium text-gray-700 mb-1" for="unitSize">Unit Size</label>
									<p class="text-sm text-gray-900" id="unitSize">{product.unit_size} {product.size_unit}</p>
                                        </div>
                                        <div>
									<label class="block text-sm font-medium text-gray-700 mb-1" for="countryOfOrigin">Country of Origin</label>
									<p class="text-sm text-gray-900" id="countryOfOrigin">{product.country_of_origin}</p>
                                        </div>
                                        <div>
									<label class="block text-sm font-medium text-gray-700 mb-1" for="taxCategory">Tax Category</label>
									<p class="text-sm text-gray-900" id="taxCategory">{product.tax_category?.name || 'N/A'}</p>
                                        </div>
                                        <div>
									<label class="block text-sm font-medium text-gray-700 mb-1" for="lastUpdated">Last Updated</label>
									<p class="text-sm text-gray-900" id="lastUpdated">{formatDate(product.updated)}</p>
                                    </div>
                                </div>
                            </div>

						<!-- About Section -->
						{#if product.about}
							<div class="bg-white shadow rounded-lg p-6">
								<h3 class="text-lg font-medium text-gray-900 mb-4">About</h3>
								<p class="text-sm text-gray-700">{product.about}</p>
							</div>
						{/if}

						<!-- Important Information -->
						{#if product.important_info}
							<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
								<h3 class="text-lg font-medium text-yellow-800 mb-4">Important Information</h3>
								<p class="text-sm text-yellow-700">{product.important_info}</p>
							</div>
						{/if}

						<!-- Variants -->
						{#if product.variants && product.variants.length > 0}
							<div class="bg-white shadow rounded-lg p-6">
								<h3 class="text-lg font-medium text-gray-900 mb-4">Product Variants ({product.variants.length})</h3>
								<div class="space-y-4">
									{#each product.variants as variant}
										<div class="border border-gray-200 rounded-lg p-4">
											<h4 class="font-medium text-gray-900 mb-2">{variant.name}</h4>
											<div class="text-sm text-gray-500 mb-2">
												Created: {formatDate(variant.created)}
											</div>
											{#if variant.attributes && variant.attributes.length > 0}
												<div class="space-y-2">
													<h5 class="text-sm font-medium text-gray-700">Attributes:</h5>
													{#each variant.attributes as attr}
														<div class="flex justify-between text-sm">
															<span class="text-gray-600">{attr.name}:</span>
															<span class="text-gray-900">{attr.value}</span>
														</div>
													{/each}
                        </div>
											{/if}
                                </div>
									{/each}
                            </div>
                        </div>
						{/if}
                    </div>

					<!-- Quick Stats Sidebar -->
                        <div class="space-y-6">
						<div class="bg-white shadow rounded-lg p-6">
							<h3 class="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
							<div class="space-y-4">
								<div class="flex justify-between">
									<span class="text-sm text-gray-600">Total Listings</span>
									<span class="text-sm font-medium text-gray-900">{productListings.length}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-sm text-gray-600">Active Listings</span>
									<span class="text-sm font-medium text-gray-900">
										{productListings.filter(l => l.approved).length}
									</span>
								</div>
								<div class="flex justify-between">
									<span class="text-sm text-gray-600">Total Stock</span>
									<span class="text-sm font-medium text-gray-900">
										{productListings.reduce((sum, l) => sum + (l.stock || 0), 0)} units
									</span>
                                </div>
								<div class="flex justify-between">
									<span class="text-sm text-gray-600">Avg Rating</span>
									<span class="text-sm font-medium text-gray-900">
										{productListings.length > 0 
											? (productListings.reduce((sum, l) => sum + (l.rating || 0), 0) / productListings.length).toFixed(1)
											: 'N/A'
										}
									</span>
                                </div>
                            </div>
                        </div>

						<!-- Status Overview -->
						<div class="bg-white shadow rounded-lg p-6">
							<h3 class="text-lg font-medium text-gray-900 mb-4">Status Overview</h3>
							<div class="space-y-3">
								{#if productListings.length > 0}
									<div class="flex items-center justify-between">
										<span class="text-sm text-gray-600">Approved Listings</span>
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-600 bg-green-100">
											{productListings.filter(l => l.approved).length} of {productListings.length}
										</span>
                                </div>
									<div class="flex items-center justify-between">
										<span class="text-sm text-gray-600">Pending Approval</span>
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-yellow-600 bg-yellow-100">
											{productListings.filter(l => !l.approved).length} of {productListings.length}
										</span>
                                        </div>
								{:else}
									<div class="flex items-center justify-between">
										<span class="text-sm text-gray-600">No Listings</span>
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
											0
										</span>
                                    </div>
								{/if}
                                </div>
                            </div>
                        </div>
                    </div>
            {/if}

            {#if activeTab === 'details'}
				<div class="bg-white shadow rounded-lg p-6">
					<h3 class="text-lg font-medium text-gray-900 mb-6">Detailed Product Information</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div class="space-y-6">
							<div>
                                <label class="block text-sm font-medium text-gray-700 mb-2" for="productNameDetails">Product Name</label>
								<p class="text-sm text-gray-900 bg-gray-50 p-3 rounded-md" id="productNameDetails">{product.name}</p>
							</div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2" for="brandDetails">Brand</label>
                                <p class="text-sm text-gray-900 bg-gray-50 p-3 rounded-md" id="brandDetails">{product.brand?.name || 'N/A'}</p>
                            </div>
							
							{#if product.about}
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-2" for="aboutDetails">About</label>
									<p class="text-sm text-gray-900 bg-gray-50 p-3 rounded-md" id="aboutDetails">{product.about}</p>
								</div>
							{/if}
							
							{#if product.description}
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-2" for="descriptionDetails">Description</label>
									<div class="text-sm text-gray-900 bg-gray-50 p-4 rounded-md" id="descriptionDetails">
										{@html product.description}
									</div>
								</div>
							{/if}
							
                                <div>
								<label class="block text-sm font-medium text-gray-700 mb-2" for="basePriceDetails">Base Price</label>
								<p class="text-sm text-gray-900 bg-gray-50 p-3 rounded-md" id="basePriceDetails">{formatCurrency(product.base_price)}</p>
							</div>
							
                                            <div>
								<label class="block text-sm font-medium text-gray-700 mb-2" for="unitInfoDetails">Unit Information</label>
								<p class="text-sm text-gray-900 bg-gray-50 p-3 rounded-md" id="unitInfoDetails">{product.unit_size} {product.size_unit}</p>
                                            </div>
						</div>
						
						<div class="space-y-6">

                            <div>
								<label class="block text-sm font-medium text-gray-700 mb-2" for="categoryDetails">Category</label>
								<div class="flex items-center gap-2 bg-gray-50 p-3 rounded-md" id="categoryDetails">
									{#if product.category?.image}
										<img src={product.category.image} alt={product.category.name} class="w-8 h-8 rounded object-cover mr-2" />
									{/if}
									<span class="text-gray-900">{product.category?.name || 'N/A'}</span>
                                        </div>
                                </div>
                                <div>
								<label class="block text-sm font-medium text-gray-700 mb-2" for="countryOfOriginDetails">Country of Origin</label>
								<p class="text-sm text-gray-900 bg-gray-50 p-3 rounded-md" id="countryOfOriginDetails">{product.country_of_origin}</p>
							</div>
							
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2" for="taxCategoryDetails">Tax Category</label>
								<p class="text-sm text-gray-900 bg-gray-50 p-3 rounded-md" id="taxCategoryDetails">{product.tax_category?.name || 'N/A'}</p>
                                </div>
							
							{#if product.important_info}
                                <div>
									<label class="block text-sm font-medium text-gray-700 mb-2" for="importantInfoDetails">Important Information</label>
									<p class="text-sm text-gray-900 bg-yellow-50 p-3 rounded-md border border-yellow-200" id="importantInfoDetails">{product.important_info}</p>
                                </div>
							{/if}
							
                                <div>
								<label class="block text-sm font-medium text-gray-700 mb-2" for="createdDateDetails">Created Date</label>
								<p class="text-sm text-gray-900 bg-gray-50 p-3 rounded-md" id="createdDateDetails">{formatDate(product.created)}</p>
                                </div>
							
                                <div>
								<label class="block text-sm font-medium text-gray-700 mb-2" for="lastUpdatedDetails">Last Updated</label>
								<p class="text-sm text-gray-900 bg-gray-50 p-3 rounded-md" id="lastUpdatedDetails">{formatDate(product.updated)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
			{/if}

			{#if activeTab === 'listings'}
                        <div class="space-y-6">
					<!-- Listings Grid -->
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{#each productListings as listing}
							<div 
								class="bg-white shadow rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow {selectedListing?.id === listing.id ? 'ring-2 ring-blue-500' : ''}"
								onclick={() => loadListingDetails(listing.id)}
								role="button"
								tabindex="0"
								onkeydown={(e) => { if (e.key === 'Enter') loadListingDetails(listing.id) }}
							>
								<div class="aspect-w-16 aspect-h-9">
									<img 
										src={listing.main_image || '/placeholder.svg?height=200&width=300'} 
										alt={listing.name}
										class="w-full h-48 object-cover"
									/>
								</div>
								<div class="p-4">
									<h4 class="font-medium text-gray-900 mb-2 truncate">{listing.name}</h4>
									<div class="space-y-2">
										<div class="flex justify-between items-center">
											<span class="text-lg font-bold text-gray-900">{formatCurrency(listing.price)}</span>
											{#if listing.mrp && listing.mrp > listing.price}
												<span class="text-sm text-gray-500 line-through">{formatCurrency(listing.mrp)}</span>
											{/if}
										</div>
										
										{#if listing.stock}
											{@const stockStatus = getStockStatus(listing.stock)}
											<div class="flex justify-between items-center">
												<span class="text-sm text-gray-600">Stock: {listing.stock}</span>
												<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {stockStatus.color}">
													{stockStatus.text}
												</span>
											</div>
										{:else}
											<div class="flex justify-between items-center">
												<span class="text-sm text-gray-600">Stock: 0</span>
												<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-red-600 bg-red-100">
													Out of Stock
												</span>
											</div>
										{/if}
										
										<div class="flex justify-between items-center">
											<span class="text-sm text-gray-600">Rating: {listing.rating || 0}/5</span>
											{#if listing.approved}
												<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
													Approved
												</span>
											{:else}
												<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-yellow-600 bg-yellow-100">
													Pending Approval
												</span>
											{/if}
										</div>
                                </div>
                                                    </div>
                                                </div>
                                            {/each}
                                </div>

					<!-- Selected Listing Details -->
					{#if selectedListing}
						<div class="bg-white shadow rounded-lg p-6">
							<div class="flex justify-between items-start mb-6">
								<h3 class="text-lg font-medium text-gray-900">Listing Details: {selectedListing.name}</h3>
								<button 
									onclick={() => selectedListing = null}
									class="text-gray-400 hover:text-gray-600"
									aria-label="Close listing details"
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
							
							<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
								<div class="space-y-6">
									<div>
										<h4 class="font-medium text-gray-900 mb-3">Basic Information</h4>
										<div class="space-y-3">
											<div class="flex justify-between">
												<span class="text-sm text-gray-600">Listing ID:</span>
												<span class="text-sm text-gray-900">{selectedListing.id}</span>
											</div>
											<div class="flex justify-between">
												<span class="text-sm text-gray-600">Slug:</span>
												<span class="text-sm text-gray-900">{selectedListing.slug}</span>
											</div>
											<div class="flex justify-between">
												<span class="text-sm text-gray-600">Seller:</span>
												<span class="text-sm text-gray-900">{selectedListing.seller?.name}</span>
											</div>
											<div class="flex justify-between">
												<span class="text-sm text-gray-600">Category:</span>
												<span class="text-sm text-gray-900">{selectedListing.category?.name}</span>
											</div>
											<div class="flex justify-between">
												<span class="text-sm text-gray-600">Brand:</span>
												<span class="text-sm text-gray-900">{selectedListing.product?.brand?.name || 'N/A'}</span>
                            </div>
                        </div>
                                    </div>

                                        <div>
										<h4 class="font-medium text-gray-900 mb-3">Pricing & Stock</h4>
										<div class="space-y-3">
											<div class="flex justify-between">
												<span class="text-sm text-gray-600">Price:</span>
												<span class="text-sm font-medium text-gray-900">{formatCurrency(selectedListing.price)}</span>
											</div>
											<div class="flex justify-between">
												<span class="text-sm text-gray-600">MRP:</span>
												<span class="text-sm text-gray-900">{formatCurrency(selectedListing.mrp)}</span>
											</div>
											{#if calculateDiscount(selectedListing.mrp, selectedListing.price) > 0}
												<div class="flex justify-between">
													<span class="text-sm text-gray-600">Discount:</span>
													<span class="text-sm text-green-600">{calculateDiscount(selectedListing.mrp, selectedListing.price)}% off</span>
												</div>
											{/if}
											<div class="flex justify-between">
												<span class="text-sm text-gray-600">Stock:</span>
												<span class="text-sm text-gray-900">{selectedListing.stock} units</span>
											</div>
											<div class="flex justify-between">
												<span class="text-sm text-gray-600">Buy Limit:</span>
												<span class="text-sm text-gray-900">{selectedListing.buy_limit} per customer</span>
											</div>
										</div>
									</div>
								</div>

								<div class="space-y-6">
                                                <div>
										<h4 class="font-medium text-gray-900 mb-3">Performance</h4>
										<div class="space-y-3">
											<div class="flex justify-between">
												<span class="text-sm text-gray-600">Rating:</span>
												<span class="text-sm text-gray-900">{selectedListing.rating || 0}/5</span>
                                                </div>
											<div class="flex justify-between">
												<span class="text-sm text-gray-600">Reviews:</span>
												<span class="text-sm text-gray-900">{selectedListing.review_count || 0}</span>
                                                </div>
											<div class="flex justify-between">
												<span class="text-sm text-gray-600">Popularity:</span>
												<span class="text-sm text-gray-900">{selectedListing.popularity || 0}</span>
                                                </div>
                                                </div>
                                            </div>

									<div>
										<h4 class="font-medium text-gray-900 mb-3">Additional Info</h4>
										<div class="space-y-3">
											<div class="flex justify-between">
												<span class="text-sm text-gray-600">Units per Pack:</span>
												<span class="text-sm text-gray-900">{selectedListing.units_per_pack}</span>
											</div>
											<div class="flex justify-between">
												<span class="text-sm text-gray-600">Unit Size:</span>
												<span class="text-sm text-gray-900">{selectedListing.unit_size} {selectedListing.size_unit}</span>
											</div>
											<div class="flex justify-between">
												<span class="text-sm text-gray-600">Is Service:</span>
												<span class="text-sm text-gray-900">{selectedListing.is_service ? 'Yes' : 'No'}</span>
											</div>
											<div class="flex justify-between">
												<span class="text-sm text-gray-600">Created:</span>
												<span class="text-sm text-gray-900">{formatDate(selectedListing.created)}</span>
											</div>
                                    </div>
                                </div>
                            </div>
                        </div>

							{#if selectedListing.box_items}
								<div class="mt-6">
									<h4 class="font-medium text-gray-900 mb-3">Box Contents</h4>
									<p class="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{selectedListing.box_items}</p>
								</div>
							{/if}

							{#if selectedListing.features}
								<div class="mt-6">
									<h4 class="font-medium text-gray-900 mb-3">Features</h4>
									<div class="bg-gray-50 p-4 rounded-md">
										{#if Object.values(selectedListing.features).flat().length > 0}
											<table class="min-w-full divide-y divide-gray-200">
												<thead class="bg-gray-100">
													<tr>
														<th class="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Feature Group</th>
														<th class="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Feature</th>
														<th class="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Value</th>
													</tr>
												</thead>
												<tbody class="bg-white divide-y divide-gray-100">
													{#each Object.entries(selectedListing.features) as [group, featuresArr]}
														{#each featuresArr as feature}
															<tr>
																<td class="px-4 py-2 text-sm text-gray-800">
																	{#if featureGroups && featureGroups.length > 0}
																		{featureGroups.find(fg => fg.name === group)?.name || group}
																	{:else}
																		{group}
																	{/if}
																</td>
																<td class="px-4 py-2 text-sm text-gray-800">
																	{#if featureTemplates && featureTemplates.length > 0}
																		{featureTemplates.find(ft => ft.id == feature.feature_template_id)?.name || `Feature ${feature.feature_template_id}`}
																	{:else}
																		Feature {feature.feature_template_id}
																	{/if}
																</td>
																<td class="px-4 py-2 text-sm text-gray-900 font-semibold">{feature.value}</td>
															</tr>
														{/each}
													{/each}
												</tbody>
											</table>
										{:else}
											<p class="text-sm text-gray-500">No features specified</p>
										{/if}
									</div>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/if}

            {#if activeTab === 'images'}
				<div class="space-y-8">
					{#each productListings as listing}
						<div class="bg-white shadow rounded-lg p-6">
							<h3 class="text-lg font-medium text-gray-900 mb-4">
								Images for: {listing.name}
							</h3>
							
                        <!-- Main Image -->
							{#if listing.main_image}
								<div class="mb-6">
									<h4 class="text-sm font-medium text-gray-700 mb-2">Main Image</h4>
									<div class="w-64 h-48 bg-gray-100 rounded-lg overflow-hidden">
										<img 
											src={listing.main_image || "/placeholder.svg"} 
											alt={listing.name}
                                                class="w-full h-full object-cover"
                                            />
                                        </div>
                            </div>
							{/if}
							
                        <!-- Gallery Images -->
							{#if listingImages[listing.id] && listingImages[listing.id].length > 0}
								<div>
									<h4 class="text-sm font-medium text-gray-700 mb-4">
										Gallery Images ({listingImages[listing.id].length})
									</h4>
									<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
										{#each listingImages[listing.id] as image}
                                                <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                    <img 
													src={image.image || "/placeholder.svg"} 
													alt={image.alt_text || listing.name}
													class="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
												/>
                                            </div>
                                        {/each}
									</div>
                                    </div>
                                {:else}
								<p class="text-sm text-gray-500">No gallery images available for this listing.</p>
							{/if}
						</div>
					{/each}
					
					{#if productListings.length === 0}
						<div class="bg-white shadow rounded-lg p-6 text-center">
							<svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
							<h3 class="text-lg font-medium text-gray-900 mb-2">No Images Available</h3>
							<p class="text-gray-500">No product listings found, so no images to display.</p>
                                    </div>
                                {/if}
                    </div>
            {/if}

            {#if activeTab === 'analytics'}
				<div class="space-y-6">
					<!-- Key Metrics -->
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						<div class="bg-white shadow rounded-lg p-6">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
									<div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <div class="ml-4">
									<p class="text-sm font-medium text-gray-500">Total Views</p>
                                    <p class="text-2xl font-semibold text-gray-900">1,234</p>
                                </div>
                            </div>
                        </div>

						<div class="bg-white shadow rounded-lg p-6">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
									<div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                </div>
                                <div class="ml-4">
									<p class="text-sm font-medium text-gray-500">Total Orders</p>
                                    <p class="text-2xl font-semibold text-gray-900">89</p>
                                </div>
                            </div>
                        </div>

						<div class="bg-white shadow rounded-lg p-6">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
									<div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
										<svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                    </div>
                                </div>
                                <div class="ml-4">
									<p class="text-sm font-medium text-gray-500">Avg Rating</p>
									<p class="text-2xl font-semibold text-gray-900">
										{productListings.length > 0 
											? (productListings.reduce((sum, l) => sum + (l.rating || 0), 0) / productListings.length).toFixed(1)
											: '0.0'
										}
									</p>
                                </div>
                            </div>
                        </div>

						<div class="bg-white shadow rounded-lg p-6">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
									<div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-500">Popularity</p>
									<p class="text-2xl font-semibold text-gray-900">
										{productListings.length > 0 
											? Math.round(productListings.reduce((sum, l) => sum + (l.popularity || 0), 0) / productListings.length)
											: 0
										}
									</p>
                                </div>
                            </div>
                        </div>
                    </div>

					<!-- Listings Performance -->
					<div class="bg-white shadow rounded-lg p-6">
						<h3 class="text-lg font-medium text-gray-900 mb-6">Listings Performance</h3>
						<div class="overflow-x-auto">
							<table class="min-w-full divide-y divide-gray-200">
								<thead class="bg-gray-50">
									<tr>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviews</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Popularity</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
									</tr>
								</thead>
								<tbody class="bg-white divide-y divide-gray-200">
									{#each productListings as listing}
										<tr>
											<td class="px-6 py-4 whitespace-nowrap">
												<div class="text-sm font-medium text-gray-900">{listing.name}</div>
												<div class="text-sm text-gray-500">ID: {listing.id}</div>
											</td>
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{formatCurrency(listing.price)}
											</td>
											<td class="px-6 py-4 whitespace-nowrap">
												{#if listing.stock}
													{@const stockStatus = getStockStatus(listing.stock)}
													<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {stockStatus.color}">
														{listing.stock} units
													</span>
												{:else}
													<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-red-600 bg-red-100">
														0 units
													</span>
												{/if}
											</td>
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{listing.rating || 0}/5
											</td>
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{listing.review_count || 0}
											</td>
											<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{listing.popularity || 0}
											</td>
											<td class="px-6 py-4 whitespace-nowrap">
												{#if listing.approved}
													<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-600 bg-green-100">
														Approved
													</span>
												{:else}
													<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-yellow-600 bg-yellow-100">
														Pending Approval
													</span>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>

                    <!-- Performance Chart Placeholder -->
					<div class="bg-white shadow rounded-lg p-6">
						<h3 class="text-lg font-medium text-gray-900 mb-4">Performance Trends</h3>
						<div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                            <div class="text-center">
								<svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
								<h4 class="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h4>
								<p class="text-gray-500">Detailed performance charts and analytics will be available here.</p>
							</div>
                            </div>
                        </div>
                    </div>
                {/if}
        </div>
    {:else}
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div class="bg-white shadow rounded-lg p-6 text-center">
				<svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 00-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
				<h3 class="text-lg font-medium text-gray-900 mb-2">Product Not Found</h3>
				<p class="text-gray-500 mb-4">The product you're looking for doesn't exist or may have been removed.</p>
                    <button 
					onclick={() => goto('/admin/inventory')}
                        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
					← Back to Inventory
                    </button>
                </div>
            </div>
	{/if}
        </div>
