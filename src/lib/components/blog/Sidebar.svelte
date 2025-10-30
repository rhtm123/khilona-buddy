<script>
  

  import { fade, fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { myFetch } from '$lib/utils/myFetch';


  export let tags;
  // let loadingTags = false;
  // async function fetchTags() {
  //   loadingTags = true
  //   try{
  //   let url = `${PUBLIC_API_URL}/blog/tags?ordering=-id`;
  //   let data = await myFetch(url);
  //   tags = data.results;
  //   } catch (e) {
  //   } finally {
  //       loadingTags = false;
  //   }
  // }

  export let blogs;

  // let loadingBlogs = true

  // async function fetchLatestBlogs() {
  //   loadingBlogs = true
  //   try{
  //   let url = `${PUBLIC_API_URL}/blog/blogs?page_size=5&ordering=-id`;
  //   let data = await myFetch(url);
  //   blogs = data.results;
  //   } catch (e) {
  //   } finally {
  //       loadingBlogs = false;
  //   }
  // }

  export let categories;
  let loadingCategories = false

  // async function fetchCategories() { 
  //   loadingCategories = true
  //   try{
  //   let url = `${PUBLIC_API_URL}/product/categories/?has_blogs=true`;
  //   let data = await myFetch(url);
  //   categories = data.results;
  //   } catch (e) {
  //   } finally {
  //       loadingCategories = false;
  //   }
  // }

  onMount(()=>{
    // fetchLatestBlogs();
    // fetchTags();
    // fetchCategories();
  })
  
  // let searchQuery = '';
  // $: filteredPosts = blogData.posts.filter(post => 
  //   post.title.toLowerCase().includes(searchQuery.toLowerCase())
  // );

</script>

<!-- Search Section -->
<!-- <div class="mb-8">
    <h2 class="text-xl font-semibold mb-4">SEARCH</h2>
    <div class="form-control">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search..."
        class="input input-bordered w-full bg-white focus:outline-none focus:border-primary"
      />
    </div>
  </div> -->

  <!-- Categories -->
  <div class="mb-8">
    <h2 class="text-xl font-semibold mb-2">CATEGORIES</h2>
    <div class="flex flex-col gap-0">
      {#each categories as category}
        <a 
          href={`/blog/category/${category.slug}`}
          class="flex items-center justify-between py-2 hover:bg-gray-50 rounded transition-colors"
        >
          <span>{category.name}</span>
        </a>
      {/each}


    </div>
  </div>

  <!-- Latest Posts -->
  <div class="mb-8">
    <h2 class="text-xl font-semibold mb-4">LATEST POST</h2>
    <div class="flex flex-col gap-4">

      
      {#each blogs as post}
        <a 
          href={`/blog/${post.slug}`} 
          class="flex gap-4 group"
          in:fade
        >
          <img src={post.img} alt={post.title} class="w-24 h-24 object-cover rounded" />
          <div>
            <h3 class="font-semibold group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p class="text-sm text-gray-500">{new Date(post.created).toLocaleDateString()}</p>
          </div>
        </a>
      {/each}


    </div>
  </div>

  <!-- Tags -->
  <div class="mb-8">
    <h2 class="text-xl font-semibold mb-4">TAGS</h2>
    <div class="flex flex-wrap gap-2">
      {#each tags as tag}
        <a 
          href={`/blog/tag/${tag.slug}`}
          class="px-4 py-2 bg-gray-100 hover:bg-primary   transition-colors rounded-full text-sm"
        >
          {tag.name}
        </a>
      {/each}

    </div>
  </div>