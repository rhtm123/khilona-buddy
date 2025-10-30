<script>
  import { onMount } from 'svelte';

  
export let data; 

let staticPage = data.staticPage;

</script>




<svelte:head>
  <title>{staticPage?.meta_title}</title>
  <meta name="description" content={staticPage?.meta_description} />
  <meta name="keywords" content={staticPage?.meta_keywords} />

  <meta property="og:type" content="website" />
</svelte:head>

 <div class="max-w-4xl py-8 mx-auto prose prose-neutral dark:prose-invert">
    {@html staticPage.content}
  </div>