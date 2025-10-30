<div class="space-y-4">
    {#each Array(3) as _}
      <div class="border rounded-lg p-4 animate-pulse">
        <div class="flex items-start space-x-4">
          <!-- Image Placeholder -->
          <div class="w-20 h-20 bg-gray-300 rounded"></div>

          <div class="flex-1 space-y-2">
            <div class="flex justify-between items-start">
              <div>
                <div class="h-4 w-48 bg-gray-300 rounded mb-2"></div>
                <div class="flex space-x-1">
                  {#each Array(5) as __}
                    <div class="w-4 h-4 bg-gray-300 rounded"></div>
                  {/each}
                </div>
              </div>
              <div class="flex space-x-2 mt-1">
                <div class="h-3 w-10 bg-gray-300 rounded"></div>
                <div class="h-3 w-12 bg-gray-300 rounded"></div>
              </div>
            </div>

            <div class="h-4 w-full bg-gray-300 rounded mt-3"></div>

            <div class="flex items-center justify-between mt-4">
              <div class="h-3 w-40 bg-gray-300 rounded"></div>
              <!-- Optional status pill placeholder -->
              <!-- <div class="h-4 w-20 bg-gray-200 rounded-full"></div> -->
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>