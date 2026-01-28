import { writable } from "svelte/store";

export const toasts = writable([]);

let toastId = 0;

function addToast(message, type = "info", duration = 3000) {
    const id = ++toastId;
    toasts.update((t) => [...t, { id, message, type }]);

    if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
    }

    return id;
}

export function removeToast(id) {
    toasts.update((t) => t.filter((toast) => toast.id !== id));
}

export function success(message, duration = 3000) {
    return addToast(message, "success", duration);
}

export function error(message, duration = 4000) {
    return addToast(message, "error", duration);
}

export function info(message, duration = 3000) {
    return addToast(message, "info", duration);
}

export function warning(message, duration = 3500) {
    return addToast(message, "warning", duration);
}
