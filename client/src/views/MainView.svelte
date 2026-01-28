<script>
    import TodoList from "$components/todos/TodoList.svelte";
    import DayNavigation from "$components/todos/DayNavigation.svelte";
    import { viewMode } from "$lib/stores/viewStore.js";

    let todoListRef;

    export function triggerNewTask() {
        todoListRef?.triggerNewTask();
    }
</script>

<div class="main-view">
    <div class="view-header">
        {#if $viewMode === "daily"}
            <DayNavigation />
        {:else}
            <div class="global-header">
                <h1>Global Tasks</h1>
                <p>Tasks with deadlines, not tied to specific days</p>
            </div>
        {/if}
    </div>

    <div class="view-content">
        <TodoList bind:this="{todoListRef}" />
    </div>
</div>

<style>
    .main-view {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .view-header {
        margin-bottom: 1.5rem;
    }

    .view-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    .global-header h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #e1e1e1;
        margin: 0 0 0.25rem 0;
    }

    .global-header p {
        font-size: 0.875rem;
        color: #888;
        margin: 0;
    }
</style>
