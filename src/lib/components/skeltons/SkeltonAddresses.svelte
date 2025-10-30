
<div class="space-y-2">
{#each Array(2) as _, i}
    <div class="border rounded-lg p-4 relative animate-pulse space-y-3">

      <div class="flex justify-between items-start">
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <div class="h-4 w-24 bg-gray-300 rounded"></div>
            <div class="h-3 w-12 bg-gray-300 rounded"></div>
          </div>
          <div class="h-3 w-48 bg-gray-300 rounded"></div>
          <div class="h-3 w-40 bg-gray-300 rounded"></div>
        </div>

        <div class="flex space-x-4 mt-2">
          <div class="h-4 w-10 bg-gray-300 rounded"></div>
          <div class="h-4 w-12 bg-gray-300 rounded"></div>
        </div>
      </div>

      <div class="h-4 w-24 bg-gray-300 rounded mt-2"></div>
    </div>
  {/each}

</div>