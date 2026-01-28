<script>
    import { createEventDispatcher } from "svelte";
    import { X, Plus } from "lucide-svelte";
    import { viewMode } from "$lib/stores/viewStore.js";

    const dispatch = createEventDispatcher();

    let title = "";
    let description = "";
    let deadline = "";
    let priority = "none";
    let titleInput;

    export function focus() {
        titleInput?.focus();
    }

    function handleSubmit() {
        if (!title.trim()) return;

        dispatch("submit", {
            title: title.trim(),
            description: description.trim() || null,
            deadline: $viewMode === "global" ? deadline || null : null,
            priority,
        });

        title = "";
        description = "";
        deadline = "";
        priority = "none";
    }

    function handleCancel() {
        dispatch("cancel");
    }

    function handleKeydown(event) {
        if (event.key === "Escape") {
            handleCancel();
        } else if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            handleSubmit();
        }
    }
</script>

<div class="todo-form">
    <input
        bind:this="{titleInput}"
        type="text"
        class="form-input"
        placeholder="Task title..."
        bind:value="{title}"
        on:keydown="{handleKeydown}"
    />

    <textarea
        class="form-textarea"
        placeholder="Description (optional)"
        rows="2"
        bind:value="{description}"
        on:keydown="{handleKeydown}"
    ></textarea>

    <div class="form-row">
        {#if $viewMode === "global"}
            <div class="form-field">
                <label>Deadline</label>
                <input type="date" class="form-input" bind:value="{deadline}" />
            </div>
        {/if}

        <div class="form-field">
            <label>Priority</label>
            <select class="form-input" bind:value="{priority}">
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
            </select>
        </div>
    </div>

    <div class="form-actions">
        <button type="button" class="btn-cancel" on:click="{handleCancel}">
            <X size="{18}" />
            <span>Cancel</span>
        </button>
        <button
            type="button"
            class="btn-submit"
            on:click="{handleSubmit}"
            disabled="{!title.trim()}"
        >
            <Plus size="{18}" />
            <span>Add Task</span>
        </button>
    </div>
</div>

<style>
    .todo-form {
        background-color: #1e1e1e;
        border: 1px solid #2d2d2d;
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .form-input,
    .form-textarea {
        width: 100%;
        padding: 0.75rem;
        background-color: #2d2d2d;
        border: 1px solid #3d3d3d;
        border-radius: 8px;
        color: #e1e1e1;
        font-size: 0.9375rem;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s;
    }

    .form-input:focus,
    .form-textarea:focus {
        border-color: #bb86fc;
    }

    .form-input::placeholder,
    .form-textarea::placeholder {
        color: #666;
    }

    .form-textarea {
        resize: none;
    }

    .form-row {
        display: flex;
        gap: 0.75rem;
    }

    .form-field {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
    }

    .form-field label {
        font-size: 0.75rem;
        color: #888;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        padding-top: 0.5rem;
    }

    .btn-cancel,
    .btn-submit {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-cancel {
        background-color: transparent;
        color: #888;
    }

    .btn-cancel:hover {
        background-color: #2d2d2d;
        color: #e1e1e1;
    }

    .btn-submit {
        background-color: #bb86fc;
        color: #000;
    }

    .btn-submit:hover:not(:disabled) {
        background-color: #a66df0;
    }

    .btn-submit:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
