
<script>

export let data; 

let tags = data.tags;
let recentBlogs = data.recentBlogs;
let blogCategories = data.blogCategories;

import Sidebar from '$lib/components/blog/Sidebar.svelte';

</script>


<div class="mx-auto py-2 px-4 md:px-8 lg:px-16">
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Main Content -->
      <div class="lg:w-2/3">
        <!-- Blog Posts Grid -->
        <slot />
      </div>
  
      <!-- Sidebar -->
      <div class="lg:w-1/3 my-4">
        <Sidebar tags={tags} categories={blogCategories} blogs={recentBlogs} />
      </div>
    </div>
  </div>