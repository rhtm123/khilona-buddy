<script>
  import { notifications } from '$lib/stores/notifications';
  import { fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import InitialsAvatar from './InitialsAvatar.svelte';
  import { goto } from '$app/navigation';

  let currentIndex = 0;
  let visible = true;

  function removeNotification(id) {
    notifications.update(n => n.filter(notification => notification.id !== id));
  }

  function handleProductClick(slug) {
    goto(`/product/${slug}`);
  }

  function getRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  }

  // Auto-rotate notifications every 5 seconds
  onMount(() => {
    const interval = setInterval(() => {
      if ($notifications.length > 0) {
        if (currentIndex >= $notifications.length - 1) {
          currentIndex = 0;
        } else {
          currentIndex++;
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  });
</script>

<div class="fixed bottom-4 left-4 z-50">
  {#if $notifications[currentIndex] && visible}
    <div
      transition:fly={{ y: 40, duration: 400 }}
      class="bg-white rounded-lg shadow-lg p-4 max-w-sm relative"
    >
      <button
        class="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
        on:click={() => removeNotification($notifications[currentIndex].id)}
      >
        ×
      </button>
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0">
          {#if $notifications[currentIndex].order?.user?.google_picture}
            <img
              src={$notifications[currentIndex].order.user.google_picture}
              alt=""
              class="h-10 w-10 rounded-full"
            />
          {:else}
            <InitialsAvatar
              firstName={$notifications[currentIndex].order?.user?.first_name || ''}
              lastName={$notifications[currentIndex].order?.user?.last_name || ''}
              size="10"
            />
          {/if}
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900">
            {#if $notifications[currentIndex].order?.user}
              {$notifications[currentIndex].order.user.first_name || ''} 
              {$notifications[currentIndex].order.user.last_name || ''}
            {:else}
              Someone
            {/if}
            purchased
          </p>
          <button 
            class="text-sm text-primary hover:underline"
            on:click={() => handleProductClick($notifications[currentIndex].product_listing?.slug)}
          >
            {$notifications[currentIndex].product_listing?.name}
          </button>
          <p class="text-xs text-gray-400">
            {getRelativeTime($notifications[currentIndex].created)}
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>