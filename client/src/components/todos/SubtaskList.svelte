<script>
    import { Plus } from "lucide-svelte";
    import { addSubtask } from "$lib/stores/todoStore.js";
    import SubtaskItem from "./SubtaskItem.svelte";

    export let todoId;
    export let subtasks = [];
    export let readonly = false;

    let newSubtaskTitle = "";
    let isAdding = false;

    async function handleAddSubtask() {
        if (!newSubtaskTitle.trim()) return;
        await addSubtask(todoId, newSubtaskTitle.trim());
        newSubtaskTitle = "";
        isAdding = false;
    }

    function handleKeydown(event) {
        if (event.key === "Enter") {
            handleAddSubtask();
        } else if (event.key === "Escape") {
            newSubtaskTitle = "";
            isAdding = false;
        }
    }
</script>

<div class="subtask-list">
    {#each subtasks as subtask (subtask.id)}
        <SubtaskItem {todoId} {subtask} {readonly} />
    {/each}

    {#if !readonly}
        {#if isAdding}
            <div class="add-subtask-form">
                <input
                    type="text"
                    class="subtask-input"
                    placeholder="Subtask title..."
                    bind:value="{newSubtaskTitle}"
                    on:keydown="{handleKeydown}"
                    autofocus
                />
                <button class="btn-add" on:click="{handleAddSubtask}"
                    >Add</button
                >
                <button class="btn-cancel" on:click="{() => (isAdding = false)}"
                    >Cancel</button
                >
            </div>
        {:else}
            <button
                class="add-subtask-btn"
                on:click="{() => (isAdding = true)}"
            >
                <Plus size="{14}" />
                <span>Add subtask</span>
            </button>
        {/if}
    {/if}
</div>

<style>
    .subtask-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .add-subtask-form {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .subtask-input {
        flex: 1;
        padding: 0.5rem 0.75rem;
        background-color: #2d2d2d;
        border: 1px solid #3d3d3d;
        border-radius: 6px;
        color: #e1e1e1;
        font-size: 0.875rem;
        outline: none;
    }

    .subtask-input:focus {
        border-color: #bb86fc;
    }

    .btn-add,
    .btn-cancel {
        padding: 0.5rem 0.75rem;
        border: none;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-add {
        background-color: #bb86fc;
        color: #000;
    }

    .btn-add:hover {
        background-color: #a66df0;
    }

    .btn-cancel {
        background-color: transparent;
        color: #888;
    }

    .btn-cancel:hover {
        background-color: #2d2d2d;
        color: #e1e1e1;
    }

    .add-subtask-btn {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0;
        background: transparent;
        border: none;
        color: #666;
        font-size: 0.875rem;
        cursor: pointer;
        transition: color 0.2s;
    }

    .add-subtask-btn:hover {
        color: #888;
    }
</style>
