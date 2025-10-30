<script>
  import { page } from '$app/stores';
  import { user } from "$lib/stores/auth";
  import { PUBLIC_API_URL } from "$env/static/public";
  import { myFetch } from "$lib/utils/myFetch";
  import { onDestroy, onMount } from "svelte";
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

    import LeftNav from "$lib/components/admin/LeftNav.svelte";

  let authUser;
  let isLoading = true;

  $: if (browser && authUser === null && !isLoading) {
    goto(`/login?next=${encodeURIComponent($page.url.pathname)}`);
  }

  $: authUser = $user;

  onMount(async () => {
    if (!authUser) {
      if (browser) {
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
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p>Loading profile...</p>
    </div>
  </div>
{:else}

    {#if authUser?.entity?.entity_type=="seller"}

        <div class="min-h-screen bg-gray-50">

            <LeftNav />

            <main class="ml-64 p-8">

                <slot />

            </main>

        </div>
    {:else}
        <p class="p-8">
            You are not allowed to access this page
            Go to <a href="/" class="text-primary">Home Page</a>

        </p>
    {/if}


{/if}

<style>
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>