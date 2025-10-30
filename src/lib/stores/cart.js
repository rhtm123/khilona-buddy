import { writable } from 'svelte/store';
import { addAlert } from './alert';
import { cartLimit } from '$lib/utils/myConstants';
import { myFetch } from '$lib/utils/myFetch';
import { PUBLIC_API_URL } from '$env/static/public';

// Function to get cart data from localStorage
function getCartFromLocalStorage() {
  if (typeof localStorage !== 'undefined') {
    try {
      const storedCart = localStorage.getItem('cart');
      const parsedCart = storedCart ? JSON.parse(storedCart) : [];
      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
      return [];
    }
  }
  return [];
}

// Initialize cart store with data from localStorage
export const cart = writable(getCartFromLocalStorage());

// Subscribe to store changes and update localStorage
cart.subscribe(items => {
  if (typeof localStorage !== 'undefined') {
    try {
      // Ensure items is always an array
      const cartItems = Array.isArray(items) ? items : [];
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }
});

// Function to calculate best offer for a product
async function calculateBestOffer(product) {
  try {
    const response = await myFetch(`${PUBLIC_API_URL}/offer/product-offers/${product.id}/`);
    if (!Array.isArray(response)) return null;

    // Filter active product-specific offers
    const validOffers = response.filter(offer => 
      offer.offer_scope === 'product' && 
      offer.is_active && 
      new Date(offer.valid_until) > new Date()
    );

    if (validOffers.length === 0) return null;

    // Calculate discount for each offer
    const offersWithDiscount = validOffers.map(offer => {
      let discountAmount = 0;
      const price = product.price;

      if (offer.offer_type === 'discount') {
        discountAmount = (price * (offer.get_discount_percent / 100));
      } else if (offer.offer_type === 'buy_x_get_y') {
        const eligibleSets = Math.floor(1 / offer.buy_quantity);
        const freeItems = eligibleSets * offer.get_quantity;
        discountAmount = (price * freeItems * (offer.get_discount_percent / 100));
      }

      return {
        ...offer,
        calculatedDiscount: discountAmount
      };
    });

    // Find offer with maximum discount
    return offersWithDiscount.reduce((best, current) => 
      current.calculatedDiscount > (best?.calculatedDiscount || 0) ? current : best
    , null);
  } catch (error) {
    console.error('Error calculating best offer:', error);
    return null;
  }
}

export async function addToCart(product) {
  cart.update(items => {
    // Ensure items is an array
    const currentItems = Array.isArray(items) ? items : [];
    
    // Calculate current total quantity in cart
    const totalQuantity = currentItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const existingItem = currentItems.find(item => item.id === product.id);

    if (existingItem) {
      // Check individual item limit (10) and total cart limit (25)
      if (existingItem.quantity >= 10) {
        addAlert(`Cannot add more: Item limit (10) reached`, "error");
        return currentItems;
      }
      if (totalQuantity >= cartLimit) {
        addAlert(`Can't add to cart: Total cart limit (${cartLimit}) reached`, "error");
        return currentItems;
      }

      // Update quantity for existing item
      addAlert(`Item Added to the Cart`, "success");
      return currentItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: (item.quantity || 0) + 1 }
          : item
      );
    } else {
      // For new items, calculate the best offer
      calculateBestOffer(product).then(bestOffer => {
        if (bestOffer) {
          cart.update(items => {
            const currentItems = Array.isArray(items) ? items : [];
            const updatedItem = currentItems.find(item => item.id === product.id);
            if (updatedItem) {
              return currentItems.map(item =>
                item.id === product.id
                  ? {
                      ...item,
                      productOffer: bestOffer,
                      originalPrice: item.price,
                      discountedPrice: item.price - (item.price * (bestOffer.get_discount_percent / 100))
                    }
                  : item
              );
            }
            return currentItems;
          });
        }
      });

      addAlert(`Item Added to the Cart`, "success");
      return [...currentItems, { ...product, quantity: 1 }];
    }
  });
}