// src/lib/stores/estore.js

import { PUBLIC_ESTORE_ID } from '$env/static/public';
import { PUBLIC_API_URL } from '$env/static/public';
import { myFetch } from '$lib/utils/myFetch';
import { writable } from 'svelte/store';

const estoreData = writable({});

// ✅ Async logic inside an IIFE
(async () => {
  try {
    let url = `${PUBLIC_API_URL}/estore/estores/${PUBLIC_ESTORE_ID}`;
    let data1 = await myFetch(url);
    estoreData.set(data1 || {});
  } catch (e) {
    console.error("Error fetching estore data store:", e);
  }
})();

export default estoreData;
