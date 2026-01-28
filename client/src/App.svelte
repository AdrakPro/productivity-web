<script>
    import { onMount } from "svelte";
    import {
        isAuthenticated,
        isLoading,
        checkAuth,
    } from "$lib/stores/authStore.js";
    import AuthView from "./views/AuthView.svelte";
    import MainApp from "./MainApp.svelte";

    onMount(async () => {
        await checkAuth();
    });
</script>

{#if $isLoading}
    <div class="h-screen flex items-center justify-center bg-background">
        <div class="text-center">
            <div
                class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"
            ></div>
            <p class="text-gray-400">Loading...</p>
        </div>
    </div>
{:else if $isAuthenticated}
    <MainApp />
{:else}
    <AuthView />
{/if}
