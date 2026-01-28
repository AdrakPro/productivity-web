import { writable, get } from "svelte/store";
import { filesApi } from "../services/api.js";
import { success, error as errorToast } from "./toastStore.js";

export const fileTree = writable([]);
export const currentFolder = writable(null);
export const currentFiles = writable([]);
export const openFile = writable(null);
export const isLoadingFiles = writable(false);
export const isSaving = writable(false);

export async function loadFileTree() {
    isLoadingFiles.set(true);
    try {
        const tree = await filesApi.getTree();
        fileTree.set(tree || []);
    } catch (err) {
        console.error("Failed to load file tree:", err);
        errorToast("Failed to load files");
        fileTree.set([]);
    } finally {
        isLoadingFiles.set(false);
    }
}

export async function loadFolder(parentId = null) {
    isLoadingFiles.set(true);
    currentFolder.set(parentId);
    try {
        const files = await filesApi.getFolder(parentId);
        currentFiles.set(files || []);
    } catch (err) {
        console.error("Failed to load folder:", err);
        errorToast("Failed to load folder");
        currentFiles.set([]);
    } finally {
        isLoadingFiles.set(false);
    }
}

export async function openFileForEdit(fileId) {
    try {
        console.log("Opening file:", fileId);
        const file = await filesApi.getFile(fileId);
        console.log("File loaded:", file);

        if (file) {
            file.content = file.content ?? "";
            openFile.set(file);
        }
        return file;
    } catch (err) {
        console.error("Failed to open file:", err);
        errorToast("Failed to open file");
        throw err;
    }
}

export function closeFile() {
    openFile.set(null);
}

export async function createFile(name, parentId = null, content = "") {
    try {
        const file = await filesApi.createFile({ name, parentId, content });
        await loadFileTree();
        await loadFolder(parentId);
        success("File created");
        return file;
    } catch (err) {
        console.error("Failed to create file:", err);
        errorToast(err.message || "Failed to create file");
        throw err;
    }
}

export async function createFolder(name, parentId = null) {
    try {
        const folder = await filesApi.createFolder({ name, parentId });
        await loadFileTree();
        await loadFolder(parentId);
        success("Folder created");
        return folder;
    } catch (err) {
        console.error("Failed to create folder:", err);
        errorToast(err.message || "Failed to create folder");
        throw err;
    }
}

export async function saveFileContent(fileId, content) {
    isSaving.set(true);
    try {
        const updated = await filesApi.updateContent(fileId, content);

        const current = get(openFile);
        if (current && current.id === fileId) {
            openFile.set({
                ...current,
                content: content,
                size: updated.size,
                updated_at: updated.updated_at,
            });
        }

        success("Saved");
        return updated;
    } catch (err) {
        console.error("Failed to save file:", err);
        errorToast("Failed to save file");
        throw err;
    } finally {
        isSaving.set(false);
    }
}

export async function renameFile(fileId, newName) {
    try {
        const updated = await filesApi.rename(fileId, newName);
        await loadFileTree();
        await loadFolder(get(currentFolder));

        const current = get(openFile);
        if (current && current.id === fileId) {
            openFile.set({ ...current, name: newName });
        }

        success("Renamed");
        return updated;
    } catch (err) {
        console.error("Failed to rename:", err);
        errorToast(err.message || "Failed to rename");
        throw err;
    }
}

export async function deleteFile(fileId) {
    try {
        await filesApi.delete(fileId);
        await loadFileTree();
        await loadFolder(get(currentFolder));

        const current = get(openFile);
        if (current && current.id === fileId) {
            openFile.set(null);
        }

        success("Deleted");
    } catch (err) {
        console.error("Failed to delete:", err);
        errorToast("Failed to delete");
        throw err;
    }
}

export async function moveFile(fileId, newParentId) {
    try {
        await filesApi.move(fileId, newParentId);
        await loadFileTree();
        await loadFolder(get(currentFolder));
        success("Moved");
    } catch (err) {
        console.error("Failed to move:", err);
        errorToast("Failed to move");
        throw err;
    }
}

export async function uploadFile(file, parentId = null) {
    try {
        const result = await filesApi.upload(file, parentId);
        await loadFileTree();
        await loadFolder(parentId);
        success("File uploaded");
        return result;
    } catch (err) {
        console.error("Failed to upload:", err);
        errorToast("Failed to upload file");
        throw err;
    }
}

export function downloadFile(fileId) {
    const url = filesApi.getDownloadUrl(fileId);
    window.open(url, "_blank");
}
