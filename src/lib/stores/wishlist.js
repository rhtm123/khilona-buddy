import { writable, derived } from 'svelte/store';

// Function to get wishlist data from localStorage
function getWishlistFromLocalStorage() {
  if (typeof localStorage !== 'undefined') {
    const storedWishlist = localStorage.getItem('wishlist');
    return storedWishlist ? JSON.parse(storedWishlist) : [];
  }
  return [];
}

// Initialize wishlist store with data from localStorage
export const wishlist = writable(getWishlistFromLocalStorage());

// Create a derived store for wishlist IDs for faster lookups
export const wishlistIds = derived(wishlist, $wishlist => 
  new Set($wishlist.map(item => item.id))
);

// Subscribe to store changes and update localStorage
wishlist.subscribe(items => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('wishlist', JSON.stringify(items));
  }
});

export function toggleWishlistItem(product) {
  wishlist.update(items => {
    const existingItem = items.find(item => item.id === product.id);
    if (existingItem) {
      return items.filter(item => item.id !== product.id);
    }
    return [...items, product];
  });
}

export function removeFromWishlist(productId) {
  wishlist.update(items => items.filter(item => item.id !== productId));
}

export function isInWishlist(productId) {
  let isIn = false;
  wishlistIds.subscribe(ids => {
    isIn = ids.has(productId);
  })();
  return isIn;
} 