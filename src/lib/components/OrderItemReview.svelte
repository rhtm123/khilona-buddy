<script>
    export let order_item_id;

    import { myFetch } from "$lib/utils/myFetch";
    import { PUBLIC_API_URL } from "$env/static/public";

    import Icon from '@iconify/svelte';

    let review=null;

    async function fetchItemRemove() {
        let url = `${PUBLIC_API_URL}/review/reviews/order-item/${order_item_id}/`;
        try { 
            let data = await myFetch(url);
            review = data;
            console.log(data);
        } catch (e) {
            review = null;
        }
        
    }

    $: if (order_item_id) {
        fetchItemRemove();
    }


</script>
    <div class="flex items-center gap-4">
                    {#if review}
                        <div class="flex flex-col items-end">
                            <p class="text-sm text-gray-600">Your Rating:</p>
                            <div class="flex items-center space-x-1">
                                {#each Array(review.rating) as _}
                                    <Icon icon="material-symbols:star" class="w-4 h-4 text-yellow-400" />
                                {/each}
                                {#each Array(5 - review.rating) as _}
                                    <Icon icon="material-symbols:star-outline" class="w-4 h-4 text-gray-300" />
                                {/each}
                            </div>
                            <a 
                                class="text-sm text-primary hover:underline mt-1" 
                                href={"/profile/add-review/" + order_item_id}
                            >
                                View Review
                            </a>
                        </div>
                    {:else}
                        <a 
                            class="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            href={"/profile/add-review/" + order_item_id}
                        >
                            <Icon icon="material-symbols:rate-review-outline" class="w-4 h-4" />
                            Add Review
                        </a>
                    {/if}
                </div>