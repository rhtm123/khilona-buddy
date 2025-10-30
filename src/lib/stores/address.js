import { writable } from 'svelte/store';

export const shipaddresses = writable([]);


export function addToShipAddress(shipaddress) {
  shipaddresses.update(items => {
    const existingItemIndex = items.findIndex(item => item.id === shipaddress.id);
    
    if (existingItemIndex !== -1) {
      // If the item exists, replace it with the new shipaddress
      return items.map((item, index) =>
        index === existingItemIndex
          ? { ...shipaddress } // Replace with the new shipaddress
          : item
      );
    } else {
      // If the item doesn't exist, add it to the beginning of the array
      return [{ ...shipaddress }, ...items];
    }
  });
}