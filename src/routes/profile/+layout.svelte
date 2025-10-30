<script>
  import { page } from '$app/stores';
  import { user } from "$lib/stores/auth";
  import { PUBLIC_API_URL } from "$env/static/public";
  import { myFetch } from "$lib/utils/myFetch";
  import InitialsAvatar from '$lib/components/InitialsAvatar.svelte';
  import { onDestroy, onMount } from "svelte";
  import ProfileMobileNav from '$lib/components/ProfileMobileNav.svelte';
  import { productApi } from '$lib/services/productApi';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  let authUser;
  let isLoading = true;

  $: if (browser && authUser === null && !isLoading) {
    goto(`/login?next=${encodeURIComponent($page.url.pathname)}`);
  }

  $: authUser = $user;

  let profile = {
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    gender: '',
  };

  onMount(async () => {
    if (!authUser) {
      if (browser) {
        goto(`/login?next=${encodeURIComponent($page.url.pathname)}`);
      }
      return;
    }
    isLoading = false;
  });

  $: if (authUser) {
    profile = {
      first_name: authUser?.first_name,
      last_name: authUser?.last_name,
      email: authUser?.email,
      mobile: authUser?.mobile,
      gender: authUser?.gender,
      google_picture: authUser?.google_picture
    };
  }

  const menuItems = [
    {
      title: 'MY ORDERS',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>`,
      href: '/profile/orders'
    },
    {
      title: 'ACCOUNT SETTINGS',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>`,
      subItems: [
        { title: 'Profile Information', href: '/profile/settings' },
        { title: 'Manage Addresses', href: '/profile/addresses' }
      ]
    },
    {
      title: 'MY STUFF',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>`,
      subItems: [
        { title: 'My Reviews & Ratings', href: '/profile/reviews' },
        { title: 'My Wishlist', href: '/profile/wishlist' }
      ]
    }
  ];

  $: currentPath = $page.url.pathname;
</script>

{#if isLoading}
  <div class="min-h-screen flex items-center justify-center">
    <div class="flex flex-col items-center gap-4">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p>Loading profile...</p>
    </div>
  </div>
{:else}
  <div class="min-h-screen">
    <!-- Remove px-4 md:px-8 lg:px-16 for mobile, keep for desktop -->
    <div class="py-4 md:py-8 md:px-8 lg:px-16">
      <!-- Mobile Navigation with slot -->
      <ProfileMobileNav {profile} {menuItems}>
        <slot />
      </ProfileMobileNav>

      <div class="md:grid md:grid-cols-4 gap-8">
        <!-- Sidebar -->
        <div class="md:col-span-1">
          <div class="hidden md:block">
            <div class="bg-white rounded-lg shadow p-6">
              <!-- User Info -->
              <div class="flex items-center space-x-4 mb-6 pb-6 border-b">
                <div class="w-12 h-12 rounded-full flex items-center justify-center">
                  {#if profile.google_picture}
                    <img 
                      src={profile.google_picture}
                      alt="User profile"
                      class="h-12 w-12 rounded-full"
                    />
                  {:else}
                    <InitialsAvatar 
                      firstName={authUser.first_name} 
                      lastName={authUser.last_name}
                      size="12"
                    />
                  {/if}
                </div>
                <div>
                  <h3 class="font-medium">Hello,</h3>
                  <p class="text-gray-600">{authUser.first_name} {authUser.last_name}</p>
                </div>
              </div>

              <!-- Navigation -->
              <nav class="space-y-2">
                {#each menuItems as item}
                  <div class="space-y-2">
                    {#if item.href}
                      <a
                        href={item.href}
                        class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 {currentPath.includes(item.href)? 'text-primary bg-base-200' : 'text-gray-700'}"
                      >
                        {@html item.icon}
                        <span>{item.title}</span>
                      </a>
                    {:else}
                      <div class="flex items-center space-x-2 p-2 text-gray-700">
                        {@html item.icon}
                        <span>{item.title}</span>
                      </div>
                      {#if item.subItems}
                        <div class="ml-8 space-y-2">
                          {#each item.subItems as subItem}
                            <a
                              href={subItem.href}
                              class="block p-2 rounded-lg hover:bg-gray-100 {currentPath.includes(subItem.href) ? 'text-primary bg-base-200' : 'text-gray-700'}"
                            >
                              {subItem.title}
                            </a>
                          {/each}
                        </div>
                      {/if}
                    {/if}
                  </div>
                {/each}

                <!-- Logout -->
                <button
                  class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 text-gray-700 w-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="md:col-span-3">
          <div class="bg-white rounded-lg shadow md:p-6 p-4">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </div>
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