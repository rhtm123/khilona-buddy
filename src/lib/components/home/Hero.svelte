<script>
  import { goto } from '$app/navigation';
  export let slides = [];

  import { onMount } from 'svelte';
  const phrases = ['Khilona Buddy', 'Joy & Play', 'Premium Toys', 'Creative Fun'];
  let typedText = '';
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const typeSpeed = 70;
  const deleteSpeed = 40;
  const holdDelay = 1200;

  let timer;
  function tick() {
    const current = phrases[phraseIndex];
    if (!deleting) {
      typedText = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        deleting = true;
        timer = setTimeout(tick, holdDelay);
        return;
      }
      timer = setTimeout(tick, typeSpeed);
    } else {
      typedText = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
      timer = setTimeout(tick, deleteSpeed);
    }
  }

  onMount(() => {
    tick();
    return () => clearTimeout(timer);
  });

  // Navigate helpers
  function shopNow() { goto('/shop'); }
  function viewDeals() { goto('/shop?ordering=-popularity'); }
</script>

<section class="relative overflow-hidden">
  <!-- Full-bleed soft hero background with toys illustration -->
  <div class="relative w-full min-h-[420px] md:min-h-[520px] lg:min-h-[600px]">
    <div class="relative z-10 mx-auto px-4 md:px-8 lg:px-16 pt-12 md:pt-16 pb-24 md:pb-32">
      <div class="max-w-7xl">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur rounded-full text-xs font-semibold text-gray-700 border border-gray-200 shadow-sm animate-on-scroll">
          <span>⚡ AI‑Powered Toy Discovery</span>
        </div>
        <h1 class="mt-4 text-3xl md:text-5xl font-extrabold leading-tight text-gray-900 animate-on-scroll flex items-baseline gap-2">
          <span>Welcome to</span>
          <span class="brand-gradient typewriter caret">{typedText}</span>
        </h1>
        <p class="mt-3 text-gray-600 max-w-2xl animate-on-scroll">
          Your world of joy & play! Discover premium toys that inspire creativity and endless fun.
        </p>
        <div class="mt-6 flex items-center gap-3 animate-on-scroll">
          <button class="px-6 py-3 rounded-full bg-primary text-white font-bold shadow-md hover:bg-primary/90" on:click={shopNow}>
            Shop Now
          </button>
          <button class="px-6 py-3 rounded-full bg-white text-secondary font-bold shadow border border-secondary/30 hover:bg-base-100" on:click={viewDeals}>
            View Hot Deals
          </button>
        </div>
      </div>
    </div>

    <!-- Background image + subtle gradient overlay (brand bases only) -->
    <div class="absolute inset-0 -z-10" style="background-image: linear-gradient(90deg, rgba(255,248,231,0.92), rgba(224,242,255,0.8), rgba(230,255,245,0.92)), url('/img/image.png'); background-size: cover; background-position: center;"></div>
  </div>

  <!-- Wavy bottom divider -->
  <div class="pointer-events-none absolute bottom-0 left-0 right-0 z-0" aria-hidden>
    <svg viewBox="0 0 1440 120" width="100%" height="140" preserveAspectRatio="none">
      <path d="M0,32 C240,96 480,0 720,32 C960,64 1200,128 1440,64 L1440,120 L0,120 Z" fill="var(--color-base-100)"></path>
    </svg>
  </div>
</section>
