<script>
  export let categories;
</script>

<section class="py-8 md:py-12 mx-auto px-4 md:px-8 lg:px-16">
  <div class="mb-6 flex items-center justify-between">
    <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Shop by <span class="brand-gradient">Category</span></h2>
    <a href="/shop" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow border border-secondary/30 text-primary font-bold hover:bg-base-100">
      <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z"/></svg>
      View All
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
    </a>
  </div>

  <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6">
    {#each categories as category}
      <a href={"/shop/" + category.slug} class="flex flex-col items-center gap-2 p-3 rounded-xl border bg-white hover:border-secondary/40 transition-colors shadow-sm">
        <div class="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
          <img src={category.image || '/placeholder.svg'} alt={category.name} class="w-7 h-7 object-contain" loading="lazy" />
        </div>
        <span class="text-xs md:text-sm text-gray-700 text-center font-medium">{category.name}</span>
      </a>
    {/each}
  </div>
  <div class="mt-6 flex justify-center">
    <a href="/shop" class="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white shadow border border-secondary/30 text-primary font-bold hover:bg-base-100">
      <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z"/></svg>
      View All
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
    </a>
  </div>
</section>
