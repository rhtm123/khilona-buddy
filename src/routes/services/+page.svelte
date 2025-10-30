<script>
  import Services from '$lib/components/Services.svelte';
</script>

<svelte:head>
  <title>Professional Services | Book Expert Services Online</title>
  
  <meta name="description" content="Book professional services online. From home cleaning to grooming, repairs to pet care - find trusted service providers with instant booking and secure payments." />
  
  <meta name="keywords" content="professional services, home services, online booking, service providers, home cleaning, grooming services, repairs, pet care, trusted professionals" />

  <!-- Open Graph Tags -->
  <meta property="og:title" content="Professional Services | Book Expert Services Online" />
  <meta property="og:description" content="Book professional services online with trusted providers. Instant booking, secure payments, and quality guarantee." />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Professional Services" />

  <!-- Additional SEO Meta Tags -->
  <meta name="robots" content="index, follow" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="canonical" href="https://yoursite.com/services" />
</svelte:head>

<div class="mx-4 mt-2 md:mx-8 lg:mx-16">
  <div class="breadcrumbs text-sm">
    <ul>
      <li><a href="/">Home</a></li>
      <li>Services</li>
    </ul>
  </div>

  <Services />
</div>
