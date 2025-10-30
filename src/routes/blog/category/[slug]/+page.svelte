
<script>
  import { page } from '$app/stores';
  import { fade, fly } from 'svelte/transition';
  import Sidebar from '$lib/components/blog/Sidebar.svelte';
  import Blogs from '$lib/components/blog/Blogs.svelte';
  export let data; 


  import NotFound from "$lib/components/error/NotFound.svelte";


  // console.log(data);

  $: category = data?.category;
  
  // $: category = blogData.categories.find(c => c.slug === $page.params.slug);
  // $: posts = blogData.posts.filter(post => post.category === $page.params.slug);
</script>

<svelte.head>
  <title>Category: {category?.name} - Blogs</title>
  <meta property="og:type" content="website" />
</svelte.head>


{#if data?.error}
  <NotFound />
{:else}



<!-- Category Header Banner -->

  <div class="text-sm breadcrumbs text-gray-600">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/blog">Blog</a></li>
        <li>Category : {category?.name}</li>
    </ul>

  <!-- <div class="container text-black mx-auto px-4 py-16">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-bold mb-2">POSTS TAGGED "{category?.name}"</h1>
        <div class="flex items-center gap-2">
          <a href="/" class="text-gray-600 hover:text-primary">Home</a>
          <span class="text-gray-400">/</span>
          <a href="/blog" class="text-gray-600 hover:text-primary">Blog</a>
          <span class="text-gray-400">/</span>
          <span class="text-primary">{category?.name}</span>
        </div>
      </div>
    </div>
  </div> -->
</div>

<Blogs category_id={category.id} />

{/if}