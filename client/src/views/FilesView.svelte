<script>
    import { onMount, onDestroy } from "svelte";
    import {
        FolderPlus,
        FilePlus,
        Upload,
        ChevronRight,
        Home,
        RefreshCw,
        X,
        File,
        Folder,
    } from "lucide-svelte";
    import {
        currentFolder,
        currentFiles,
        openFile,
        isLoadingFiles,
        loadFileTree,
        loadFolder,
        createFile,
        createFolder,
        uploadFile,
        closeFile,
        openFileForEdit,
    } from "$lib/stores/fileStore.js";
    import FileList from "$components/files/FileList.svelte";
    import FileEditor from "$components/files/FileEditor.svelte";

    let showDialog = false;
    let dialogType = "file";
    let dialogInputValue = "";
    let dialogInputEl;

    let fileInputEl;
    let breadcrumbs = [{ id: null, name: "My Files" }];
    let mounted = false;

    onMount(async () => {
        showDialog = false;
        dialogInputValue = "";
        mounted = true;

        await loadFileTree();
        await loadFolder(null);
    });

    onDestroy(() => {
        mounted = false;
    });

    function openNewFileDialog() {
        if (!mounted) return;
        dialogType = "file";
        dialogInputValue = "";
        showDialog = true;
        requestAnimationFrame(() => {
            dialogInputEl?.focus();
        });
    }

    function openNewFolderDialog() {
        if (!mounted) return;
        dialogType = "folder";
        dialogInputValue = "";
        showDialog = true;
        requestAnimationFrame(() => {
            dialogInputEl?.focus();
        });
    }

    function closeDialog() {
        showDialog = false;
        dialogInputValue = "";
    }

    async function submitDialog() {
        const name = dialogInputValue.trim();
        if (!name) return;

        closeDialog();

        try {
            if (dialogType === "file") {
                const file = await createFile(name, $currentFolder);
                if (file) {
                    await openFileForEdit(file.id);
                }
            } else {
                await createFolder(name, $currentFolder);
            }
        } catch (err) {
            console.error("Create failed:", err);
        }
    }

    function handleDialogKeydown(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            submitDialog();
        } else if (event.key === "Escape") {
            event.preventDefault();
            closeDialog();
        }
    }

    function handleOverlayClick(event) {
        if (event.target === event.currentTarget) {
            closeDialog();
        }
    }

    function handleFileInputChange(event) {
        const files = event.target.files;
        if (files && files.length > 0) {
            Array.from(files).forEach(async (file) => {
                await uploadFile(file, $currentFolder);
            });
        }
        event.target.value = "";
    }

    function clickUpload() {
        fileInputEl?.click();
    }

    async function onFolderOpen(event) {
        const folder = event.detail;
        breadcrumbs = [...breadcrumbs, { id: folder.id, name: folder.name }];
        await loadFolder(folder.id);
    }

    async function navigateTo(index) {
        const crumb = breadcrumbs[index];
        breadcrumbs = breadcrumbs.slice(0, index + 1);
        await loadFolder(crumb.id);
    }

    async function refresh() {
        await loadFileTree();
        await loadFolder($currentFolder);
    }

    function closeEditor() {
        closeFile();
    }
</script>

