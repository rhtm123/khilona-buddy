<!-- src/routes/+error.svelte -->
<script>
    import { page } from '$app/stores';
  </script>
  
  <svelte:head>
    <title>404 - Page Not Found</title>
  </svelte:head>
  
  <div class="min-h-screen flex flex-col items-center justify-center bg-base-200">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-error">404</h1>
      <p class="text-2xl mt-4 text-base-content">Oops! Page not found.</p>
      <p class="mt-2 text-base-content">The page you're looking for doesn't exist or has been moved.</p>
      <a href="/" class="mt-6 btn btn-primary">Go Back Home</a>
    </div>
</div>