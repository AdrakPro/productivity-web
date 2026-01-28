<script>
    import { onMount } from "svelte";
    import Sidebar from "./components/layout/Sidebar.svelte";
    import Header from "./components/layout/Header.svelte";
    import KeyboardHandler from "./components/layout/KeyboardHandler.svelte";
    import MainView from "./views/MainView.svelte";
    import FilesView from "./views/FilesView.svelte";
    import ArchiveView from "./views/ArchiveView.svelte";
    import StatisticsView from "./views/StatisticsView.svelte";
    import SettingsView from "./views/SettingsView.svelte";
    import ToastContainer from "./components/common/ToastContainer.svelte";
    import { currentPage } from "$lib/stores/viewStore.js";
    import { loadTodos } from "$lib/stores/todoStore.js";
    import { loadStatistics } from "$lib/stores/statisticsStore.js";

    let mainViewRef;

    function handleNewTask() {
        if ($currentPage !== "main") {
            currentPage.set("main");
            setTimeout(() => mainViewRef?.triggerNewTask(), 50);
        } else {
            mainViewRef?.triggerNewTask();
        }
    }

    onMount(async () => {
        await loadTodos();
        await loadStatistics();
    });
</script>

<KeyboardHandler on:newTask="{handleNewTask}" />
<ToastContainer />

<div class="app-container">
    <Header />
    <div class="app-content">
        <Sidebar />
        <main class="main-content">
            {#if $currentPage === "main"}
                <MainView bind:this="{mainViewRef}" />
            {:else if $currentPage === "files"}
                <FilesView />
            {:else if $currentPage === "archive"}
                <ArchiveView />
            {:else if $currentPage === "statistics"}
                <StatisticsView />
            {:else if $currentPage === "settings"}
                <SettingsView />
            {/if}
        </main>
    </div>
</div>

<style>
    .app-container {
        height: 100vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background-color: #121212;
    }

    .app-content {
        display: flex;
        flex: 1;
        overflow: hidden;
    }

    .main-content {
        flex: 1;
        overflow: auto;
        padding: 1.5rem;
    }
</style>
