<div class="space-y-2">
    {#each Array(2) as __}
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 bg-gray-300 rounded"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3 bg-gray-300 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    {/each}
  </div>