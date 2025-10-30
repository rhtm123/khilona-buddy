<script>
  export let data;
  let currentCategory;

  import estoreData from '$lib/stores/estore.js';

  let estore = $estoreData;

  $: if (data) {
    currentCategory = data.category;
  }
  // console.log(data);
  import Products from '$lib/components/Products.svelte';



</script>

<svelte:head>
  <title>Buy {currentCategory?.name} Online in Naigaon | Best Prices & Fast Delivery</title>

  <meta name="description" content="Shop {currentCategory?.name} at best prices in Naigaon. ✓Wide Selection ✓Trusted Sellers ✓Fast Delivery ✓Secure Payments. Order now from {estore?.name}!" />

  <meta name="keywords" content="{currentCategory?.name} Naigaon, buy {currentCategory?.name} online, best {currentCategory?.name} prices, {currentCategory?.name} shopping Naigaon, local {currentCategory?.name} store, {currentCategory?.name} delivery Naigaon" />

  <!-- Open Graph Tags -->
  <meta property="og:title" content="Buy {currentCategory?.name} Online in Naigaon | Best Prices & Fast Delivery" />
  <meta property="og:description" content="Shop {currentCategory?.name} at best prices in Naigaon. Wide Selection, Trusted Sellers & Fast Delivery!" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="{estore?.name}" />

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{currentCategory?.name} - {estore?.name}" />
  <meta name="twitter:description" content="Shop {currentCategory?.name} at best prices in Naigaon. Fast & reliable delivery!" />

  <!-- Additional SEO Meta Tags -->
  <meta name="robots" content="index, follow" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="canonical" href="https://naigaonmarket.com/shop/{currentCategory?.slug}" />

</svelte:head>

<!-- Template -->
<div class="mx-4 md:mx-8 lg:mx-16">

  <!-- <div class="text-sm breadcrumbs text-gray-600">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/shop">Shop</a></li>
      <li>{currentCategory?.name}</li>
    </ul>
  </div> -->
  <!-- Header Section -->

  <Products currentCategory={currentCategory} />

</div>

