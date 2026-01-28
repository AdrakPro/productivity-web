<script>
    import {
        Circle,
        CheckCircle2,
        Trash2,
        Archive,
        ChevronDown,
        ChevronRight,
        Pencil,
    } from "lucide-svelte";
    import {
        toggleTodoComplete,
        deleteTodo,
        archiveTodo,
        updateTodo,
    } from "$lib/stores/todoStore.js";
    import SubtaskList from "./SubtaskList.svelte";

    export let todo;
    export let readonly = false;

    let expanded = false;
    let isEditing = false;
    let editTitle = todo.title;

    async function handleToggle() {
        if (readonly) return;
        await toggleTodoComplete(todo.id);
    }

    async function handleDelete() {
        if (readonly) return;
        if (confirm("Are you sure you want to delete this task?")) {
            await deleteTodo(todo.id);
        }
    }

    async function handleArchive() {
        if (readonly) return;
        await archiveTodo(todo.id);
    }

    async function handleSaveEdit() {
        if (editTitle.trim() && editTitle !== todo.title) {
            await updateTodo(todo.id, { title: editTitle.trim() });
        }
        isEditing = false;
    }

    function handleEditKeydown(event) {
        if (event.key === "Enter") {
            handleSaveEdit();
        } else if (event.key === "Escape") {
            editTitle = todo.title;
            isEditing = false;
        }
    }

    function getPriorityClass(priority) {
        switch (priority) {
            case "urgent":
                return "priority-urgent";
            case "high":
                return "priority-high";
            case "medium":
                return "priority-medium";
            case "low":
                return "priority-low";
            default:
                return "";
        }
    }

    $: hasSubtasks = todo.subtasks && todo.subtasks.length > 0;
    $: completedSubtasks =
        todo.subtasks?.filter((s) => s.is_completed).length || 0;
</script>

<div
    class="todo-item {getPriorityClass(todo.priority)}"
    class:completed="{todo.is_completed}"
>
    <button class="checkbox" on:click="{handleToggle}" disabled="{readonly}">
        {#if todo.is_completed}
            <CheckCircle2 size="{22}" />
        {:else}
            <Circle size="{22}" />
        {/if}
    </button>

    <div class="todo-content">
        {#if isEditing}
            <input
                type="text"
                class="edit-input"
                bind:value="{editTitle}"
                on:keydown="{handleEditKeydown}"
                on:blur="{handleSaveEdit}"
                autofocus
            />
        {:else}
            <h3 class="todo-title">{todo.title}</h3>
        {/if}

        {#if todo.description}
            <p class="todo-description">{todo.description}</p>
        {/if}

        {#if hasSubtasks}
            <button
                class="subtask-toggle"
                on:click="{() => (expanded = !expanded)}"
            >
                {#if expanded}
                    <ChevronDown size="{14}" />
                {:else}
                    <ChevronRight size="{14}" />
                {/if}
                <span>{completedSubtasks}/{todo.subtasks.length} subtasks</span>
            </button>
        {/if}
    </div>

    {#if !readonly}
        <div class="todo-actions">
            <button
                class="action-btn"
                on:click="{() => {
                    isEditing = true;
                    editTitle = todo.title;
                }}"
                title="Edit"
            >
                <Pencil size="{16}" />
            </button>
            <button
                class="action-btn"
                on:click="{handleArchive}"
                title="Archive"
            >
                <Archive size="{16}" />
            </button>
            <button
                class="action-btn delete"
                on:click="{handleDelete}"
                title="Delete"
            >
                <Trash2 size="{16}" />
            </button>
        </div>
    {/if}

    {#if expanded && hasSubtasks}
        <div class="subtasks-container">
            <SubtaskList
                todoId="{todo.id}"
                subtasks="{todo.subtasks}"
                {readonly}
            />
        </div>
    {/if}
</div>

<style>
    .todo-item {
        background-color: #1e1e1e;
        border: 1px solid #2d2d2d;
        border-radius: 12px;
        padding: 1rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        position: relative;
        border-left: 4px solid transparent;
        transition: opacity 0.2s;
    }

    .todo-item.completed {
        opacity: 0.6;
    }

    .todo-item.priority-urgent {
        border-left-color: #ef4444;
    }
    .todo-item.priority-high {
        border-left-color: #f97316;
    }
    .todo-item.priority-medium {
        border-left-color: #eab308;
    }
    .todo-item.priority-low {
        border-left-color: #3b82f6;
    }

    .checkbox {
        background: transparent;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: flex-start;
        transition: color 0.2s;
    }

    .checkbox:hover {
        color: #bb86fc;
    }

    .checkbox:disabled {
        cursor: default;
    }

    .todo-item.completed .checkbox {
        color: #03dac6;
    }

    .todo-content {
        flex: 1;
        min-width: 0;
    }

    .todo-title {
        font-size: 1rem;
        font-weight: 500;
        color: #e1e1e1;
        margin: 0;
    }

    .todo-item.completed .todo-title {
        text-decoration: line-through;
        color: #888;
    }

    .todo-description {
        font-size: 0.875rem;
        color: #888;
        margin: 0.25rem 0 0 0;
    }

    .todo-item.completed .todo-description {
        text-decoration: line-through;
    }

    .edit-input {
        width: 100%;
        padding: 0.5rem 0.75rem;
        background-color: #2d2d2d;
        border: 1px solid #3d3d3d;
        border-radius: 6px;
        color: #e1e1e1;
        font-size: 1rem;
        outline: none;
    }

    .edit-input:focus {
        border-color: #bb86fc;
    }

    .subtask-toggle {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        margin-top: 0.5rem;
        padding: 0;
        background: transparent;
        border: none;
        color: #666;
        font-size: 0.75rem;
        cursor: pointer;
        transition: color 0.2s;
    }

    .subtask-toggle:hover {
        color: #888;
    }

    .todo-actions {
        display: flex;
        gap: 0.25rem;
        opacity: 0;
        transition: opacity 0.2s;
    }

    .todo-item:hover .todo-actions {
        opacity: 1;
    }

    .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: transparent;
        border: none;
        border-radius: 6px;
        color: #666;
        cursor: pointer;
        transition: all 0.2s;
    }

    .action-btn:hover {
        background-color: #2d2d2d;
        color: #e1e1e1;
    }

    .action-btn.delete:hover {
        color: #cf6679;
    }

    .subtasks-container {
        width: 100%;
        margin-top: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid #2d2d2d;
    }
</style>
