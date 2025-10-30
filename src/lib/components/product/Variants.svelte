<script>
  let variants = [];
  export let product_listing;
  let loadingVariants = false;
  import { myFetch } from "$lib/utils/myFetch";
    import { onMount } from "svelte";
    import { PUBLIC_API_URL } from "$env/static/public";

  async function fetchVariants() {
    loadingVariants = true;
    try {
      const response = await myFetch(`${PUBLIC_API_URL}/product/product-listings/?product_id=${product_listing.product.id}&approved=true`);
      variants = response.results;
      // console.log(variants);
     
    } catch (e) {
      console.error('Error fetching variants:', e);
    //   addAlert('Failed to load variants', 'error');
    } finally {
      loadingVariants = false;
    }
  }

  $: if (product_listing) {
    fetchVariants();
  }


</script>




{#if variants.length > 1}

        <div class="space-y-2">
          <h3 class="font-medium">Select Variant</h3>
          <div class="flex flex-wrap gap-2">
            {#each variants as variant}
              <a
                class="px-4 py-2 border rounded-lg transition-all duration-200 {product_listing.id === variant.id ? 'text-primary border-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}"
                href={"/product/"+variant.slug}
              >
                {variant?.variant_name || variant.name}
            </a>
            {/each}
          </div>
          {#if loadingVariants}
            <div class="flex items-center gap-2">
              <span class="loading loading-spinner loading-sm text-primary"></span>
              <span>Loading variants...</span>
            </div>
          {/if}
        </div>
      {/if}
