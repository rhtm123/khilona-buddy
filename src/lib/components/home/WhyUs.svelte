<script>
  const features = [
    { icon: '🛡️', title: 'Safe & Certified', desc: 'All toys are quality tested and certified' },
    { icon: '🚚', title: 'Free Delivery', desc: 'On orders above ₹299' },
    { icon: '⭐', title: 'Premium Quality', desc: 'Handpicked premium brands' },
    { icon: '↩️', title: 'Easy Returns', desc: '30‑day hassle‑free returns' },
  ];
</script>

<section class="mx-auto px-4 md:px-8 lg:px-16 py-10">
  <div class="text-center mb-8">
    <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Why <span class="text-secondary">Khilona</span> <span class="text-accent">Buddy?</span></h2>
    <p class="text-gray-600 mt-2">Your trusted partner in childhood joy</p>
  </div>

  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
    {#each features as f}
      <div class="rounded-2xl border bg-white shadow-sm p-5 text-center">
        <div class="text-2xl mb-2">{f.icon}</div>
        <div class="font-semibold text-gray-900">{f.title}</div>
        <div class="text-xs text-gray-500 mt-1">{f.desc}</div>
      </div>
    {/each}
  </div>
</section>
