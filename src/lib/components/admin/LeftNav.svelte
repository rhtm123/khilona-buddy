<script>
     import { goto } from "$app/navigation";

     import { page } from '$app/stores';
     import { logoutUser } from "$lib/stores/auth";
     import { user } from "$lib/stores/auth";
     import { onMount, onDestroy } from "svelte";


    let authUser;

    const unsubscribe = user.subscribe(value => {
      authUser = value;
    });

    onDestroy(() => {
      unsubscribe(); // Cleanup to avoid memory leaks
    });

     const logout = () => {
        logoutUser()
        // Add your logout logic here
        // alert('Logout clicked');
    };



    const user1 = {
        name: authUser?.first_name + " " + authUser?.last_name,
        email: authUser?.email
    };

    let activePage = $page.url.pathname;

    $: if (page) {
        activePage = $page.url.pathname;
    }

</script>
<aside class="fixed left-0 top-0 h-full w-64 bg-white shadow-lg flex flex-col">
    <div class="p-6">
        <h2 class="text-xl font-bold text-gray-800">Seller Admin</h2>
    </div>
    
    <nav class="mt-4 flex-1">
        <ul class="space-y-2 px-4">
            <li>
                <button
                    class={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${activePage === '/admin' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    on:click={() => goto("/admin")}
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Analytics</span>
                </button>
            </li>
            <li>
                <button
                    class={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${activePage === '/admin/inventory' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    on:click={() => goto("/admin/inventory")}
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span>Inventory</span>
                </button>
            </li>
            <li>
                <button
                    class={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${activePage === '/admin/orders' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    on:click={() => goto("/admin/orders")}
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Orders</span>
                </button>
            </li>
        </ul>
    </nav>

    <!-- User Profile & Logout -->
    <div class="p-4 border-t">
        <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                {authUser?.first_name[0]+ authUser?.last_name[0]}
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium text-gray-700">{user1.name}</p>
                <p class="text-xs text-gray-500">{user1.email}</p>
            </div>
        </div>
        <button 
            on:click={logout}
            class="w-full mt-4 flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
        >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log Out</span>
        </button>
    </div>
</aside>