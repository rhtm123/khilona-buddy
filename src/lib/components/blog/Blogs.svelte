<script>
    export let category_id="";
    export let tag_id=""; 

    import { onMount } from "svelte";
    import { myFetch } from "$lib/utils/myFetch";
    import { PUBLIC_API_URL } from "$env/static/public";
    import { PUBLIC_ESTORE_ID } from "$env/static/public";

    let loading = true;
    let blogs = []; 
    let next;

    import BlogCard from "./BlogCard.svelte";
    import SkeltonBlogs from "../skeltons/SkeltonBlogs.svelte";

    async function fetchBlogs() {
        try{
        loading = true;
        let url = `${PUBLIC_API_URL}/blog/blogs?estore_id=${PUBLIC_ESTORE_ID}${category_id?`&category_id=${category_id}`:""}${tag_id?`&tag_id=${tag_id}`:""}`
        let data = await myFetch(url);
        blogs = data.results;
        // console.log(data);
        next = data.next;

        } catch (e) {
            console.log(e);
        } finally {
            loading = false;
        }
    }

    onMount(()=>{
        fetchBlogs();
    })

    
    $: if (category_id || tag_id) {
        fetchBlogs();
     }

     function loadMore() {

     }


</script>

  

  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">

    {#each blogs as blog (blog.id)}

      <BlogCard blog={blog} />
    {/each}

    {#if (blogs.length==0 && !loading)}

    <div class="text-center py-12">
        <h2 class="text-2xl font-bold mb-4">No posts found</h2>
        <p class="text-gray-600">There are no posts.</p>
      </div>
    {/if}

    <div class="flex space-x-2">
        {#if (next && !loading)}
        <button on:click={loadMore} class="px-3 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200">
            Load More
        </button>
        {/if}
    </div>
  </div>

  {#if loading}
      <SkeltonBlogs />
  {/if}



