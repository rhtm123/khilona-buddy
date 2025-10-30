<script>
    export let shipAddress;
    export let authUser;
    export let modal; // Receive modal reference

    import { addToShipAddress } from "$lib/stores/address";
    import { PUBLIC_API_URL } from "$env/static/public";
    import { myFetch } from "$lib/utils/myFetch";
    import { addAlert } from "$lib/stores/alert";
    import { onMount } from 'svelte';

    let validPins = [];
    let newEditAddress = {
    name: authUser? `${authUser.first_name} ${authUser.last_name}`:'',
    type: shipAddress? shipAddress.type:'home',
    line1: shipAddress? shipAddress.address?.line1:'',
    line2: shipAddress? shipAddress.address?.line2:'',
    landmark: shipAddress? shipAddress.address?.landmark:'',
    city: shipAddress? shipAddress.address?.city:'Naigaon',
    state: shipAddress? shipAddress.address?.state:'Maharashtra',
    pin: shipAddress? shipAddress.address?.pin:'401208',
    mobile: shipAddress? shipAddress.mobile:'',
    is_default: false
    };



 // Fetch valid pin codes from the API
 async function checkValidPins() {
        const url = `${PUBLIC_API_URL}/estore/delivery-pins/?page=1&page_size=10`;
        const response = await myFetch(url);
        let validPins = response.results.map(pin => pin.pin_code);
        return validPins.includes(newEditAddress.pin)
    }
  // Check pin code validity

  let isPinValid = true;

  async function handleSubmit() {

    isPinValid = await checkValidPins();

    if (!isPinValid) {
      addAlert("We do not deliver to this pin code.", "error");
      return;
    }

    // loading = true;

    
    modal.close(); // Close modal after saving

    if (!shipAddress) {
    addAlert("We are adding the address", "info")

    let url1 = `${PUBLIC_API_URL}/location/addresses/`;
    let address = await myFetch(url1, "POST", newEditAddress, authUser.access_token)
    // console.log(address);

    let params = {
      user_id: authUser.user_id,
      address_id: address.id,
      is_default: newEditAddress.is_default,
      name: newEditAddress.name,
      mobile: newEditAddress.mobile, 
      type: newEditAddress.type,
    }


    let url2 = `${PUBLIC_API_URL}/user/shipping-addresses/`;
    let data = await myFetch(url2, "POST", params, authUser.access_token)
    newEditAddress = { name: '', type: 'home', line1: '', line2:"" ,city: '', state: '', pin: '', mobile: '', is_default: false };

    addToShipAddress(data);
    addAlert("Address added successfully", "success")



    } else {
    addAlert("We are updating the address", "info")

    let url1 = `${PUBLIC_API_URL}/location/addresses/${shipAddress.address.id}/`;
    let address = await myFetch(url1, "PUT", newEditAddress, authUser.access_token)
    // console.log(address);

    let params = {
      user_id: authUser.user_id,
      address_id: address.id,
      is_default: newEditAddress.is_default,
      name: newEditAddress.name,
      mobile: newEditAddress.mobile, 
      type: newEditAddress.type,
    }

    let url2 = `${PUBLIC_API_URL}/user/shipping-addresses/${shipAddress.id}/`;
    let data = await myFetch(url2, "PUT", params, authUser.access_token)
    addToShipAddress(data);
    // console.log(data);
    addAlert("Address edited successfully", "success")

    }


    // console.log(data);
    // loading = false;
  }

</script>

<div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form>

  
    <div class="rounded-lg bg-gray-50">
      <h3 class="text-lg font-medium mb-4">Add New Address</h3>
      <form on:submit|preventDefault={handleSubmit} class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            bind:value={newEditAddress.name}
            required
            class="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            bind:value={newEditAddress.mobile}
            required
            class="w-full p-2 border rounded-lg"
          />
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Line1 [Flat/Building]</label>
          <textarea
            bind:value={newEditAddress.line1}
            required
            class="w-full p-2 border rounded-lg"
            rows="2"
          ></textarea>
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Line2 [Locality]</label>
          <textarea
            bind:value={newEditAddress.line2}
            class="w-full p-2 border rounded-lg"
            rows="2"
          ></textarea>
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">landmark (if any)</label>
          <textarea
            bind:value={newEditAddress.landmark}
            class="w-full p-2 border rounded-lg"
            rows="1"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            bind:value={newEditAddress.city}
            required
            class="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            bind:value={newEditAddress.state}
            required
            class="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Pin Code</label>
          <input
            type="text"
            bind:value={newEditAddress.pin}
            required
            class="w-full p-2 border rounded-lg"
          />
          {#if !isPinValid}
            <p class="text-red-500">We are not delivering to this pin code. Please enter a valid pin.</p>
          {/if}
        </div>  

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
          <select
            bind:value={newEditAddress.type}
            class="w-full p-2 border rounded-lg"
          >
            <option value="home">Home</option>
            <option value="work">Work</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="md:col-span-2">
          <label class="inline-flex items-center">
            <input
              type="checkbox"
              bind:checked={newEditAddress.is_default}
              class="form-checkbox text-red-500"
            />
            <span class="ml-2">Make this my default address</span>
          </label>
        </div>

        <div class="md:col-span-2 flex justify-end space-x-4">
          
          <button
            type="submit"
            class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Save Address
          </button>
        </div>
      </form>
    </div>

  </div>
