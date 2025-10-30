<script>
    import { onMount } from "svelte";
  
    // Optional: Add a redirect after a few seconds
    // onMount(() => {
    //   setTimeout(() => {
    //     window.location.href = "/"; // Redirect to home page after 5 seconds
    //   }, 5000);
    // });
  </script>
  
  
  <div class="min-h-screen flex flex-col items-center justify-center bg-base-200">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-primary">404</h1>
      <p class="text-2xl font-semibold mt-4 text-base-content">Oops! Page not found.</p>
      <p class="mt-2 text-base-content">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div class="mt-6">
        <a href="/" class="btn btn-primary">Go Back Home</a>
      </div>
    </div>
  </div>