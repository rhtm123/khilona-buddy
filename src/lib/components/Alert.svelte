<script>
    import { createEventDispatcher, onDestroy } from "svelte";
    import  Icon  from "@iconify/svelte";

    export let message;
    export let type = "info";
    export let duration = 3000;

    const dispatch = createEventDispatcher();
    let timer = setTimeout(() => dispatch("close"), duration);

    onDestroy(() => {
        clearTimeout(timer);
    });

    const handleClose = () => {
        clearTimeout(timer); // Prevent auto-close
        dispatch("close"); // Dispatch event to remove alert immediately
    };

    const alertClasses = {
        success: "alert alert-success",
        error: "alert alert-error",
        warning: "alert alert-warning",
        info: "alert alert-info",
    };

    const iconMap = {
        success: "material-symbols:check-circle-rounded",
        error: "material-symbols:error-rounded",
        warning: "material-symbols:warning-rounded",
        info: "material-symbols:info-rounded",
    };
</script>

<div class={`${alertClasses[type]} shadow-lg flex items-center justify-between px-4 py-2 rounded-lg`}>
    <div class="flex items-center gap-2">
        <Icon icon={iconMap[type]} class="w-6 h-6" />
        <span>{message}</span>
    </div>
    <button on:click={handleClose} class="btn btn-sm px-1 btn-ghost">
        <Icon icon="mdi:close" class="w-5 h-5" />
    </button>
</div>
