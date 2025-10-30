<script>
  import { user } from "$lib/stores/auth";
  import { onMount, onDestroy } from "svelte";
  import { PUBLIC_API_URL } from "$env/static/public";
  import { myFetch } from "$lib/utils/myFetch";

  import { shipaddresses } from "$lib/stores/address";
  import AddressAddEdit from "$lib/components/AddressAddEdit.svelte";
  import { addAlert } from "$lib/stores/alert";
    import SkeltonAddresses from "$lib/components/skeltons/SkeltonAddresses.svelte";

  let authUser;
  let loading = false;

  
  $: authUser = $user;


  let addresses=[];

  shipaddresses.subscribe(value=>{
    // console.log(value);
    addresses = value;
  })




  onMount(async () => {
    loading = true;
    let url = `${PUBLIC_API_URL}/user/shipping-addresses/?page=1&page_size=50&user_id=${authUser.user_id}`
    let data = await myFetch(url);
    // console.log(data);
    shipaddresses.set(data.results);
    loading = false;
    // console.log(data);
  });
  



  async function deleteAddress(address) {
    let url2 = `${PUBLIC_API_URL}/user/shipping-addresses/${address.id}/`;
    myFetch(url2, "DELETE", {}, authUser.access_token);
    let url1 = `${PUBLIC_API_URL}/location/addresses/${address.address.id}/`;
    myFetch(url1, "DELETE", {}, authUser.access_token);
    shipaddresses.update(current => current.filter(addr => addr.id !== address.id));
    addAlert("Address deleted successfully", "info")
  }

  function setDefaultAddress(id) {
    addresses = addresses.map(addr => ({
      ...addr,
      is_default: addr.id === id
    }));
  }


  let modal;

function openModal() {
  modal.showModal(); // Opens the modal
}

function closeModal() {
  modal.close(); // Closes the modal
}


let modalEdits = {}; // Store modal references

  function openModalEdit(id) {
    if (modalEdits[id]) {
      modalEdits[id].showModal();
    }
  }

  function closeModalEdits(id) {
    modalEdit[id].close(); // Closes the modal
  }

</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h2 class="text-2xl font-bold md:block hidden">Manage Addresses</h2>
    
    <button class="btn btn-secondary" on:click={openModal}>+ Add New Address</button>


    <dialog bind:this={modal} class="modal">
      <AddressAddEdit authUser={authUser} modal={modal} />
    </dialog>


  </div>

  <div class="space-y-4">

    
    {#each addresses as address (address.id)}
      <div class="border rounded-lg p-4 relative {address.is_default ? 'border-red-500' : ''}">
        {#if address.is_default}
          <span class="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
            Default
          </span>
        {/if}
        
        <div class="flex justify-between items-start">
          <div>
            <div class="flex items-center space-x-2">
              <h3 class="font-medium">{address.name}</h3>
              <span class="text-sm text-gray-500">({address.type})</span>
            </div>
            <p class="text-gray-600 mt-1">{address.address.line1}</p>
            <p class="text-gray-600">{address.address.city}, {address.address.state} {address.address.pin}</p>
            <p class="text-gray-600 mt-1">Phone: {address.mobile}</p>
          </div>
          
          <div class="space-x-4">
            <button class="text-gray-600 hover:text-gray-800" on:click={() => openModalEdit(address.id)}>Edit</button>

            <dialog bind:this={modalEdits[address.id]} class="modal">
              <AddressAddEdit authUser={authUser} shipAddress={address} modal={modalEdits[address.id]} />
            </dialog>

            <button 
              on:click={() => deleteAddress(address)}
              class="text-red-500 hover:text-red-600"
            >
              Delete
            </button>
          </div>
        </div>

        {#if !address.isDefault}
          <button
            on:click={() => setDefaultAddress(address.id)}
            class="mt-4 text-red-500 hover:text-red-600 text-sm"
          >
            Set as Default
          </button>
        {/if}
      </div>
    {/each}

    {#if loading}
      <SkeltonAddresses />
    {/if}


    
  </div>
</div> 