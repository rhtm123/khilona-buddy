<script>


  import { page } from '$app/stores';
  import { user } from "$lib/stores/auth";
  import { onDestroy, onMount } from "svelte";
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  let isLoading = true;

  $: authUser = $user;

  onMount(async () => {
    if (!authUser) {
      if (browser) {
        console.log("redirect")
        goto(`/login?next=${encodeURIComponent($page.url.pathname)}`);
      }
      return;
    }
    isLoading = false;
  });
</script>

{#if isLoading}
  <div class="min-h-screen flex items-center justify-center">
    <div class="flex flex-col items-center gap-4">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      <p>Loading ...</p>
    </div>
  </div>
{:else}

  <slot />
{/if}