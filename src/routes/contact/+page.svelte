<script>
    import { onMount } from "svelte";
    import Icon from '@iconify/svelte';


    export let data; 

    let staticPage = data?.staticPage;

    let estore = data?.estore;

    // Set SEO meta tags
  
    
    let name = "";
    let email = "";
    let mobile = "";
    let message = "";
    let loading = false;
    let error = "";
    let success = false;
  
    async function submitForm(event) {
      event.preventDefault();
      if (!name || !email || !mobile || !message) {
        error = "All fields are required.";
        return;
      }

      loading = true;
      error = "";
      
      try {
        let domain = window.location.origin;
        
        let html = `
          <h3>New Contact Form Submission</h3>
          <p>You have received a new contact form submission:</p>
          <ul>
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Mobile:</strong> ${mobile}</li>
            <li><strong>Message:</strong> ${message}</li>
            <li><strong>Source:</strong> ${domain}</li>
          </ul>
        `;

        let encodedHtml = encodeURIComponent(html);
        let url = `https://gt.thelearningsetu.com/api/extra_api/contact?domain=${domain}&name=${name}&html_content=${encodedHtml}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        success = true;
        name = "";
        email = "";
        mobile = "";
        message = "";
        
        setTimeout(() => {
          success = false;
        }, 5000);

      } catch (err) {
        error = "Failed to send message. Please try again.";
        console.error(err);
      } finally {
        loading = false;
      }
    }
  </script>
  
  <svelte:head>
    <title>{staticPage?.meta_title || `Contact Us - ${estore?.name}`} </title>
    <meta
      name="description"
      content={staticPage?.meta_description || `${estore?.name} - Contact us for support, business inquiries, or feedback.`}
    />

    <meta property="og:title" content={staticPage?.meta_title || ""} />
    <meta
      property="og:description"
      content={staticPage?.meta_description || `Get in touch with ${estore?.name}. Contact us for support, business inquiries, or feedback.`}
    />
    <meta property="og:type" content="website" />
  </svelte:head>
  
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Have questions? We'd love to hear from you! Send us a message and we'll respond as soon as possible.
        </p>
      </div>
  
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <!-- Contact Form -->
        <div class="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6">Send us a message</h2>
  
          {#if error}
            <div class="alert alert-error mb-6 text-sm">
              <Icon icon="mdi:alert-circle" class="w-5 h-5" />
              <span>{error}</span>
            </div>
          {/if}
  
          {#if success}
            <div class="alert alert-success mb-6 text-sm">
              <Icon icon="mdi:check-circle" class="w-5 h-5" />
              <span>Message sent successfully! We'll get back to you soon.</span>
            </div>
          {/if}
  
          <form on:submit={submitForm} class="space-y-6">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                id="name"
                bind:value={name}
                class="input input-bordered w-full"
                placeholder="Your Name"
              />
            </div>
  
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                id="email"
                bind:value={email}
                class="input input-bordered w-full"
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label for="mobile" class="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
              <input
                type="tel"
                id="mobile"
                bind:value={mobile}
                class="input input-bordered w-full"
                placeholder="Your Mobile Number"
              />
            </div>
  
            <div>
              <label for="message" class="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                id="message"
                bind:value={message}
                rows="4"
                class="textarea textarea-bordered w-full"
                placeholder="How can we help you?"
              ></textarea>
            </div>
  
            <button 
              type="submit" 
              class="btn btn-primary w-full {loading ? 'loading' : ''}"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
  
        <!-- Contact Information -->
        <div class="space-y-8">
          <div class="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-6">Other ways to reach us</h2>
            
            <div class="space-y-6">
              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0">
                  <Icon icon="mdi:email" class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900">Email</h3>
                  <p class="mt-1 text-gray-600">
                    <a href={"mailto:" + estore?.email} class="hover:text-primary">
                      {estore?.email}
                    </a>
                  </p>
                </div>
              </div>
  
              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0">
                  <Icon icon="mdi:map-marker" class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900">Location</h3>
                  <p class="mt-1 text-gray-600">
                    {estore?.address?.line1}<br />
                    {estore?.address?.city},<br />
                    {estore?.address?.state}, India
                  </p>
                </div>
              </div>
  
              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0">
                  <Icon icon="mdi:clock" class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900">Business Hours</h3>
                  <p class="mt-1 text-gray-600">
                    Monday - Sunday<br />
                    9:00 AM - 9:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Map or Additional Info Card -->
          <div class="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">Follow Us</h2>
            <div class="flex space-x-4">
              <a target="_blank" href="https://www.facebook.com/profile.php?id=100088926467895" class="text-gray-400 hover:text-primary">
                <Icon icon="mdi:facebook" class="w-6 h-6" />
              </a>
              <a target="_blank" href="https://www.instagram.com/naigaonmarket/" class="text-gray-400 hover:text-primary">
                <Icon icon="mdi:instagram" class="w-6 h-6" />
              </a>
              <a target="_blank" href="https://whatsapp.com/channel/0029Vb7g3Q21Hsq2NLrtZX28 " class="text-gray-400 hover:text-primary">
                <Icon icon="mdi:whatsapp" class="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  