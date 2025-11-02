<script>
  import { onMount } from 'svelte';
  import { afterNavigate, goto } from '$app/navigation';
  import InitialsAvatar from '$lib/components/InitialsAvatar.svelte';
  import { cart } from '../stores/cart';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import { user } from '$lib/stores/auth';
  import { logoutUser } from '$lib/stores/auth';
  import Icon from '@iconify/svelte';
  import { page } from '$app/stores';
  import CartBar from '$lib/components/CartBar.svelte';

  let authUser = null;
  let isMenuOpen = false;
  let isProfileDropdownOpen = false;

  export let estore;



  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Blog', href: '/blog' }
  ];

  $: authUser = $user;

  function clickOutside(node) {
    const handleClick = (event) => {
      if (node && !node.contains(event.target) && !event.defaultPrevented) {
        node.dispatchEvent(new CustomEvent('outclick'));
      }
    };
    document.addEventListener('click', handleClick, true);
    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    };
  }

  afterNavigate(() => {
    isMenuOpen = false;
    isProfileDropdownOpen = false;
  });

  onMount(() => {
    isMenuOpen = false;
    isProfileDropdownOpen = false;
  });

  function toggleProfileDropdown(event) {
    event.stopPropagation();
    isProfileDropdownOpen = !isProfileDropdownOpen;
    isMenuOpen = false;
  }

  function toggleMenuDropdown(event) {
    event.stopPropagation();
    isMenuOpen = !isMenuOpen;
    isProfileDropdownOpen = false;
  }


  function handleLogout() {
    logoutUser();
    isProfileDropdownOpen = false;
  }

  function handleNavClickOutside() {
    isMenuOpen = false;
    isProfileDropdownOpen = false;
  }

  function handleSearchClick() {
    goto('/search');
  }
</script>

<nav 
  use:clickOutside
  on:outclick={handleNavClickOutside}
  class="bg-white/95 backdrop-blur-md border-b border-secondary/20 fixed top-0 w-full z-20 shadow-lg"
>

    <!-- Modern Navbar -->
    <div class="mx-auto px-4 md:px-8 lg:px-16">
      <div class="flex items-center justify-between h-18">
        <!-- Left Section - Enhanced Logo -->
        <div class="flex items-center">
          <a href="/" class="md:hidden flex-shrink-0 transform hover:scale-105 transition-transform">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                </svg>
              </div>
              <span class="font-bold text-gray-900 text-lg">KhillonaBuddy</span>
            </div>
          </a>
          <a href="/" class="hidden md:block flex-shrink-0 transform hover:scale-105 transition-transform">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                </svg>
              </div>
              <div>
                <h1 class="font-bold text-xl text-gray-900">KhillonaBuddy</h1>
                <p class="text-xs text-secondary font-medium">Fun Learning Toys</p>
              </div>
            </div>
          </a>
        </div>

        <!-- Center Section - Search Bar -->
        <div class="flex-1 max-w-3xl mx-8 hidden md:block">
          <SearchBar asButton={true} />
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-2">
          <!-- Mobile Search Button -->
          <button
            class="md:hidden p-2 rounded-full hover:bg-gray-100"
            on:click={handleSearchClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <!-- Profile -->
          {#if authUser}
            <div
              class="relative profile-dropdown-wrapper"
              use:clickOutside
              on:outclick={() => isProfileDropdownOpen = false}
            >
              <button
                on:click={toggleProfileDropdown}
                class="p-2 rounded-full hover:bg-gray-100"
              >
                <InitialsAvatar
                  firstName={authUser.first_name}
                  lastName={authUser.last_name}
                  size="8"
                />
              </button>
              {#if isProfileDropdownOpen}
                <div class="absolute profile-dropdown-content right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-100 md:w-48 max-w-[90vw] md:max-w-none">
                  <a 
                    on:click={() => isProfileDropdownOpen = false} 
                    href="/profile/orders" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Orders
                  </a>
                  <a 
                    on:click={() => isProfileDropdownOpen = false} 
                    href="/profile/wishlist" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Wishlist
                  </a>
                  <a 
                    on:click={() => isProfileDropdownOpen = false} 
                    href="/profile/settings" 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </a>
                  <div class="border-t my-2"></div>
                  <button 
                    on:click={handleLogout} 
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              {/if}
            </div>
          {:else}
            <a href="/login" class="flex items-center gap-1 p-2 rounded-full text-gray-700 hover:text-secondary">
              <Icon icon="mdi:account-outline" width="24" height="24" />
              <span class="text-sm font-medium hidden md:inline">Sign Up/Sign In</span>
            </a>
          {/if}

          <!-- Cart -->

          <CartBar />
          
          <!-- Mobile Menu Button -->
          <!-- <button 
            class="p-2 rounded-full hover:bg-gray-100 md:hidden"
            on:click={toggleMenuDropdown}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button> -->
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    {#if isMenuOpen}
      <div class="bg-white border-t">
        <div class="px-2 pt-2 pb-3 space-y-1">
          {#each menuItems as item}
            <a 
              on:click={() => isMenuOpen = false} 
              href={item.href} 
              class="block px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              {item.label}
            </a>
          {/each}
        </div>
      </div>
    {/if}
</nav>


<style>
  /* Ensure dropdown is fully visible in mobile view */
  @media (max-width: 768px) {
    .profile-dropdown-wrapper {
      position: static;
    }
    .profile-dropdown-content {
      position: fixed;
      top: 4rem; /* Height of the navbar (h-16) */
      left: 0;
      right: 0;
      width: 100%;
      max-width: 100%;
      margin: 0;
      border-radius: 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  }
</style>