<script>
    import Login from "$lib/components/Login.svelte";
    import { user } from '$lib/stores/auth';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    function redirectAfterLogin() {
        const urlParams = new URLSearchParams(window.location.search);
        const nextPage = urlParams.get('next'); // Get the 'next' query parameter

        if (nextPage) {
            // console.log(nextPage);
            goto(nextPage); // Redirect to the specified page
        } else {
            goto('/'); // Redirect to the home page if no 'next' parameter
        }
    }

    onMount(() => {
        // Check if user is already logged in
        const unsubscribe = user.subscribe(value => {
            if (value) {
                redirectAfterLogin()
            }
        });
        return () => {
            unsubscribe(); // Cleanup subscription
        };
    });
</script>

<Login redirectAfterLogin={redirectAfterLogin} />