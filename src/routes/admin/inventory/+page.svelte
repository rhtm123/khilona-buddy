<!-- SellerAdmin.svelte -->
<script>

    import { user } from "$lib/stores/auth";
    import { PUBLIC_API_URL } from "$env/static/public";
  import { myFetch } from "$lib/utils/myFetch";
  import { onDestroy } from "svelte";
  import Icon from '@iconify/svelte';
  import AlertContainer from '$lib/components/AlertContainer.svelte';
  import { alerts } from '$lib/stores/alert';

    let authUser;
    const unsubscribe = user.subscribe(value => {
        authUser = value;
    });

    onDestroy(() => {
        unsubscribe(); // Cleanup to avoid memory leaks
    });

    let loading = false;

    let products = [];
    let next;
    let count = 0;

    let showBulkUploadModal = false;
    let bulkFile = null;
    let uploading = false;

    $: if (authUser){
        fetchProducts();
    }

    async function fetchProducts(){
        loading = true;
        let url = `${PUBLIC_API_URL}/product/products/?page=1&page_size=10&seller_id=${authUser?.entity.id}`;
        try {
            let data = await myFetch(url);
            products = data.results || [];
            next = data.next;
            count = data.count;
        } catch (e) {
            products = [];
            next = null;
            count = 0;
        }
        loading = false;
    }

    async function loadMore() {
        loading = true;
        try {
            const dataNew = await myFetch(next);
            products = [...products, ...(dataNew.results || [])];
            next = dataNew.next;
        } catch (e) {
            // handle error
        }
        loading = false;
    }

    async function deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await myFetch(`${PUBLIC_API_URL}/product/products/${productId}/`, 'DELETE');
            alerts.update(alertsArr => [
                ...alertsArr,
                { id: Date.now(), message: 'Product deleted successfully!', type: 'success', duration: 3000 }
            ]);
            fetchProducts();
        } catch (e) {
            alerts.update(alertsArr => [
                ...alertsArr,
                { id: Date.now(), message: 'Failed to delete product.', type: 'error', duration: 3000 }
            ]);
        }
    }

    function openBulkUploadModal() { showBulkUploadModal = true; }
    function closeBulkUploadModal() { showBulkUploadModal = false; bulkFile = null; }
    async function handleBulkUpload() {
      if (!bulkFile) return;
      uploading = true;
      const formData = new FormData();
      formData.append('file', bulkFile);
      await fetch(`${PUBLIC_API_URL}/product/upload-products/`, {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${authUser?.access_token}` }
      });
      uploading = false;
      closeBulkUploadModal();
      // Show success alert
      alerts.update(alertsArr => [
        ...alertsArr,
        { id: Date.now(), message: 'Products uploaded successfully!', type: 'success', duration: 3000 }
      ]);
      // Fetch product listings again
      fetchProducts();
    }

  

    const logout = () => {
        // Add your logout logic here
        alert('Logout clicked');
    };
</script>

        <!-- Analytics Page (same as before) -->

            <div class="max-w-7xl mx-auto">
                <div class="flex justify-between items-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-900">Inventory Management</h1>
                    <div class="flex gap-2">
                        <a href="/admin/inventory/add-product">
                            <button class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors mr-4">
                                <Icon icon="mdi:plus" class="w-5 h-5 mr-2" /> Add Product
                            </button>
                        </a>
                        <button class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors" on:click={openBulkUploadModal}>
                            <Icon icon="mdi:cloud-upload" class="w-5 h-5 mr-2" /> Bulk Upload
                        </button>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Size</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size Unit</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                          {#if products && products.length > 0}
                            {#each products as product (product.id)}
                              <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 text-sm font-medium text-gray-900">
                                  <a href={`/admin/inventory/${product.id}`} class="text-blue-600 hover:underline">{product.name}</a>
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-900">{product.category?.name ?? '-'}</td>
                                <td class="px-6 py-4 text-sm text-gray-900">{product.brand?.name ?? '-'}</td>
                                <td class="px-6 py-4 text-sm text-gray-900">{product.unit_size ?? '-'}</td>
                                <td class="px-6 py-4 text-sm text-gray-900">{product.size_unit ?? '-'}</td>
                                <td class="px-6 py-4 text-sm text-gray-900">{product.created ? new Date(product.created).toLocaleDateString() : '-'}</td>
                                <td class="px-6 py-4 text-sm font-medium">
                                  <a href={`/admin/inventory/add-product?product_id=${product.id}&edit_step=1`}>
                                    <button class="text-blue-600 hover:text-blue-900">Edit</button>
                                  </a>
                                  <button class="text-red-600 hover:text-red-900 ml-4" on:click={() => deleteProduct(product.id)}>Delete</button>
                                </td>
                              </tr>
                            {/each}
                          {:else}
                            <tr>
                              <td colspan="7" class="text-center text-gray-400 py-8">No products found.</td>
                            </tr>
                          {/if}

                            {#if loading}
                                <div class="p-4">
                                    <span class="loading loading-spinner loading-sm"></span>
                                </div>
                            {/if}
                        </tbody>
                    </table>
                </div>

                <div class="mt-2 flex justify-between items-center px-6 py-3 bg-white rounded-b-xl shadow-sm">
        
                    <div class="flex space-x-2">
                        {#if (next && !loading)}
                        <button on:click={loadMore} class="px-3 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200">
                            Load More
                        </button>
                        {/if}
                    </div>
            
                    <div class="text-sm text-gray-500">
                        Showing {products.length} of {count} results
                    </div>
                    
                </div>

            </div>

<!-- Keep the global style tag -->

{#if showBulkUploadModal}
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" on:click={() => closeBulkUploadModal()}>
    <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative" on:click|stopPropagation>
      {#if uploading}
        <div class="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10 rounded-2xl">
          <span class="loading loading-spinner loading-lg text-green-600 mb-2"></span>
          <span class="text-green-700 font-semibold">Uploading...</span>
        </div>
      {/if}
      <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors" on:click={closeBulkUploadModal} aria-label="Close" disabled={uploading}>
        <Icon icon="mdi:close" class="w-7 h-7" />
      </button>
      <div class="flex flex-col items-center gap-6">
        <Icon icon="mdi:upload" class="w-14 h-14 text-green-600 mb-2" />
        <h2 class="text-2xl font-bold mb-2 text-gray-900">Bulk Upload Products</h2>
        <input type="file" accept=".xlsx,.xls" on:change={e => bulkFile = e.target.files[0]} class="mb-4 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100" disabled={uploading} />
        <button class="w-full py-3 px-6 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-lg shadow transition-all focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" on:click={handleBulkUpload} disabled={!bulkFile || uploading}>
          <span class="flex items-center justify-center gap-2">
            <Icon icon="mdi:cloud-upload" class="w-6 h-6" />
            Upload
          </span>
        </button>
      </div>
    </div>
  </div>
{/if}

<AlertContainer />