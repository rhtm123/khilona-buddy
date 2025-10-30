<script>
    import { onMount } from 'svelte';

    // Variables to store email and form data
    let email = '';
    let reason = '';
    let customReason = '';
    let submitted = false;

    // Predefined reasons for unsubscribing
    const reasons = [
        "I receive too many emails",
        "The content isn’t relevant to me",
        "I no longer need updates",
        "Other (please specify)"
    ];

    // Get email from query parameter on mount
    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);
        email = urlParams.get('email') || '';
        // console.log(email);
    });

    // Handle form submission
    function handleSubmit() {
        const unsubscribeData = {
            email,
            reason: reason === "Other (please specify)" ? customReason : reason
        };
        // Placeholder for API call
        console.log("Unsubscribe data:", unsubscribeData);
        // Example: fetch('/api/unsubscribe', { method: 'POST', body: JSON.stringify(unsubscribeData) });
        submitted = true;
    }
</script>

<main class="min-h-screen flex items-center justify-center ">
    <div class="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
        {#if submitted}
            <h1 class="text-2xl font-bold text-gray-800 mb-4">Unsubscribe Confirmed</h1>
            <p class="text-gray-600">You’ve been successfully unsubscribed from our emails. We’re sorry to see you go!</p>
            <p class="text-gray-600 mt-2">If this was a mistake, you can <a href="/subscribe" class="text-blue-500 hover:underline">resubscribe here</a>.</p>
        {:else}
            <h1 class="text-2xl font-bold text-gray-800 mb-4">Unsubscribe from Emails Updates</h1>
            <p class="text-gray-600 mb-4">You’re unsubscribing <span class="font-semibold">{email || 'this email'}</span>. Please let us know why:</p>

            <form on:submit|preventDefault={handleSubmit} class="space-y-4">
                <!-- Reason Selection -->
                <div class="space-y-2">
                    {#each reasons as r}
                        <label class="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="reason"
                                value={r}
                                bind:group={reason}
                                class="text-blue-500 focus:ring-blue-500"
                                required
                            />
                            <span class="text-gray-700">{r}</span>
                        </label>
                    {/each}
                </div>

                <!-- Custom Reason Textarea (shown if "Other" is selected) -->
                {#if reason === "Other (please specify)"}
                    <div>
                        <textarea
                            bind:value={customReason}
                            placeholder="Please tell us more..."
                            class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            rows="3"
                            required
                        ></textarea>
                    </div>
                {/if}

                <!-- Submit Button -->
                <button
                    type="submit"
                    class="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors disabled:bg-gray-400"
                    disabled={!reason || (reason === "Other (please specify)" && !customReason)}
                >
                    Unsubscribe
                </button>
            </form>

            <p class="text-gray-500 text-sm mt-4">
                Changed your mind? <a href="/" class="text-blue-500 hover:underline">Return to the site</a>.
            </p>
        {/if}
    </div>
</main>

<style>
    /* Additional custom styles can go here if needed */
</style>