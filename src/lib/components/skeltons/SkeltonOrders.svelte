<script>
    import SkeltonOrderItems from "./SkeltonOrderItems.svelte";
</script>

<div class="space-y-4">
    {#each Array(3) as _}
      <div class="border rounded-lg bg-white p-4 animate-pulse space-y-4">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="h-4 bg-gray-300 rounded w-32"></div>
          <div class="h-8 bg-gray-200 rounded w-28"></div>
        </div>

        <!-- OrderItems Placeholder -->
        
        <SkeltonOrderItems />
        <!-- Footer -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t pt-4">
          <div class="h-8 bg-gray-200 rounded w-32"></div>
          <div class="w-full sm:w-auto space-y-2">
            <div class="h-3 bg-gray-300 rounded w-64"></div>
            <div class="h-3 bg-gray-200 rounded w-40"></div>
            <div class="h-4 bg-gray-300 rounded w-28"></div>
          </div>
        </div>
      </div>
    {/each}
  </div>