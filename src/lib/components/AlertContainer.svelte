<script>
    import Alert from "./Alert.svelte";
    import { alerts } from "$lib/stores/alert";
</script>

<div class="fixed top-5 right-5 space-y-2 z-50">
    {#each $alerts as alert (alert.id)}
        <Alert
            message={alert.message}
            type={alert.type}
            duration={alert.duration}
            on:close={() => {
                alerts.update((allAlerts) => allAlerts.filter((a) => a.id !== alert.id));
            }}
        />
    {/each}
</div>
