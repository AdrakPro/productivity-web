<script>
    import { Circle, CheckCircle2, Trash2 } from "lucide-svelte";
    import { updateSubtask, deleteSubtask } from "$lib/stores/todoStore.js";

    export let todoId;
    export let subtask;
    export let readonly = false;

    async function handleToggle() {
        if (readonly) return;
        await updateSubtask(todoId, subtask.id, {
            is_completed: !subtask.is_completed,
            completed_at: !subtask.is_completed
                ? new Date().toISOString()
                : null,
        });
    }

    async function handleDelete() {
        if (readonly) return;
        await deleteSubtask(todoId, subtask.id);
    }
</script>

<div class="subtask-item" class:completed="{subtask.is_completed}">
    <button class="checkbox" on:click="{handleToggle}" disabled="{readonly}">
        {#if subtask.is_completed}
            <CheckCircle2 size="{16}" />
        {:else}
            <Circle size="{16}" />
        {/if}
    </button>

    <span class="subtask-title">{subtask.title}</span>

    {#if !readonly}
        <button class="delete-btn" on:click="{handleDelete}">
            <Trash2 size="{14}" />
        </button>
    {/if}
</div>

<style>
    .subtask-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .checkbox {
        background: transparent;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 0;
        display: flex;
        transition: color 0.2s;
    }

    .checkbox:hover {
        color: #bb86fc;
    }

    .checkbox:disabled {
        cursor: default;
    }

    .subtask-item.completed .checkbox {
        color: #03dac6;
    }

    .subtask-title {
        flex: 1;
        font-size: 0.875rem;
        color: #ccc;
    }

    .subtask-item.completed .subtask-title {
        text-decoration: line-through;
        color: #666;
    }

    .delete-btn {
        background: transparent;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 4px;
        display: flex;
        opacity: 0;
        transition: all 0.2s;
    }

    .subtask-item:hover .delete-btn {
        opacity: 1;
    }

    .delete-btn:hover {
        color: #cf6679;
    }
</style>
