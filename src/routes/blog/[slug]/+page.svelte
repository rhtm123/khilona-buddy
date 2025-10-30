<script>
  // import { page } from '$app/stores';
  // import Comments from '$lib/components/Comments.svelte';

  import InitialsAvatar from "$lib/components/InitialsAvatar.svelte";

  export let data; 

  // console.log(data);

  $: post = data.blog;
  // console.log(data);
  $: category = data.blog?.category;


</script>

<svelte:head>
  <title>{post?.seo_title || 'Blog Post'}</title>
  <meta name="description" content={post?.seo_description || 'Read our latest blog post'} />
  <meta property="og:title" content={post?.seo_title || 'Blog Post'} />
  <meta property="og:description" content={post?.seo_description || 'Read our latest blog post'} />
  <meta property="og:type" content="article" />
</svelte:head>

{#if post}

<div class="text-sm breadcrumbs text-gray-600">

  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/blog">Blog</a></li>
    <li>Blog: {post.title}</li>
  </ul>

</div>


  <article class="mx-auto">
    <!-- Header -->
    <header class="mb-8">
      
      <h1 class="text-4xl font-bold py-4">{post.title}</h1>

      <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
        
        <span>{post.read_time} Min</span>
        <span>•</span>
        <span>{new Date(post.created).toLocaleDateString()}</span>
      </div>

      <div class="flex items-center gap-4">
        
        <InitialsAvatar 
                firstName={post.author?.first_name} 
                lastName={post.author?.last_name}
                size="10"
              />
        <div>
          

          <div class="font-medium">{post.author?.first_name} {post.author?.last_name}</div>
          <div class="text-sm text-gray-600">Author</div>
        </div>
      </div>
    </header>

    <!-- Featured Image -->
    <img 
      src={post.img} 
      alt={post.title}
      class="w-full h-[400px] object-cover rounded-lg mb-8"
    />

    <!-- Content -->
    <div class="prose max-w-none">
      {@html post.content}
    </div>

    <!-- Tags -->
    <div class="mt-8">
      <div class="flex flex-wrap gap-2">
        {#each post.tags as tag}
          <a 
            href={`/blog/tag/${tag.slug}`}
            class="badge badge-outline hover:badge-primary transition-colors"
          >
            {tag.name}
          </a>
        {/each}
      </div>
    </div>

    <!-- Comments Section -->
    <!-- <Comments comments={post.comments} /> -->
  </article>
{:else}
  <div class="container mx-auto px-4 py-8 text-center">
    <h1 class="text-2xl font-bold">Post not found</h1>
  </div>
{/if} 