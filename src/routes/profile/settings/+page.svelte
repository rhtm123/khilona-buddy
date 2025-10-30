<script>

  import { user } from "$lib/stores/auth";
  import { PUBLIC_API_URL } from "$env/static/public";
  import { myFetch } from "$lib/utils/myFetch";

  import { onDestroy } from "svelte";


  let authUser;

  $: authUser = $user;

  let userData;

  let profile = {
    first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      gender: '',
  };

  // $: if (authUser) {
  //   fetchUser();
  // }

  $: if (authUser) {
    profile = {
      first_name: authUser?.first_name,
      last_name: authUser?.last_name,
      email: authUser?.email,
      mobile: authUser?.mobile,
      gender: authUser?.gender,
    };
  }

  // async function fetchUser(){
  //   let url = `${PUBLIC_API_URL}/user/users/${authUser?.user_id}/`;
  //   userData = await myFetch(url);

  // }

  let isEditing = false;

  async function handleSubmit() {
    isEditing = false;
    let url = `${PUBLIC_API_URL}/user/users/${authUser.user_id}/`;
    userData = await myFetch(url, "PUT", profile, authUser.access_token);
    authUser['first_name'] = userData?.first_name
    authUser['last_name'] = userData?.last_name
    authUser['email'] = userData?.email
    authUser['gender'] = userData?.gender
    authUser['mobile'] = userData?.mobile
    user.set(authUser);
  }

</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h2 class="text-2xl font-bold md:block hidden">Personal Information</h2>
    <button
      on:click={() => isEditing = !isEditing}
      class="text-red-500 hover:text-red-600"
    >
      {isEditing ? 'Cancel' : 'Edit'}
    </button>
  </div>

  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
        <input
          type="text"
          bind:value={profile.first_name}
          disabled={!isEditing}
          class="w-full p-2 border rounded-lg {!isEditing ? 'bg-gray-50' : 'bg-white'}"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
        <input
          type="text"
          bind:value={profile.last_name}
          disabled={!isEditing}
          class="w-full p-2 border rounded-lg {!isEditing ? 'bg-gray-50' : 'bg-white'}"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input
          type="email"
          bind:value={profile.email}
          disabled={!isEditing}
          class="w-full p-2 border rounded-lg {!isEditing ? 'bg-gray-50' : 'bg-white'}"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
        <input
          type="tel"
          bind:value={profile.mobile}
          disabled={!isEditing}
          class="w-full p-2 border rounded-lg {!isEditing ? 'bg-gray-50' : 'bg-white'}"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
        <div class="space-x-4">
          <label class="inline-flex items-center">
            <input
              type="radio"
              bind:group={profile.gender}
              value="male"
              disabled={!isEditing}
              class="form-radio text-red-500"
            />
            <span class="ml-2">Male</span>
          </label>
          <label class="inline-flex items-center">
            <input
              type="radio"
              bind:group={profile.gender}
              value="female"
              disabled={!isEditing}
              class="form-radio text-red-500"
            />
            <span class="ml-2">Female</span>
          </label>
        </div>
      </div>
    </div>

    {#if isEditing}
      <div class="flex justify-end">
        <button
          type="submit"
          class="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Save Changes
        </button>
      </div>
    {/if}
  </form>

  <div class="border-t pt-6 mt-6">
    <h3 class="text-lg font-semibold mb-4">FAQs</h3>
    <div class="space-y-4">
      <div>
        <h4 class="font-medium mb-2">What happens when I update my email address?</h4>
        <p class="text-gray-600">Your login email ID is changed. You'll receive all account related communication on your updated email address.</p>
      </div>
      <div>
        <h4 class="font-medium mb-2">When will my account be updated with the new email address?</h4>
        <p class="text-gray-600">It happens as soon as you confirm the verification code sent to your email address.</p>
      </div>
    </div>
  </div>
</div>