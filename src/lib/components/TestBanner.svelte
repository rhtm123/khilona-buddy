<script>
    import { onMount } from "svelte";
  
    let showBanner = true;
    let intervalId = null;

    function startBannerTimer() {
        // Clear any existing interval
        if (intervalId) {
            clearInterval(intervalId);
        }
        
        // Set up interval to show banner every minute
        intervalId = setInterval(() => {
            showBanner = true;
        }, 120000);
    }

    onMount(() => {
        // Start with banner visible and begin the timer cycle
        startBannerTimer();
        
        // Cleanup interval when component unmounts
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    });

    function closeBanner() {
        showBanner = false;
        startBannerTimer(); // Restart timer when banner is closed
    }
</script>

{#if showBanner}
    <div class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div class="bg-red-600 text-white p-4 rounded-lg shadow-lg w-96 text-center">
            <p class="font-semibold">
                🚧 Our website is in beta testing. Orders placed now will not be delivered. 🚧
            </p>
            <button 
                on:click={closeBanner} 
                class="mt-3 bg-white text-red-600 px-4 py-2 rounded-md font-semibold hover:bg-gray-200"
            >
                Close
            </button>
        </div>
    </div>
{/if}