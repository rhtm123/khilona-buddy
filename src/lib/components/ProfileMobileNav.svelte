<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  export let profile = {};
  export let menuItems = [];

  $: isProfileHome = $page.url.pathname === '/profile';
  $: currentPath = $page.url.pathname;

  function goBack() {
    goto('/profile');
  }
</script>

<!-- Mobile Navigation -->
<div class="md:hidden">
  {#if isProfileHome}
    <!-- Profile Home View -->
    <div class="space-y-4">
      <!-- User Info Card -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center space-x-4 mb-4">
          <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 class="font-medium">Hello,</h3>
            <p class="text-gray-600">{profile.first_name} {profile.last_name}</p>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="space-y-4">
          {#each menuItems as item}
            {#if item.href}
              <a
                href={item.href}
                class="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                <div class="flex items-center space-x-3">
                  {@html item.icon}
                  <span>{item.title}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </a>
            {:else if item.subItems}
              <div class="space-y-2">
                <div class="flex items-center space-x-3 p-3">
                  {@html item.icon}
                  <span class="font-medium">{item.title}</span>
                </div>
                {#each item.subItems as subItem}
                  <a
                    href={subItem.href}
                    class="flex items-center justify-between p-3 pl-12 rounded-lg bg-gray-50 hover:bg-gray-100"
                  >
                    <span>{subItem.title}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </a>
                {/each}
              </div>
            {/if}
          {/each}
        </div>
      </div>
    </div>
  {:else}
    <!-- Inner Page View -->
    <div class="bg-white">
      <div class="px-4 py-3 flex items-center space-x-4 border-b">
        <button on:click={goBack} class="text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-lg font-medium">
          {#each menuItems as item}
            {#if item.href === currentPath}
              {item.title}
            {:else if item.subItems}
              {#each item.subItems as subItem}
                {#if subItem.href === currentPath}
                  {subItem.title}
                {/if}
              {/each}
            {/if}
          {/each}
        </h1>
      </div>
    </div>
  {/if}
</div>

<!-- Content Area for Inner Pages -->
<!-- {#if !isProfileHome}
  <div class="md:hidden">
    <slot />
  </div>
{/if}  -->