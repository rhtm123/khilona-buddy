<script>
    export let blog;
    import { fade, fly } from 'svelte/transition';


</script>


<article 
            class="card bg-white hover:shadow-lg transition-all duration-300"
            in:fly="{{ y: 50, duration: 500, delay: blog.id * 100 }}"
          >
            <figure class="relative h-64">
              <img src={blog.img} alt={blog.title} class="w-full h-full object-cover" />
              <div class="absolute top-4 left-4 flex gap-2">
                <!-- {#each blog.tags.slice(0, 1) as tag}
                  <span class="badge badge-primary">{tag}</span>
                {/each} -->
              </div>
            </figure>
            <div class="p-6">
              <div class="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <span>{blog.read_time} Min</span>
              </div>
              <h3 class="text-xl font-bold mb-3 hover:text-primary transition-colors">
                <a href={`/blog/${blog.slug}`}>{blog.title}</a>
              </h3>
              <p class="text-gray-600 mb-4 line-clamp-2">{blog.seo_description}</p>
              <a 
                href={`/blog/${blog.slug}`} 
                class="text-primary font-semibold hover:underline inline-flex items-center gap-2"
              >
                READ MORE
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </a>
            </div>
          </article>