<script>
  import { wishlist, removeFromWishlist } from '$lib/stores/wishlist';
  import { addToCart } from '$lib/stores/cart';
  import { addAlert } from '$lib/stores/alert';
  import { goto } from '$app/navigation';
  import Product from '$lib/components/product/Product.svelte';

  function handleAddToCart(product) {
    addToCart(product);
    removeFromWishlist(product.id);
    addAlert('Product moved from wishlist to cart', 'success');
  }

  function handleProductClick(slug) {
    goto(`/product/${slug}`);
  }
</script>

<h2 class="text-2xl font-bold md:block hidden">My Wishlist ({$wishlist.length} items)</h2>

<div class="md:mt-4 mt-2">
  {#if $wishlist.length > 0}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {#each $wishlist as item (item.id)}
        <Product product={item} />
      {/each}
    </div>
  {:else}
    <div class="text-center py-12">
      <div class="mb-4">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900">Your wishlist is empty</h3>
      <p class="mt-1 text-gray-500">Save items you love to your wishlist</p>
      <div class="mt-6">
        <a href="/shop" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600">
          Continue Shopping
        </a>
      </div>
    </div>
  {/if}
</div> 