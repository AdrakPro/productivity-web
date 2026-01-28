<script>
    import { onMount } from "svelte";
    import { Archive, Trash2, RefreshCw } from "lucide-svelte";
    import {
        archivedTodos,
        loadArchivedTodos,
        deleteTodo,
    } from "$lib/stores/todoStore.js";

    let isLoading = true;

    onMount(async () => {
        await loadArchivedTodos();
        isLoading = false;
    });

    function formatDate(dateStr) {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    async function handleDelete(id) {
        if (confirm("Permanently delete this task?")) {
            await deleteTodo(id);
            await loadArchivedTodos();
        }
    }

    async function handleRefresh() {
        isLoading = true;
        await loadArchivedTodos();
        isLoading = false;
    }
</script>

<div class="archive-view">
    <!-- Header -->
    <div class="view-header">
        <div class="header-left">
            <div class="header-icon">
                <Archive size="{24}" />
            </div>
            <div class="header-text">
                <h1>Archive</h1>
                <p>Completed and archived tasks</p>
            </div>
        </div>
        <button
            class="refresh-btn"
            on:click="{handleRefresh}"
            disabled="{isLoading}"
        >
            <RefreshCw size="{18}" class="{isLoading ? 'spinning' : ''}" />
        </button>
    </div>

    <!-- Content -->
    <div class="archive-content">
        {#if isLoading}
            <div class="loading">
                <div class="spinner"></div>
            </div>
        {:else if $archivedTodos.length === 0}
            <div class="empty-state">
                <Archive size="{48}" />
                <h3>No archived tasks yet</h3>
                <p>Completed tasks will appear here</p>
            </div>
        {:else}
            <div class="archive-list">
                {#each $archivedTodos as todo (todo.id)}
                    <div class="archive-item">
                        <div class="item-content">
                            <h3 class="item-title">{todo.title}</h3>
                            {#if todo.description}
                                <p class="item-description">
                                    {todo.description}
                                </p>
                            {/if}
                            <div class="item-meta">
                                {#if todo.completed_at}
                                    <span
                                        >Completed: {formatDate(
                                            todo.completed_at
                                        )}</span
                                    >
                                {/if}
                                {#if todo.due_date}
                                    <span>Due: {todo.due_date}</span>
                                {/if}
                            </div>
                        </div>
                        <button
                            class="delete-btn"
                            on:click="{() => handleDelete(todo.id)}"
                            title="Delete permanently"
                        >
                            <Trash2 size="{16}" />
                        </button>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .archive-view {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .view-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .header-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background-color: rgba(187, 134, 252, 0.15);
        border-radius: 12px;
        color: #bb86fc;
    }

    .header-text h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #e1e1e1;
        margin: 0;
    }

    .header-text p {
        font-size: 0.875rem;
        color: #888;
        margin: 0.25rem 0 0 0;
    }

    .refresh-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: transparent;
        border: 1px solid #3d3d3d;
        border-radius: 8px;
        color: #888;
        cursor: pointer;
        transition: all 0.2s;
    }

    .refresh-btn:hover:not(:disabled) {
        background-color: #2d2d2d;
        color: #e1e1e1;
    }

    .refresh-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    :global(.spinning) {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .archive-content {
        flex: 1;
        overflow-y: auto;
    }

    .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4rem;
    }

    .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #2d2d2d;
        border-top-color: #bb86fc;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .empty-state {
        background-color: #1e1e1e;
        border: 1px solid #2d2d2d;
        border-radius: 12px;
        padding: 4rem 2rem;
        text-align: center;
        color: #666;
    }

    .empty-state h3 {
        font-size: 1.125rem;
        color: #888;
        margin: 1rem 0 0.5rem 0;
    }

    .empty-state p {
        font-size: 0.875rem;
        color: #666;
        margin: 0;
    }

    .archive-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .archive-item {
        background-color: #1e1e1e;
        border: 1px solid #2d2d2d;
        border-radius: 12px;
        padding: 1rem 1.25rem;
        display: flex;
        align-items: flex-start;
        gap: 1rem;
    }

    .item-content {
        flex: 1;
        min-width: 0;
    }

    .item-title {
        font-size: 1rem;
        font-weight: 500;
        color: #888;
        text-decoration: line-through;
        margin: 0;
    }

    .item-description {
        font-size: 0.875rem;
        color: #666;
        text-decoration: line-through;
        margin: 0.25rem 0 0 0;
    }

    .item-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-top: 0.75rem;
        font-size: 0.75rem;
        color: #666;
    }

    .delete-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: transparent;
        border: none;
        border-radius: 8px;
        color: #666;
        cursor: pointer;
        opacity: 0;
        transition: all 0.2s;
    }

    .archive-item:hover .delete-btn {
        opacity: 1;
    }

    .delete-btn:hover {
        background-color: rgba(207, 102, 121, 0.15);
        color: #cf6679;
    }
</style>