<div class="files-view">
    <!-- Header -->
    <div class="view-header">
        <div class="header-left">
            <h1>Files</h1>
            <p>Manage your notes and documents</p>
        </div>

        <div class="header-actions">
            <button
                class="action-btn"
                on:click="{refresh}"
                disabled="{$isLoadingFiles}"
            >
                <RefreshCw
                    size="{18}"
                    class="{$isLoadingFiles ? 'spinning' : ''}"
                />
            </button>
            <button class="action-btn" on:click="{openNewFolderDialog}">
                <FolderPlus size="{18}" />
                <span>New Folder</span>
            </button>
            <button class="action-btn" on:click="{openNewFileDialog}">
                <FilePlus size="{18}" />
                <span>New File</span>
            </button>
            <button class="action-btn primary" on:click="{clickUpload}">
                <Upload size="{18}" />
                <span>Upload</span>
            </button>
            <input
                bind:this="{fileInputEl}"
                type="file"
                multiple
                hidden
                on:change="{handleFileInputChange}"
            />
        </div>
    </div>

    <!-- Breadcrumbs -->
    <nav class="breadcrumbs">
        {#each breadcrumbs as crumb, index}
            {#if index > 0}
                <span class="breadcrumb-sep"><ChevronRight size="{14}" /></span>
            {/if}
            <button
                class="breadcrumb-btn"
                class:active="{index === breadcrumbs.length - 1}"
                on:click="{() => navigateTo(index)}"
            >
                {#if index === 0}
                    <Home size="{14}" />
                {/if}
                <span>{crumb.name}</span>
            </button>
        {/each}
    </nav>

    <!-- Content -->
    <div class="files-content">
        <div class="file-list-panel" class:hidden="{$openFile}">
            {#if $isLoadingFiles && $currentFiles.length === 0}
                <div class="loading">
                    <div class="spinner"></div>
                </div>
            {:else}
                <FileList
                    files="{$currentFiles}"
                    on:folderOpen="{onFolderOpen}"
                />
            {/if}
        </div>

        {#if $openFile}
            <div class="editor-panel">
                <FileEditor file="{$openFile}" on:close="{closeEditor}" />
            </div>
        {/if}
    </div>
</div>

<!-- Create Dialog -->
{#if showDialog === true}
    <div
        class="overlay"
        on:click="{handleOverlayClick}"
        role="dialog"
        aria-modal="true"
    >
        <div class="modal">
            <div class="modal-header">
                <div
                    class="modal-icon"
                    class:folder="{dialogType === 'folder'}"
                >
                    {#if dialogType === "file"}
                        <File size="{20}" />
                    {:else}
                        <Folder size="{20}" />
                    {/if}
                </div>
                <h3>
                    {dialogType === "file"
                        ? "Create New File"
                        : "Create New Folder"}
                </h3>
                <button class="modal-close" on:click="{closeDialog}">
                    <X size="{18}" />
                </button>
            </div>
            <div class="modal-body">
                <label for="create-name"
                    >{dialogType === "file"
                        ? "File name"
                        : "Folder name"}</label
                >
                <input
                    bind:this="{dialogInputEl}"
                    id="create-name"
                    type="text"
                    placeholder="{dialogType === 'file'
                        ? 'filename.txt'
                        : 'New Folder'}"
                    bind:value="{dialogInputValue}"
                    on:keydown="{handleDialogKeydown}"
                />
                {#if dialogType === "file"}
                    <p class="hint">
                        Include file extension (e.g., .txt, .md, .json)
                    </p>
                {/if}
            </div>
            <div class="modal-footer">
                <button class="btn cancel" on:click="{closeDialog}"
                    >Cancel</button
                >
                <button
                    class="btn primary"
                    on:click="{submitDialog}"
                    disabled="{!dialogInputValue.trim()}">Create</button
                >
            </div>
        </div>
    </div>
{/if}

<style>
    .files-view {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .view-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 1.5rem;
    }

    .header-left h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #e1e1e1;
        margin: 0;
    }

    .header-left p {
        font-size: 0.875rem;
        color: #888;
        margin: 0.25rem 0 0 0;
    }

    .header-actions {
        display: flex;
        gap: 0.5rem;
    }

    .action-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.875rem;
        background-color: #2d2d2d;
        border: 1px solid #3d3d3d;
        border-radius: 8px;
        color: #e1e1e1;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .action-btn:hover:not(:disabled) {
        background-color: #3d3d3d;
    }

    .action-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .action-btn.primary {
        background-color: #bb86fc;
        border-color: #bb86fc;
        color: #000;
    }

    .action-btn.primary:hover {
        background-color: #a66df0;
    }

    :global(.spinning) {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .breadcrumbs {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #2d2d2d;
        overflow-x: auto;
    }

    .breadcrumb-sep {
        display: flex;
        color: #666;
    }

    .breadcrumb-btn {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.625rem;
        background: transparent;
        border: none;
        border-radius: 6px;
        color: #888;
        font-size: 0.875rem;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s;
    }

    .breadcrumb-btn:hover {
        background-color: #2d2d2d;
        color: #e1e1e1;
    }

    .breadcrumb-btn.active {
        color: #e1e1e1;
        font-weight: 500;
    }

    .files-content {
        flex: 1;
        display: flex;
        gap: 1rem;
        overflow: hidden;
        min-height: 0;
    }

    .file-list-panel {
        flex: 1;
        overflow-y: auto;
    }

    .file-list-panel.hidden {
        display: none;
    }

    @media (min-width: 1024px) {
        .file-list-panel.hidden {
            display: block;
            flex: 0 0 40%;
        }
    }

    .editor-panel {
        flex: 1;
        overflow: hidden;
    }

    @media (min-width: 1024px) {
        .editor-panel {
            flex: 0 0 60%;
        }
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

    /* Modal/Dialog */
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    }

    .modal {
        width: 420px;
        max-width: calc(100% - 2rem);
        background: #1e1e1e;
        border: 1px solid #3d3d3d;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #2d2d2d;
    }

    .modal-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #2d2d2d;
        border-radius: 10px;
        color: #888;
    }

    .modal-icon.folder {
        background: rgba(187, 134, 252, 0.15);
        color: #bb86fc;
    }

    .modal-header h3 {
        flex: 1;
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #e1e1e1;
    }

    .modal-close {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        border-radius: 8px;
        color: #888;
        cursor: pointer;
    }

    .modal-close:hover {
        background: #2d2d2d;
        color: #e1e1e1;
    }

    .modal-body {
        padding: 1.5rem;
    }

    .modal-body label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #aaa;
    }

    .modal-body input {
        width: 100%;
        padding: 0.875rem 1rem;
        background: #2d2d2d;
        border: 1px solid #3d3d3d;
        border-radius: 8px;
        color: #e1e1e1;
        font-size: 1rem;
        outline: none;
    }

    .modal-body input:focus {
        border-color: #bb86fc;
    }

    .modal-body input::placeholder {
        color: #666;
    }

    .hint {
        margin: 0.5rem 0 0;
        font-size: 0.75rem;
        color: #666;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        background: #171717;
        border-top: 1px solid #2d2d2d;
        border-radius: 0 0 16px 16px;
    }

    .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-size: 0.9375rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn.cancel {
        background: #2d2d2d;
        color: #e1e1e1;
    }

    .btn.cancel:hover {
        background: #3d3d3d;
    }

    .btn.primary {
        background: #bb86fc;
        color: #000;
    }

    .btn.primary:hover:not(:disabled) {
        background: #a66df0;
    }

    .btn.primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
