<script>
    import { Plus, CheckCircle2 } from "lucide-svelte";
    import {
        filteredTodos,
        pendingCount,
        addTodo,
        isLoading,
    } from "$lib/stores/todoStore.js";
    import {
        viewMode,
        selectedDate,
        isPastDate,
    } from "$lib/stores/viewStore.js";
    import TodoItem from "./TodoItem.svelte";
    import TodoForm from "./TodoForm.svelte";

    let showAddForm = false;
    let todoFormRef;

    export function triggerNewTask() {
        const canAdd = !($viewMode === "daily" && $isPastDate);
        if (canAdd) {
            showAddForm = true;
            setTimeout(() => todoFormRef?.focus?.(), 50);
        }
    }

    async function handleAddTodo(event) {
        const { title, description, deadline, priority } = event.detail;
        await addTodo({
            title,
            description,
            due_date: $viewMode === "global" ? deadline : $selectedDate,
            is_global: $viewMode === "global",
            priority: priority || "none",
        });
        showAddForm = false;
    }

    function cancelAdd() {
        showAddForm = false;
    }

    $: totalTasks = $filteredTodos.length;
    $: completedTasks = totalTasks - $pendingCount;
    $: allDone = totalTasks > 0 && $pendingCount === 0;
    $: canAddTasks = !($viewMode === "daily" && $isPastDate);
    $: progressPercent =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
</script>

<div class="todo-list-container">
    <!-- Add Todo Section -->
    {#if canAddTasks}
        {#if showAddForm}
            <TodoForm
                bind:this="{todoFormRef}"
                on:submit="{handleAddTodo}"
                on:cancel="{cancelAdd}"
            />
        {:else}
            <button class="add-btn" on:click="{() => (showAddForm = true)}">
                <Plus size="{20}" />
                <span>Add New Task</span>
                <kbd>N</kbd>
            </button>
        {/if}
    {/if}

    <!-- Todo List -->
    <div class="todo-list">
        {#if $isLoading}
            <div class="loading">
                <div class="spinner"></div>
            </div>
        {:else if $filteredTodos.length === 0}
            <div class="empty-state">
                <p>
                    {#if $viewMode === "daily" && $isPastDate}
                        No tasks were recorded for this day
                    {:else}
                        No tasks yet. Press <kbd>N</kbd> to add your first task!
                    {/if}
                </p>
            </div>
        {:else}
            {#each $filteredTodos as todo (todo.id)}
                <TodoItem
                    {todo}
                    readonly="{$viewMode === 'daily' && $isPastDate}"
                />
            {/each}
        {/if}
    </div>

    <!-- Status Footer -->
    {#if totalTasks > 0}
        <div class="todo-footer">
            {#if allDone}
                <div class="all-done">
                    <CheckCircle2 size="{20}" />
                    <span
                        >All {totalTasks} task{totalTasks !== 1 ? "s" : ""} completed!
                        🎉</span
                    >
                </div>
            {:else}
                <div class="progress-info">
                    <span class="remaining"
                        >{$pendingCount} task{$pendingCount !== 1 ? "s" : ""} remaining</span
                    >
                    <span class="done">{completedTasks}/{totalTasks} done</span>
                </div>
                <div class="progress-bar">
                    <div
                        class="progress-fill"
                        style="width: {progressPercent}%"
                    ></div>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .todo-list-container {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
    }

    .add-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.875rem 1rem;
        background-color: #bb86fc;
        border: none;
        border-radius: 10px;
        color: #000;
        font-size: 0.9375rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
        margin-bottom: 1rem;
    }

    .add-btn:hover {
        background-color: #a66df0;
    }

    .add-btn kbd {
        padding: 0.125rem 0.5rem;
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        font-size: 0.75rem;
        font-family: inherit;
    }

    .todo-list {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem;
    }

    .spinner {
        width: 24px;
        height: 24px;
        border: 2px solid #3d3d3d;
        border-top-color: #bb86fc;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .empty-state {
        background-color: #1e1e1e;
        border: 1px solid #2d2d2d;
        border-radius: 12px;
        padding: 3rem;
        text-align: center;
    }

    .empty-state p {
        color: #888;
        margin: 0;
    }

    .empty-state kbd {
        display: inline-block;
        padding: 0.125rem 0.5rem;
        background-color: #2d2d2d;
        border-radius: 4px;
        font-size: 0.875rem;
        color: #e1e1e1;
    }

    .todo-footer {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #2d2d2d;
    }

    .all-done {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        color: #03dac6;
        font-weight: 500;
    }

    .progress-info {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
    }

    .remaining {
        color: #888;
    }

    .done {
        color: #666;
    }

    .progress-bar {
        height: 4px;
        background-color: #2d2d2d;
        border-radius: 2px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background-color: #bb86fc;
        transition: width 0.3s ease;
    }
</style>
