<div class="grid  grid-cols-1 md:grid-cols-2 gap-8 mb-12 py-4">

    {#each Array(4) as _}
      <div class="animate-pulse bg-white p-4 rounded-lg border border-gray-200">
        <div class="h-40 bg-gray-300 rounded mb-4"></div>
        <div class="h-4 bg-gray-300 rounded w-1/12 mb-2"></div>
        <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    {/each}
</div>