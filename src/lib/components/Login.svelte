<script>
    import { PUBLIC_API_URL, PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
    import { onMount } from "svelte";
    import { loginUser } from '$lib/stores/auth';
    import { myFetch } from '$lib/utils/myFetch';
    import { goto } from '$app/navigation'; // Import the goto function for navigation

    export let redirectAfterLogin;

    let googleToken = '';
    let username = '';
    let password = '';
    let errorMessage = '';
    let isLoading = false; // Add a loading state

    function handleCredentialResponse(response) {
        googleToken = response.credential;
        isLoading = true; // Start loading

        // console.log('JWT:', googleToken);

        fetch(`${PUBLIC_API_URL}/user/auth/google/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: googleToken }),
            credentials: 'include' 
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.access_token) {
                loginUser(data);
                const urlParams = new URLSearchParams(window.location.search);
                const nextPage = urlParams.get('next'); // Get the 'next' query parameter

                if (!data.mobile_verified) {
                    goto('/verify-mobile?next=' + encodeURIComponent(nextPage));
                } else {
                    redirectAfterLogin(); // Only redirect if mobile is verified
                }
            } else {
                errorMessage = 'Login failed: ' + data.error;
            }
        })
        .catch((err) => {
            console.error('Error:', err);
            errorMessage = 'Failed to connect to the server.';
        })
        .finally(() => {
            isLoading = false; // Stop loading
        });
    }

    async function handleLogin(event) {
        event.preventDefault();
        isLoading = true; // Start loading

        try{

            const res = await fetch("http://localhost:8000/api/user/auth/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password }),
            credentials: "include", // 🔥 This is essential!
        });


        let data = await res.json();
        

        if (data.access_token) {
            loginUser(data);
            if (!data.user.mobile_verified) {
                goto('/verify-mobile?next=' + encodeURIComponent(redirectAfterLogin));
            } else {
                redirectAfterLogin(); // Only redirect if mobile is verified
            }
        } else {
            errorMessage = 'Login failed: ' + data.error;
        }
        } catch (e) { 

        } finally { 
            isLoading = false; // Stop loading
        }
    }
    
    function initializeGoogleSignIn() {
        google.accounts.id.initialize({
            client_id: PUBLIC_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: true, // enables automatic sign-in
            // cancel_on_tap_outside: false,
        });


        google.accounts.id.renderButton(
            document.getElementById('googleSignInDiv'),
            { theme: 'outline', size: 'large' }
        );

        // window.google?.accounts.id.prompt(); // shows the One Tap prompt
    }

    onMount(() => {
        initializeGoogleSignIn();
    });
</script>

<div class="min-h-screen flex items-center justify-center bg-base-100">
    <div class="card w-96 bg-base-100 shadow-xl">
        <div class="card-body">
            <!-- <h2 class="card-title">Login</h2> -->
            {#if errorMessage}
                <div class="alert alert-error">
                    <div class="flex-1">
                        <label>{errorMessage}</label>
                    </div>
                </div>
            {/if}

            <div id="googleSignInDiv"></div>

            <div class="divider">OR</div>

            <form on:submit={handleLogin}>
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Username</span>
                    </label>
                    <input type="text" placeholder="Username" bind:value={username} class="input input-bordered" required />
                </div>
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Password</span>
                    </label>
                    <input type="password" placeholder="Password" bind:value={password} class="input input-bordered" required />
                </div>
                <div class="form-control mt-6">
                    <button type="submit" class="btn btn-primary" disabled={isLoading}>
                        {#if isLoading}
                            <span class="loading loading-spinner"></span> <!-- Loading spinner -->
                        {:else}
                            Login
                        {/if}
                    </button>
                </div>
            </form>
            
        </div>
    </div>
</div>