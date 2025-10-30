<script>
  import { page } from '$app/stores';
  import Services from '$lib/components/Services.svelte';
  
  let { data } = $props();
  let category = $derived(data.category);
  
</script>

<svelte:head>
  <title>{category ? `${category.name} Services` : 'Category Not Found'} | Professional Services</title>
  
  <meta name="description" content={category ? `Book ${category.name.toLowerCase()} services online. Professional service providers with instant booking, secure payments, and quality guarantee.` : 'Category not found'} />
  
  <meta name="keywords" content={category ? `${category.name.toLowerCase()}, professional ${category.name.toLowerCase()}, book ${category.name.toLowerCase()}, ${category.name.toLowerCase()} services online` : ''} />
  
  <!-- Additional SEO Meta Tags -->
  <meta name="robots" content="index, follow" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="canonical" href={`https://yoursite.com/services/${category?.slug}`} />
</svelte:head>

{#if !category}
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
    <div class="text-center p-8 max-w-md">
      <div class="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
        <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-gray-800 mb-4">Service Category Not Found</h1>
      <p class="text-gray-600 mb-8">The service category you're looking for doesn't exist or may have been moved.</p>
      <a href="/services" class="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to All Services
      </a>
    </div>
  </div>
{:else}
  <div class="mx-4 mt-2 md:mx-8 lg:mx-16">
    <div class="breadcrumbs text-sm mb-4">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/services">Services</a></li>
        <li>{category.name}</li>
      </ul>
    </div>

    <Services currentCategory={category} />
  </div>
{/if}
