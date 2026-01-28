<script>
    import { createEventDispatcher } from "svelte";
    import {
        Folder,
        File,
        FileText,
        FileCode,
        FileJson,
        Image,
        MoreVertical,
        Pencil,
        Trash2,
        Download,
        FolderOpen,
    } from "lucide-svelte";
    import {
        openFileForEdit,
        renameFile,
        deleteFile,
        downloadFile,
    } from "$lib/stores/fileStore.js";

    export let files = [];

    const dispatch = createEventDispatcher();

    let contextMenu = { show: false, x: 0, y: 0, file: null };
    let renameDialogOpen = false;
    let renameDialogFile = null;
    let renameDialogName = "";

    function getFileIcon(file) {
        if (file.type === "folder") return Folder;
        const ext = file.name.split(".").pop()?.toLowerCase();
        switch (ext) {
            case "js":
            case "ts":
            case "jsx":
            case "tsx":
            case "html":
            case "css":
            case "svelte":
            case "vue":
                return FileCode;
            case "json":
                return FileJson;
            case "md":
            case "txt":
                return FileText;
            case "png":
            case "jpg":
            case "jpeg":
            case "gif":
            case "webp":
            case "svg":
                return Image;
            default:
                return File;
        }
    }

    function formatSize(bytes) {
        if (!bytes) return "-";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function formatDate(dateStr) {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    function isEditable(file) {
        if (file.type === "folder") return false;
        const ext = file.name.split(".").pop()?.toLowerCase();
        const editableExts = [
            "txt",
            "md",
            "json",
            "js",
            "ts",
            "jsx",
            "tsx",
            "html",
            "css",
            "xml",
            "yaml",
            "yml",
            "svelte",
            "vue",
        ];
        return (
            editableExts.includes(ext) || file.mime_type?.startsWith("text/")
        );
    }

    async function handleClick(file) {
        if (file.type === "folder") {
            dispatch("folderOpen", file);
        } else if (isEditable(file)) {
            await openFileForEdit(file.id);
        }
    }

    async function handleDoubleClick(file) {
        if (file.type !== "folder" && !isEditable(file)) {
            downloadFile(file.id);
        }
    }

    function showContextMenu(event, file) {
        event.preventDefault();
        event.stopPropagation();
        contextMenu = {
            show: true,
            x: Math.min(event.clientX, window.innerWidth - 160),
            y: Math.min(event.clientY, window.innerHeight - 150),
            file,
        };
    }

    function closeContextMenu() {
        contextMenu = { show: false, x: 0, y: 0, file: null };
    }

    function openRenameDialog(file) {
        renameDialogFile = file;
        renameDialogName = file.name;
        renameDialogOpen = true;
        closeContextMenu();
    }

    function closeRenameDialog() {
        renameDialogOpen = false;
        renameDialogFile = null;
        renameDialogName = "";
    }

    async function handleRename() {
        if (
            renameDialogName.trim() &&
            renameDialogName !== renameDialogFile.name
        ) {
            await renameFile(renameDialogFile.id, renameDialogName.trim());
        }
        closeRenameDialog();
    }

    function handleRenameKeydown(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            handleRename();
        } else if (event.key === "Escape") {
            event.preventDefault();
            closeRenameDialog();
        }
    }

    async function handleDelete(file) {
        const type =
            file.type === "folder" ? "folder and all its contents" : "file";
        if (confirm(`Delete this ${type}?\n\n"${file.name}"`)) {
            await deleteFile(file.id);
        }
        closeContextMenu();
    }

    function handleDownload(file) {
        downloadFile(file.id);
        closeContextMenu();
    }

    function handleWindowClick() {
        closeContextMenu();
    }
</script>

<svelte:window on:click="{handleWindowClick}" />

{#if files.length === 0}
    <div class="empty-state">
        <FolderOpen size="{48}" />
        <h3>This folder is empty</h3>
        <p>Create a new file or folder to get started</p>
    </div>
{:else}
    <div class="file-list">
        {#each files as file (file.id)}
            <button
                class="file-item"
                on:click="{() => handleClick(file)}"
                on:dblclick="{() => handleDoubleClick(file)}"
                on:contextmenu="{(e) => showContextMenu(e, file)}"
            >
                <span class="file-icon" class:folder="{file.type === 'folder'}">
                    <svelte:component this="{getFileIcon(file)}" size="{20}" />
                </span>
                <span class="file-name">{file.name}</span>
                <span class="file-size"
                    >{file.type === "folder"
                        ? "-"
                        : formatSize(file.size)}</span
                >
                <span class="file-date">{formatDate(file.updated_at)}</span>
                <button
                    class="more-btn"
                    on:click|stopPropagation="{(e) => showContextMenu(e, file)}"
                >
                    <MoreVertical size="{16}" />
                </button>
            </button>
        {/each}
    </div>
{/if}

<!-- Context Menu -->
{#if contextMenu.show}
    <div
        class="context-menu"
        style="left: {contextMenu.x}px; top: {contextMenu.y}px;"
    >
        {#if contextMenu.file.type === "file"}
            <button
                class="menu-item"
                on:click="{() => handleDownload(contextMenu.file)}"
            >
                <Download size="{14}" />
                <span>Download</span>
            </button>
        {/if}
        <button
            class="menu-item"
            on:click="{() => openRenameDialog(contextMenu.file)}"
        >
            <Pencil size="{14}" />
            <span>Rename</span>
        </button>
        <div class="menu-divider"></div>
        <button
            class="menu-item danger"
            on:click="{() => handleDelete(contextMenu.file)}"
        >
            <Trash2 size="{14}" />
            <span>Delete</span>
        </button>
    </div>
{/if}

<!-- Rename Dialog -->
{#if renameDialogOpen}
    <div
        class="dialog-overlay"
        on:click="{closeRenameDialog}"
        on:keydown="{(e) => e.key === 'Escape' && closeRenameDialog()}"
    >
        <div class="dialog" on:click|stopPropagation>
            <h3>Rename</h3>
            <input
                type="text"
                bind:value="{renameDialogName}"
                on:keydown="{handleRenameKeydown}"
                autofocus
            />
            <div class="dialog-actions">
                <button class="btn-secondary" on:click="{closeRenameDialog}"
                    >Cancel</button
                >
                <button class="btn-primary" on:click="{handleRename}"
                    >Rename</button
                >
            </div>
        </div>
    </div>
{/if}

<style>
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

    .file-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .file-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.75rem 1rem;
        background: transparent;
        border: none;
        border-radius: 8px;
        color: #e1e1e1;
        font-size: 0.875rem;
        text-align: left;
        cursor: pointer;
        transition: background-color 0.15s;
    }

    .file-item:hover {
        background-color: #2d2d2d;
    }

    .file-icon {
        display: flex;
        color: #888;
    }

    .file-icon.folder {
        color: #bb86fc;
    }

    .file-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .file-size {
        width: 80px;
        text-align: right;
        color: #666;
        font-size: 0.75rem;
    }

    .file-date {
        width: 100px;
        text-align: right;
        color: #666;
        font-size: 0.75rem;
    }

    .more-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: transparent;
        border: none;
        border-radius: 6px;
        color: #666;
        cursor: pointer;
        opacity: 0;
        transition: all 0.15s;
    }

    .file-item:hover .more-btn {
        opacity: 1;
    }

    .more-btn:hover {
        background-color: #3d3d3d;
        color: #e1e1e1;
    }

    /* Context Menu */
    .context-menu {
        position: fixed;
        min-width: 150px;
        background-color: #2d2d2d;
        border: 1px solid #3d3d3d;
        border-radius: 8px;
        padding: 0.375rem;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        z-index: 1000;
    }

    .menu-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.625rem 0.75rem;
        background: transparent;
        border: none;
        border-radius: 6px;
        color: #e1e1e1;
        font-size: 0.875rem;
        text-align: left;
        cursor: pointer;
        transition: background-color 0.15s;
    }

    .menu-item:hover {
        background-color: #3d3d3d;
    }

    .menu-item.danger {
        color: #cf6679;
    }

    .menu-divider {
        height: 1px;
        background-color: #3d3d3d;
        margin: 0.375rem 0;
    }

    /* Dialog */
    .dialog-overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: 1rem;
    }

    .dialog {
        width: 100%;
        max-width: 400px;
        background-color: #1e1e1e;
        border: 1px solid #2d2d2d;
        border-radius: 12px;
        padding: 1.5rem;
    }

    .dialog h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #e1e1e1;
        margin: 0 0 1rem 0;
    }

    .dialog input {
        width: 100%;
        padding: 0.75rem;
        background-color: #2d2d2d;
        border: 1px solid #3d3d3d;
        border-radius: 8px;
        color: #e1e1e1;
        font-size: 0.9375rem;
        outline: none;
        margin-bottom: 1rem;
    }

    .dialog input:focus {
        border-color: #bb86fc;
    }

    .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
    }

    .btn-primary,
    .btn-secondary {
        padding: 0.625rem 1rem;
        border: none;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-primary {
        background-color: #bb86fc;
        color: #000;
    }

    .btn-primary:hover {
        background-color: #a66df0;
    }

    .btn-secondary {
        background-color: #2d2d2d;
        color: #e1e1e1;
    }

    .btn-secondary:hover {
        background-color: #3d3d3d;
    }
</style>
