<script>
  import { fade, fly } from 'svelte/transition';

  

  import Blogs from '$lib/components/blog/Blogs.svelte';
  export let data;

  let page = data.staticPage;

</script>

<svelte:head>
  <title>{page?.meta_title || 'Blog'}</title>
  <meta name="description" content={page?.meta_description || 'Latest blog posts and articles'} />
</svelte:head>



<!-- Blog Header Banner -->
<div class="">
  <div class="text-sm breadcrumbs text-gray-600">
    <ul>
        <li><a href="/">Home</a></li>
        <li>Blog</li>
      </ul>
</div>



      <!-- Blog Posts Grid -->
      <Blogs />

</div>