<script>
    import {
        Settings,
        User,
        Lock,
        Trash2,
        Download,
        Upload,
        Info,
        AlertTriangle,
        Loader2,
        Keyboard,
    } from "lucide-svelte";
    import {
        user,
        changePassword,
        deleteAccount,
    } from "$lib/stores/authStore.js";
    import { exportTodos, importTodos } from "$lib/stores/todoStore.js";
    import { success, error as errorToast } from "$lib/stores/toastStore.js";

    let fileInput;

    let currentPassword = "";
    let newPassword = "";
    let confirmNewPassword = "";
    let isChangingPassword = false;
    let passwordError = "";

    let showDeleteDialog = false;
    let deleteConfirmText = "";
    let isDeleting = false;

    async function handleChangePassword() {
        passwordError = "";

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            passwordError = "All fields are required";
            return;
        }

        if (newPassword.length < 6) {
            passwordError = "New password must be at least 6 characters";
            return;
        }

        if (newPassword !== confirmNewPassword) {
            passwordError = "New passwords do not match";
            return;
        }

        isChangingPassword = true;

        try {
            await changePassword(currentPassword, newPassword);
            success("Password changed successfully");
            currentPassword = "";
            newPassword = "";
            confirmNewPassword = "";
        } catch (err) {
            passwordError = err.message;
        } finally {
            isChangingPassword = false;
        }
    }

    function handleExport() {
        exportTodos();
    }

    function handleImportClick() {
        fileInput?.click();
    }

    async function handleFileSelected(event) {
        const file = event.target.files?.[0];
        if (file) {
            await importTodos(file);
            event.target.value = "";
        }
    }

    async function handleDeleteAccount() {
        if (deleteConfirmText !== "DELETE") {
            return;
        }

        isDeleting = true;

        try {
            await deleteAccount();
            success("Account deleted");
        } catch (err) {
            errorToast("Failed to delete account");
        } finally {
            isDeleting = false;
            showDeleteDialog = false;
        }
    }
</script>

