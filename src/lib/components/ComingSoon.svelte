<script>
    import { onMount } from 'svelte';
    
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    
    // Set your launch date here
    const launchDate = new Date('2025-03-15T00:00:00');
    
    function updateCountdown() {
      const now = new Date();
      const difference = launchDate - now;
      
      days = Math.floor(difference / (1000 * 60 * 60 * 24));
      hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      seconds = Math.floor((difference % (1000 * 60)) / 1000);
    }
    
    let email = '';
    
    function handleSubscribe() {
      // Handle newsletter subscription
      console.log('Subscribed:', email);
      email = '';
    }
    
    onMount(() => {
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    });
  </script>
  
  <div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
    <div class="relative w-full">
      <!-- Floating Toys Animation -->
      <div class="absolute inset-0 overflow-hidden">
        {#each Array(10) as _, i}
          <div
            class="absolute animate-float"
            style="
              top: {Math.random() * 100}%;
              left: {Math.random() * 100}%;
              animation-delay: {i * 0.5}s;
              animation-duration: {5 + Math.random() * 5}s;
            "
          >
            <i class="text-white opacity-20 text-2xl fas {[
              'fa-rocket',
              'fa-gamepad',
              'fa-robot',
              'fa-puzzle-piece',
              'fa-teddy-bear'
            ][Math.floor(Math.random() * 5)]}"></i>
          </div>
        {/each}
      </div>
  
      <div class="container mx-auto px-4 text-center relative z-10">
        <!-- Logo -->
        <div class="mb-8 animate-bounce">
          <img
            src="https://www.freepnglogos.com/uploads/logo-home-png/-blue-logo-house-png-20.png"
            alt="Toy Store Logo"
            class="h-24 mx-auto"
          />
        </div>
  
        <!-- Main Content -->
        <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
          Something Exciting
          <span class="text-pink-500">Is Coming Soon!</span>
        </h1>
  
        <p class="text-xl text-gray-300 mb-12 max-w-2xl mx-auto animate-fade-in-delay">
          Your local digital marketplace is coming soon! Stay tuned for an exciting shopping experience.
        </p>
  
        <!-- Countdown Timer -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-3xl mx-auto">
          {#each [
            { value: days, label: 'Days' },
            { value: hours, label: 'Hours' },
            { value: minutes, label: 'Minutes' },
            { value: seconds, label: 'Seconds' }
          ] as { value, label }}
            <div class="bg-white/10 backdrop-blur-lg rounded-lg p-4 animate-scale-in">
              <div class="text-4xl md:text-6xl font-bold text-white mb-2">
                {value}
              </div>
              <div class="text-gray-300 text-sm uppercase tracking-wide">
                {label}
              </div>
            </div>
          {/each}
        </div>
  
        <!-- Newsletter Signup -->
        <!-- <div class="max-w-md mx-auto animate-fade-in-up">
          <form 
            on:submit|preventDefault={handleSubscribe}
            class="flex gap-2"
          >
            <input
              type="email"
              bind:value={email}
              placeholder="Enter your email for updates"
              class="flex-1 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-lg text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:border-pink-500"
            />
            <button
              type="submit"
              class="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transform hover:scale-105 transition-all"
            >
              Notify Me
            </button>
          </form>
        </div> -->
  
        <!-- Social Links -->
        <div class="mt-12 flex justify-center gap-6 animate-fade-in-up">
          {#each ['facebook', 'twitter', 'instagram', 'youtube'] as social}
            <a
              href="#{social}"
              class="text-white/60 hover:text-white hover:scale-110 transform transition-all"
            >
              <i class="fab fa-{social} text-2xl"></i>
            </a>
          {/each}
        </div>
      </div>
    </div>
  </div>
  
  <style>
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
  
    .animate-float {
      animation: float linear infinite;
    }
  
    .animate-fade-in {
      animation: fadeIn 1s ease-out;
    }
  
    .animate-fade-in-delay {
      animation: fadeIn 1s ease-out 0.5s both;
    }
  
    .animate-fade-in-up {
      animation: fadeInUp 1s ease-out 1s both;
    }
  
    .animate-scale-in {
      animation: scaleIn 0.5s ease-out both;
    }
  
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  </style>