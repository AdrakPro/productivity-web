<script>
    import {
        X,
        CheckCircle,
        AlertCircle,
        Info,
        AlertTriangle,
    } from "lucide-svelte";
    import { toasts, removeToast } from "$lib/stores/toastStore.js";

    function getIcon(type) {
        switch (type) {
            case "success":
                return CheckCircle;
            case "error":
                return AlertCircle;
            case "warning":
                return AlertTriangle;
            default:
                return Info;
        }
    }

    function getClass(type) {
        switch (type) {
            case "success":
                return "toast-success";
            case "error":
                return "toast-error";
            case "warning":
                return "toast-warning";
            default:
                return "toast-info";
        }
    }
</script>

<div class="toast-container">
    {#each $toasts as toast (toast.id)}
        <div class="toast {getClass(toast.type)}">
            <svelte:component this="{getIcon(toast.type)}" size="{18}" />
            <span class="toast-message">{toast.message}</span>
            <button
                class="toast-close"
                on:click="{() => removeToast(toast.id)}"
            >
                <X size="{14}" />
            </button>
        </div>
    {/each}
</div>

<style>
    .toast-container {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-width: 350px;
    }

    .toast {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.875rem 1rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.2s ease-out;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .toast-success {
        background-color: #03dac6;
        color: #000;
    }

    .toast-error {
        background-color: #cf6679;
        color: #000;
    }

    .toast-warning {
        background-color: #fb8c00;
        color: #000;
    }

    .toast-info {
        background-color: #2d2d2d;
        color: #e1e1e1;
        border: 1px solid #3d3d3d;
    }

    .toast-message {
        flex: 1;
        font-size: 0.875rem;
        font-weight: 500;
    }

    .toast-close {
        background: transparent;
        border: none;
        color: inherit;
        opacity: 0.7;
        cursor: pointer;
        padding: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.2s;
    }

    .toast-close:hover {
        opacity: 1;
    }
</style>
