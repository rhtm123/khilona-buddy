<script>
  import { createEventDispatcher } from 'svelte';
  export let variants = [];
  export let newVariant = { name: '', attributes: [] };
  export let newAttribute = { name: '', value: '', real_value: '' };
  export let errors = {};
  export let isSubmitting = false;

  const dispatch = createEventDispatcher();

  let editingVariantId = null;
  let editingVariant = { name: '', attributes: [] };

  function handleAddAttribute() {
    dispatch('addAttribute');
  }
  function handleRemoveAttribute(event) {
    dispatch('removeAttribute', { index: event.detail.index });
  }
  function handleAddVariant() {
    dispatch('addVariant');
  }
  function startEditVariant(variant) {
    editingVariantId = variant.id;
    editingVariant = JSON.parse(JSON.stringify(variant));
  }
  function cancelEditVariant() {
    editingVariantId = null;
    editingVariant = { name: '', attributes: [] };
  }
  function saveEditVariant() {
    dispatch('updateVariant', { variantId: editingVariantId, payload: editingVariant });
    editingVariantId = null;
    editingVariant = { name: '', attributes: [] };
  }
  function handleEditAttributeChange(index, key, value) {
    editingVariant.attributes[index][key] = value;
  }
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  <div class="px-6 py-4 border-b border-gray-200">
    <h2 class="text-lg font-semibold text-gray-900 flex items-center">
      <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h4a2 2 0 012 2v4a2 2 0 01-2 2h-4m-4-8a2 2 0 01-2-2V7a2 2 0 012-2h2m0 0V3a2 2 0 012-2h4a2 2 0 012 2v2M9 7h6"/>
      </svg>
      Product Variants
    </h2>
    <p class="text-sm text-gray-500 mt-1">Create different variations of your product (e.g., size, color, model)</p>
  </div>
  <div class="px-6 py-6">
    <!-- Existing Variants -->
    {#if variants.length > 0}
      <div class="space-y-4 mb-8">
        {#each variants as variant (variant.id || variant.name)}
          <div class="border border-gray-200 rounded-lg p-4">
            {#if editingVariantId === variant.id}
              <input type="text" bind:value={editingVariant.name} class="mb-2 px-2 py-1 border rounded w-full" />
              <div class="overflow-x-auto mb-2">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attribute</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Real Value</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each editingVariant.attributes as attr, i}
                      <tr>
                        <td class="px-4 py-2"><input type="text" bind:value={attr.name} on:input={e => handleEditAttributeChange(i, 'name', e.target.value)} class="border rounded px-2 py-1 w-full" /></td>
                        <td class="px-4 py-2"><input type="text" bind:value={attr.value} on:input={e => handleEditAttributeChange(i, 'value', e.target.value)} class="border rounded px-2 py-1 w-full" /></td>
                        <td class="px-4 py-2"><input type="text" bind:value={attr.real_value} on:input={e => handleEditAttributeChange(i, 'real_value', e.target.value)} class="border rounded px-2 py-1 w-full" /></td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
              <div class="flex space-x-2">
                <button type="button" on:click={saveEditVariant} class="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
                <button type="button" on:click={cancelEditVariant} class="px-3 py-1 bg-gray-300 text-gray-800 rounded">Cancel</button>
              </div>
            {:else}
              <h3 class="font-medium text-gray-900 mb-3 flex items-center justify-between">
                <span>{variant.name}</span>
                <button type="button" on:click={() => startEditVariant(variant)} class="text-blue-600 hover:text-blue-800 text-xs ml-2">Edit</button>
              </h3>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attribute</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Real Value</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each variant.attributes as attr}
                      <tr>
                        <td class="px-4 py-2 text-sm font-medium text-gray-900">{attr.name}</td>
                        <td class="px-4 py-2 text-sm text-gray-900">{attr.value}</td>
                        <td class="px-4 py-2 text-sm text-gray-900">{attr.real_value}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
    <!-- Add New Variant -->
    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Add New Variant</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Variant Name</label>
          <input 
            type="text" 
            bind:value={newVariant.name} 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Red 128GB, Large Size, etc."
          />
        </div>
        <!-- Attributes Table -->
        {#if newVariant.attributes.length > 0}
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Real Value</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each newVariant.attributes as attribute, index}
                  <tr>
                    <td class="px-4 py-2 text-sm text-gray-900">{attribute.name}</td>
                    <td class="px-4 py-2 text-sm text-gray-900">{attribute.value}</td>
                    <td class="px-4 py-2 text-sm text-gray-900">{attribute.real_value}</td>
                    <td class="px-4 py-2">
                      <button 
                        on:click={() => dispatch('removeAttribute', { index })} 
                        class="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
        <!-- Add Attribute Form -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input 
            type="text" 
            bind:value={newAttribute.name} 
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Attribute name"
          />
          <input 
            type="text" 
            bind:value={newAttribute.value} 
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Value"
          />
          <input 
            type="text" 
            bind:value={newAttribute.real_value} 
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Real value"
          />
          <button 
            type="button"
            on:click={handleAddAttribute} 
            class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Add
          </button>
        </div>
        <div class="flex justify-end">
          <button 
            type="button"
            on:click={handleAddVariant} 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Add Variant
          </button>
        </div>
      </div>
    </div>
  </div>
</div> 