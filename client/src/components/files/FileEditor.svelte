<script>
    import { createEventDispatcher, onMount, onDestroy } from "svelte";
    import { X, Save, Download, FileText } from "lucide-svelte";
    import {
        saveFileContent,
        downloadFile,
        isSaving,
    } from "$lib/stores/fileStore.js";

    export let file = null;

    const dispatch = createEventDispatcher();

    let content = "";
    let originalContent = "";
    let hasChanges = false;
    let textareaEl;
    let isReady = false;

    $: if (file && file.content !== undefined) {
        content = file.content || "";
        originalContent = file.content || "";
        hasChanges = false;
        isReady = true;
    }

    function handleInput(event) {
        content = event.target.value;
        hasChanges = content !== originalContent;
    }

    async function handleSave() {
        if (!hasChanges || !file) return;

        try {
            await saveFileContent(file.id, content);
            originalContent = content;
            hasChanges = false;
        } catch (err) {
            console.error("Save failed:", err);
        }
    }

    function handleKeydown(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === "s") {
            event.preventDefault();
            event.stopPropagation();
            handleSave();
        }
    }

    function handleClose() {
        if (hasChanges) {
            if (confirm("You have unsaved changes. Discard them?")) {
                dispatch("close");
            }
        } else {
            dispatch("close");
        }
    }

    function handleDownload() {
        if (file) {
            downloadFile(file.id);
        }
    }

    function getLanguage(filename) {
        if (!filename) return "Plain Text";
        const ext = filename.split(".").pop()?.toLowerCase();
        switch (ext) {
            case "js":
            case "jsx":
                return "JavaScript";
            case "ts":
            case "tsx":
                return "TypeScript";
            case "json":
                return "JSON";
            case "html":
                return "HTML";
            case "css":
                return "CSS";
            case "md":
                return "Markdown";
            case "svelte":
                return "Svelte";
            case "vue":
                return "Vue";
            case "xml":
                return "XML";
            case "yaml":
            case "yml":
                return "YAML";
            case "txt":
                return "Plain Text";
            default:
                return "Plain Text";
        }
    }

    onMount(() => {
        window.addEventListener("keydown", handleKeydown);
    });

    onDestroy(() => {
        window.removeEventListener("keydown", handleKeydown);
    });

    $: if (isReady && textareaEl) {
        textareaEl.focus();
    }
</script>

{#if file}
    <div class="editor">
        <!-- Header -->
        <div class="editor-header">
            <div class="header-left">
                <FileText size="{18}" />
                <span class="filename">{file.name}</span>
                {#if hasChanges}
                    <span class="unsaved-badge">Unsaved</span>
                {/if}
            </div>

            <div class="header-right">
                <button
                    type="button"
                    class="header-btn"
                    on:click="{handleDownload}"
                    title="Download"
                >
                    <Download size="{18}" />
                </button>
                <button
                    type="button"
                    class="header-btn save"
                    class:active="{hasChanges}"
                    on:click="{handleSave}"
                    disabled="{!hasChanges || $isSaving}"
                    title="Save (Ctrl+S)"
                >
                    {#if $isSaving}
                        <div class="save-spinner"></div>
                    {:else}
                        <Save size="{18}" />
                    {/if}
                </button>
                <button
                    type="button"
                    class="header-btn close"
                    on:click="{handleClose}"
                    title="Close"
                >
                    <X size="{18}" />
                </button>
            </div>
        </div>

        <!-- Editor Body -->
        <div class="editor-body">
            <textarea
                bind:this="{textareaEl}"
                value="{content}"
                on:input="{handleInput}"
                placeholder="Start typing..."
                spellcheck="false"
            ></textarea>
        </div>

        <!-- Footer -->
        <div class="editor-footer">
            <span class="language">{getLanguage(file.name)}</span>
            <span class="stats">
                {content.length} characters
                {#if content}
                    • {content.split("\n").length} lines
                {/if}
            </span>
        </div>
    </div>
{:else}
    <div class="no-file">
        <p>No file selected</p>
    </div>
{/if}

<style>
    .editor {
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: #1a1a1a;
        border: 1px solid #2d2d2d;
        border-radius: 12px;
        overflow: hidden;
    }

    .editor-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        background-color: #242424;
        border-bottom: 1px solid #2d2d2d;
        flex-shrink: 0;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        color: #888;
        min-width: 0;
        overflow: hidden;
    }

    .filename {
        font-weight: 600;
        color: #e1e1e1;
        font-size: 0.9375rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .unsaved-badge {
        flex-shrink: 0;
        padding: 0.125rem 0.5rem;
        background-color: rgba(251, 191, 36, 0.2);
        border-radius: 4px;
        color: #fbbf24;
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
    }

    .header-right {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex-shrink: 0;
    }

    .header-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: transparent;
        border: none;
        border-radius: 8px;
        color: #888;
        cursor: pointer;
        transition: all 0.15s;
    }

    .header-btn:hover:not(:disabled) {
        background-color: #2d2d2d;
        color: #e1e1e1;
    }

    .header-btn.save.active {
        color: #bb86fc;
    }

    .header-btn.save.active:hover:not(:disabled) {
        background-color: rgba(187, 134, 252, 0.15);
    }

    .header-btn.close:hover {
        background-color: rgba(207, 102, 121, 0.15);
        color: #cf6679;
    }

    .header-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .save-spinner {
        width: 16px;
        height: 16px;
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

    .editor-body {
        flex: 1;
        overflow: hidden;
        display: flex;
        min-height: 0;
    }

    .editor-body textarea {
        flex: 1;
        width: 100%;
        height: 100%;
        padding: 1rem 1.25rem;
        background-color: #1a1a1a;
        border: none;
        color: #e1e1e1;
        font-family:
            "SF Mono", "Monaco", "Menlo", "Ubuntu Mono", "Consolas", monospace;
        font-size: 0.9rem;
        line-height: 1.7;
        resize: none;
        outline: none;
        tab-size: 2;
    }

    .editor-body textarea::placeholder {
        color: #555;
    }

    .editor-body textarea::-webkit-scrollbar {
        width: 10px;
    }

    .editor-body textarea::-webkit-scrollbar-track {
        background: transparent;
    }

    .editor-body textarea::-webkit-scrollbar-thumb {
        background: #3d3d3d;
        border-radius: 5px;
    }

    .editor-body textarea::-webkit-scrollbar-thumb:hover {
        background: #4d4d4d;
    }

    .editor-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 1rem;
        background-color: #242424;
        border-top: 1px solid #2d2d2d;
        font-size: 0.75rem;
        color: #666;
        flex-shrink: 0;
    }

    .language {
        padding: 0.125rem 0.5rem;
        background-color: #2d2d2d;
        border-radius: 4px;
        color: #888;
    }

    .stats {
        color: #666;
    }

    .no-file {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #1a1a1a;
        border: 1px solid #2d2d2d;
        border-radius: 12px;
        color: #666;
    }
</style>
