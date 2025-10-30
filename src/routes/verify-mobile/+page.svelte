<script>
    import { onMount } from 'svelte';
    import { user } from '$lib/stores/auth';
    import { goto } from '$app/navigation';
    import MobileVerification from '$lib/components/MobileVerification.svelte';
    
    let userData;
    let loading = true;
    
    onMount(() => {
      const unsubscribe = user.subscribe(value => {
        userData = value;
        loading = false;
        
        // If user is not logged in, redirect to login
        if (!value) {
          goto('/login?next=/verify-mobile');
          return;
        }
        
        // If mobile is already verified, redirect to home
        if (value && value.mobile_verified) {
          goto('/');
        }
      });
      
      return () => {
        unsubscribe();
      };
    });
    
    function handleRedirect() {
      // Get the 'next' query parameter or default to home
      const urlParams = new URLSearchParams(window.location.search);
      const nextPage = urlParams.get('next') || '/';
      return nextPage;
    }
  </script>
  
  <svelte:head>
    <title>Verify Mobile | Your E-commerce Store</title>
    <meta name="description" content="Verify your mobile number to complete your account setup" />
  </svelte:head>
  
  <div class="min-h-screen bg-gradient-to-b from-base-100 to-base-200 py-12 px-4">
    <div class="max-w-4xl mx-auto">
      {#if loading}
        <div class="flex justify-center items-center h-64">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      {:else if userData && !userData.mobile_verified}
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800">One Last Step!</h1>
          <p class="text-gray-600 mt-2">Verify your mobile number to complete your account setup</p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-8 items-center">
          <div class="hidden md:block">
            <div class="bg-white p-6 rounded-xl shadow-lg">
              <div class="mb-6">
                <h3 class="text-xl font-semibold text-gray-800">Why verify your mobile?</h3>
                <ul class="mt-4 space-y-3">
                  <li class="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>Get order updates via WhatsApp</span>
                  </li>
                  <li class="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>Secure your account with 2-factor authentication</span>
                  </li>
                  <li class="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>Receive exclusive offers and promotions</span>
                  </li>
                </ul>
              </div>
              
              <div class="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div class="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 class="font-medium text-gray-800">Need help?</h4>
                    <p class="text-sm text-gray-600 mt-1">If you're having trouble verifying your mobile, please contact our support team.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <MobileVerification redirectAfterVerification={handleRedirect()} />
        </div>
      {/if}
    </div>
  </div>