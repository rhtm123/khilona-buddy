
<script>

let pincode = '';
  let pincodeResult = '';
  let pinData = null;
  import { PUBLIC_API_URL } from "$env/static/public";
  import  Icon  from '@iconify/svelte';


  async function checkPincodeAvailability() {
    if (!pincode) return; // Don't do anything if pincode is empty
    
    if (pincode.length === 6) {
      const response = await fetch(`${PUBLIC_API_URL}/estore/delivery-pins/?page=1&page_size=10`);
      const data = await response.json();
      const foundPinData = data.results.find(pin => pin.pin_code === pincode);
      
      pinData = foundPinData;
      
      if (foundPinData) {
        pincodeResult = `Delivery is available in ${foundPinData.city}, ${foundPinData.state}. COD is ${foundPinData.cod_available ? 'available' : 'not available'}.`;
      } else {
        pincodeResult = 'Delivery is not available for this pincode.';
      }
    } else if (pincode.length > 0) {
      pincodeResult = 'Please enter a valid 6-digit pincode.';
      pinData = null;
    }
  }

</script>

<div class="flex flex-col gap-3 bg-gray-50 rounded-lg">
  <h3 class="text-sm font-semibold text-gray-700">Check Delivery Availability</h3>
  <div class="flex items-center gap-3">
    <input
      type="text"
      placeholder="Enter Pincode"
      bind:value={pincode}
      class="w-32 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
      maxlength="6"
    />
    <button
      class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      on:click={checkPincodeAvailability}
    >
      Check
    </button>
  </div>
  {#if pincode && pincodeResult}
    <div class="flex items-start gap-2 mt-2">
      <Icon
        icon={pinData ? "mdi:check-circle" : "mdi:alert-circle"}
        class="w-5 h-5 mt-0.5 {pinData ? 'text-green-600' : 'text-red-600'}"
      />
      <div class="flex flex-col gap-1">
        {#if pinData}
          <p class="text-sm text-gray-800">
            Delivery available in <span class="font-medium">{pinData.city}, {pinData.state}</span>
          </p>
          <p class="text-sm {pinData.cod_available ? 'text-green-600' : 'text-red-600'}">
            COD <span class="font-medium">{pinData.cod_available ? 'available' : 'not available'}</span>
          </p>
        {:else}
          <p class="text-sm text-red-600">{pincodeResult}</p>
        {/if}
      </div>
    </div>
  {/if}
</div>