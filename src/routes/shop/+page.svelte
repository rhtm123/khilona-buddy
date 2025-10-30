<script>
import Products from "$lib/components/Products.svelte";

export let data;

let page = data?.staticPage;

</script>

<svelte:head>
  <title>{page?.meta_title}</title>
  <meta name="description" content="{page?.meta_description}" />
  <meta name="keywords" content="{page?.meta_keywords}" />
  <!-- Open Graph Tags -->
  <meta property="og:title" content="{page?.meta_title}" />
  <meta property="og:description" content="{page?.meta_description}" />
  <meta property="og:type" content="website" />

  <!-- Additional SEO Meta Tags -->
  <meta name="robots" content="index, follow" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

</svelte:head>

<div class="mx-4 md:mx-8 lg:mx-16">
  
  <!-- <div class="breadcrumbs text-sm">
    <ul>
      <li><a href="/">Home</a></li>
      <li>Shop</li>
    </ul>
  </div> -->

  <Products />

</div>
