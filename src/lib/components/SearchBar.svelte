<script>
  import { goto } from '$app/navigation';
  export let asButton;
</script>

<!-- Main Search Container -->
<div 
  class="relative w-full"
  onclick={asButton ? () => goto('/search') : undefined}
  style={asButton ? 'cursor:pointer;' : ''}
>
  <!-- Desktop Search -->
  <form 
    class="flex items-center w-full bg-gray-100 rounded-full overflow-hidden shadow-sm"
  >
    <input
      type="text"
      class="flex-1 px-4 py-2 md:px-6 md:py-3 bg-transparent focus:outline-none text-sm"
      placeholder="Search products and services..."
      tabindex={asButton ? -1 : 0}
    />
    
    <button 
      type="submit" 
      class="h-full px-4 py-2 md:px-6 md:py-3 bg-gray-200 hover:bg-gray-300 transition-colors"
    >

        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
  </form>

</div>
