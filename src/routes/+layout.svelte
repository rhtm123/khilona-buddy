<script>
  import "../app.css";
  // import Footer from "../lib/components/Footer.svelte"
  import Navigation from '../lib/components/Navigation.svelte';
  import NProgress from 'nprogress';
  import 'nprogress/nprogress.css';
  import { navigating, page } from "$app/stores";
  // import OrderNotification from '$lib/components/OrderNotification.svelte';
  import { PUBLIC_API_URL, PUBLIC_ESTORE_ID } from '$env/static/public';
  // import { notifications } from '$lib/stores/notifications';
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  import { PUBLIC_NM_ENV } from '$env/static/public';
  // import TestBanner from "$lib/components/TestBanner.svelte";
  import { myFetch } from "$lib/utils/myFetch";
  
  export let data; 

  let estoreData = data.estore;
  // Add this to your existing layout file
  
  $: isAdmin = $page.url.pathname.includes("admin");
  $: isSearch = $page.url.pathname.startsWith('/search');

  let Footer, AlertContainer,OrderNotificationContainer;

  onMount(async () => {
    Footer = (await import("$lib/components/Footer.svelte")).default;
    AlertContainer = (await import("$lib/components/AlertContainer.svelte")).default;
    // OrderNotificationContainer = (await import("$lib/components/OrderNotification.svelte")).default;
  });


  $: {
      if ($navigating) {
          NProgress.start();
      }
      if (!$navigating) {
          NProgress.done();
      }
  }

  // onMount(async () => {
  //   // Fetch recent orders periodically
  //   async function fetchRecentOrders() {
  //     try {
  //       const data = await myFetch(`${PUBLIC_API_URL}/order/order-items/?page=1&page_size=10&need_order_user=true`);
        
  //       // Add new notifications
  //       data.results.forEach(order => {
  //         notifications.update(n => {
  //           if (!n.find(existing => existing.id === order.id)) {
  //             return [order, ...n].slice(0, 5);
  //           }
  //           return n;
  //         });
  //       });
  //     } catch (error) {
  //       console.error('Error fetching recent orders:', error);
  //     }
  //   }

  //   // Initial fetch
  //   // fetchRecentOrders();

  //   // Set up periodic fetch (every 30 seconds)
  //   const interval = setInterval(fetchRecentOrders, 30000);

  //   return () => clearInterval(interval);
  // });
</script>

<svelte:head>
  <link rel="icon" href={estoreData?.favicon || "/favicon.png"} />
</svelte:head>



<div class="bg-base-100">
  {#if AlertContainer}
    <AlertContainer />
  {/if}

  <!-- {#if (PUBLIC_NM_ENV=="beta")}
    <TestBanner />
  {/if} -->

  {#if !isAdmin && !isSearch}
    <Navigation estore={estoreData} />
  {/if}
  
  <div class={isAdmin ? "" : "pt-16"}>
    <slot />
  </div>

  <!-- Only show notifications on home page -->
  <!-- {#if OrderNotificationContainer && $page.url.pathname === '/'}
    <OrderNotification />
  {/if} -->

  {#if !isAdmin && Footer}
    <Footer estore={estoreData} />
  {/if}
</div>