<div class="settings-view">
    <!-- Header -->
    <div class="view-header">
        <div class="header-icon">
            <Settings size="{24}" />
        </div>
        <div class="header-text">
            <h1>Settings</h1>
            <p>Manage your account and preferences</p>
        </div>
    </div>

    <div class="settings-content">
        <!-- Profile Section -->
        <section class="settings-card">
            <div class="card-header">
                <User size="{18}" />
                <h2>Profile</h2>
            </div>
            <div class="card-content">
                <div class="info-row">
                    <span class="info-label">Username</span>
                    <span class="info-value">{$user?.username}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email</span>
                    <span class="info-value">{$user?.email}</span>
                </div>
            </div>
        </section>

        <!-- Change Password Section -->
        <section class="settings-card">
            <div class="card-header">
                <Lock size="{18}" />
                <h2>Change Password</h2>
            </div>
            <div class="card-content">
                <div class="form-group">
                    <label for="currentPassword">Current Password</label>
                    <input
                        id="currentPassword"
                        type="password"
                        placeholder="••••••••"
                        bind:value="{currentPassword}"
                    />
                </div>
                <div class="form-group">
                    <label for="newPassword">New Password</label>
                    <input
                        id="newPassword"
                        type="password"
                        placeholder="••••••••"
                        bind:value="{newPassword}"
                    />
                </div>
                <div class="form-group">
                    <label for="confirmNewPassword">Confirm New Password</label>
                    <input
                        id="confirmNewPassword"
                        type="password"
                        placeholder="••••••••"
                        bind:value="{confirmNewPassword}"
                    />
                </div>

                {#if passwordError}
                    <div class="error-message">{passwordError}</div>
                {/if}

                <button
                    class="btn-primary"
                    on:click="{handleChangePassword}"
                    disabled="{isChangingPassword}"
                >
                    {#if isChangingPassword}
                        <Loader2 size="{16}" class="spinner" />
                    {/if}
                    Update Password
                </button>
            </div>
        </section>

        <!-- Data Management Section -->
        <section class="settings-card">
            <div class="card-header">
                <Download size="{18}" />
                <h2>Data Management</h2>
            </div>
            <div class="card-content">
                <h3>Export & Import Tasks</h3>
                <p class="description">
                    Backup your tasks or restore from a previous backup
                </p>
                <div class="button-group">
                    <button class="btn-secondary" on:click="{handleExport}">
                        <Download size="{16}" />
                        Export
                    </button>
                    <button
                        class="btn-secondary"
                        on:click="{handleImportClick}"
                    >
                        <Upload size="{16}" />
                        Import
                    </button>
                    <input
                        bind:this="{fileInput}"
                        type="file"
                        accept=".json"
                        style="display: none;"
                        on:change="{handleFileSelected}"
                    />
                </div>
            </div>
        </section>

        <!-- Keyboard Shortcuts -->
        <section class="settings-card">
            <div class="card-header">
                <Keyboard size="{18}" />
                <h2>Keyboard Shortcuts</h2>
            </div>
            <div class="card-content">
                <div class="shortcut-list">
                    <div class="shortcut-row">
                        <span class="shortcut-label">New task</span>
                        <div class="shortcut-keys">
                            <kbd>N</kbd>
                            <span>or</span>
                            <kbd>Ctrl</kbd>
                            <span>+</span>
                            <kbd>N</kbd>
                        </div>
                    </div>
                    <div class="shortcut-row">
                        <span class="shortcut-label">Go to today</span>
                        <div class="shortcut-keys">
                            <kbd>T</kbd>
                        </div>
                    </div>
                    <div class="shortcut-row">
                        <span class="shortcut-label">Previous day</span>
                        <div class="shortcut-keys">
                            <kbd>←</kbd>
                        </div>
                    </div>
                    <div class="shortcut-row">
                        <span class="shortcut-label">Next day</span>
                        <div class="shortcut-keys">
                            <kbd>→</kbd>
                        </div>
                    </div>
                    <div class="shortcut-row">
                        <span class="shortcut-label">Save file</span>
                        <div class="shortcut-keys">
                            <kbd>Ctrl</kbd>
                            <span>+</span>
                            <kbd>S</kbd>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- About Section -->
        <section class="settings-card">
            <div class="card-header">
                <Info size="{18}" />
                <h2>About</h2>
            </div>
            <div class="card-content">
                <div class="info-row">
                    <span class="info-label">Version</span>
                    <span class="info-value">1.0.0</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Built with</span>
                    <span class="info-value">Node.js + Svelte + PostgreSQL</span
                    >
                </div>
            </div>
        </section>

        <!-- Danger Zone -->
        <section class="settings-card danger">
            <div class="card-header">
                <AlertTriangle size="{18}" />
                <h2>Danger Zone</h2>
            </div>
            <div class="card-content">
                <h3>Delete Account</h3>
                <p class="description">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                </p>
                <button
                    class="btn-danger"
                    on:click="{() => (showDeleteDialog = true)}"
                >
                    <Trash2 size="{16}" />
                    Delete Account
                </button>
            </div>
        </section>
    </div>
</div>

<!-- Delete Account Dialog -->
{#if showDeleteDialog}
    <div class="dialog-overlay" on:click="{() => (showDeleteDialog = false)}">
        <div class="dialog" on:click|stopPropagation>
            <div class="dialog-header">
                <div class="dialog-icon">
                    <AlertTriangle size="{24}" />
                </div>
                <div>
                    <h3>Delete Account</h3>
                    <p>This action is permanent</p>
                </div>
            </div>

            <div class="dialog-content">
                <p>This will permanently delete:</p>
                <ul>
                    <li>Your account and profile</li>
                    <li>All your tasks and subtasks</li>
                    <li>All your files and folders</li>
                    <li>Statistics and activity history</li>
                </ul>
            </div>

            <div class="dialog-confirm">
                <label>Type <strong>DELETE</strong> to confirm:</label>
                <input
                    type="text"
                    placeholder="Type DELETE here"
                    bind:value="{deleteConfirmText}"
                />
            </div>

            <div class="dialog-actions">
                <button
                    class="btn-secondary"
                    on:click="{() => (showDeleteDialog = false)}"
                    disabled="{isDeleting}"
                >
                    Cancel
                </button>
                <button
                    class="btn-danger"
                    on:click="{handleDeleteAccount}"
                    disabled="{isDeleting || deleteConfirmText !== 'DELETE'}"
                >
                    {#if isDeleting}
                        <Loader2 size="{16}" class="spinner" />
                    {/if}
                    Delete Account
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .settings-view {
        max-width: 700px;
        margin: 0 auto;
    }

    .view-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 2rem;
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

    .settings-content {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .settings-card {
        background-color: #1e1e1e;
        border: 1px solid #2d2d2d;
        border-radius: 12px;
        overflow: hidden;
    }

    .settings-card.danger {
        border-color: rgba(207, 102, 121, 0.3);
    }

    .card-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #2d2d2d;
        color: #888;
    }

    .card-header h2 {
        font-size: 0.875rem;
        font-weight: 600;
        color: #aaa;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .settings-card.danger .card-header {
        color: #cf6679;
        border-bottom-color: rgba(207, 102, 121, 0.2);
    }

    .settings-card.danger .card-header h2 {
        color: #cf6679;
    }

    .card-content {
        padding: 1.25rem;
    }

    .card-content h3 {
        font-size: 1rem;
        font-weight: 600;
        color: #e1e1e1;
        margin: 0 0 0.5rem 0;
    }

    .description {
        font-size: 0.875rem;
        color: #888;
        margin: 0 0 1rem 0;
    }

    .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid #2d2d2d;
    }

    .info-row:last-child {
        border-bottom: none;
    }

    .info-label {
        color: #888;
        font-size: 0.875rem;
    }

    .info-value {
        color: #e1e1e1;
        font-weight: 500;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group label {
        display: block;
        font-size: 0.875rem;
        color: #888;
        margin-bottom: 0.5rem;
    }

    .form-group input {
        width: 100%;
        padding: 0.75rem;
        background-color: #2d2d2d;
        border: 1px solid #3d3d3d;
        border-radius: 8px;
        color: #e1e1e1;
        font-size: 0.9375rem;
        outline: none;
        transition: border-color 0.2s;
    }

    .form-group input:focus {
        border-color: #bb86fc;
    }

    .form-group input::placeholder {
        color: #666;
    }

    .error-message {
        padding: 0.75rem;
        background-color: rgba(207, 102, 121, 0.1);
        border: 1px solid rgba(207, 102, 121, 0.3);
        border-radius: 8px;
        color: #cf6679;
        font-size: 0.875rem;
        margin-bottom: 1rem;
    }

    .button-group {
        display: flex;
        gap: 0.75rem;
    }

    .btn-primary,
    .btn-secondary,
    .btn-danger {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        border: none;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-primary {
        background-color: #bb86fc;
        color: #000;
    }

    .btn-primary:hover:not(:disabled) {
        background-color: #a66df0;
    }

    .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .btn-secondary {
        background-color: #2d2d2d;
        color: #e1e1e1;
    }

    .btn-secondary:hover:not(:disabled) {
        background-color: #3d3d3d;
    }

    .btn-danger {
        background-color: rgba(207, 102, 121, 0.15);
        color: #cf6679;
        border: 1px solid rgba(207, 102, 121, 0.3);
    }

    .btn-danger:hover:not(:disabled) {
        background-color: rgba(207, 102, 121, 0.25);
    }

    .btn-danger:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .shortcut-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .shortcut-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
    }

    .shortcut-label {
        color: #888;
        font-size: 0.875rem;
    }

    .shortcut-keys {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        color: #666;
        font-size: 0.75rem;
    }

    .shortcut-keys kbd {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        background-color: #2d2d2d;
        border: 1px solid #3d3d3d;
        border-radius: 4px;
        color: #e1e1e1;
        font-family: inherit;
        font-size: 0.75rem;
    }

    /* Dialog Styles */
    .dialog-overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }

    .dialog {
        width: 100%;
        max-width: 420px;
        background-color: #1e1e1e;
        border: 1px solid #2d2d2d;
        border-radius: 16px;
        overflow: hidden;
    }

    .dialog-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem;
        border-bottom: 1px solid #2d2d2d;
    }

    .dialog-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background-color: rgba(207, 102, 121, 0.15);
        border-radius: 12px;
        color: #cf6679;
    }

    .dialog-header h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #e1e1e1;
        margin: 0;
    }

    .dialog-header p {
        font-size: 0.875rem;
        color: #888;
        margin: 0.25rem 0 0 0;
    }

    .dialog-content {
        padding: 1.5rem;
    }

    .dialog-content p {
        color: #ccc;
        margin: 0 0 1rem 0;
    }

    .dialog-content ul {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .dialog-content li {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.375rem 0;
        color: #888;
        font-size: 0.875rem;
    }

    .dialog-content li::before {
        content: "";
        width: 6px;
        height: 6px;
        background-color: #cf6679;
        border-radius: 50%;
    }

    .dialog-confirm {
        padding: 0 1.5rem 1.5rem;
    }

    .dialog-confirm label {
        display: block;
        font-size: 0.875rem;
        color: #888;
        margin-bottom: 0.5rem;
    }

    .dialog-confirm strong {
        color: #e1e1e1;
        background-color: #2d2d2d;
        padding: 0.125rem 0.5rem;
        border-radius: 4px;
    }

    .dialog-confirm input {
        width: 100%;
        padding: 0.75rem;
        background-color: #2d2d2d;
        border: 1px solid #3d3d3d;
        border-radius: 8px;
        color: #e1e1e1;
        font-size: 0.9375rem;
        outline: none;
    }

    .dialog-confirm input:focus {
        border-color: #bb86fc;
    }

    .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        background-color: #171717;
        border-top: 1px solid #2d2d2d;
    }

    :global(.spinner) {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
