<script>
    import { Calendar, Globe, User, LogOut, ChevronDown } from "lucide-svelte";
    import { viewMode } from "$lib/stores/viewStore.js";
    import { user, logout } from "$lib/stores/authStore.js";
    import { loadTodos } from "$lib/stores/todoStore.js";

    let showUserMenu = false;

    async function setViewMode(mode) {
        viewMode.set(mode);
        await loadTodos();
    }

    async function handleLogout() {
        await logout();
    }

    function toggleUserMenu() {
        showUserMenu = !showUserMenu;
    }

    function closeUserMenu() {
        showUserMenu = false;
    }
</script>

<svelte:window on:click="{closeUserMenu}" />

<header class="header">
    <div class="header-left">
        <h1 class="logo">Productivity</h1>
    </div>

    <div class="header-center">
        <div class="view-toggle">
            <button
                class="toggle-btn"
                class:active="{$viewMode === 'daily'}"
                on:click="{() => setViewMode('daily')}"
            >
                <Calendar size="{16}" />
                <span>Daily</span>
            </button>
            <button
                class="toggle-btn"
                class:active="{$viewMode === 'global'}"
                on:click="{() => setViewMode('global')}"
            >
                <Globe size="{16}" />
                <span>Global</span>
            </button>
        </div>
    </div>

    <div class="header-right">
        <div class="user-menu-container">
            <button
                class="user-btn"
                on:click|stopPropagation="{toggleUserMenu}"
            >
                <User size="{18}" />
                <span>{$user?.username}</span>
                <ChevronDown size="{14}" />
            </button>

            {#if showUserMenu}
                <div class="user-dropdown" on:click|stopPropagation>
                    <div class="user-info">
                        <span class="user-name">{$user?.username}</span>
                        <span class="user-email">{$user?.email}</span>
                    </div>
                    <div class="dropdown-divider"></div>
                    <button
                        class="dropdown-item logout"
                        on:click="{handleLogout}"
                    >
                        <LogOut size="{16}" />
                        <span>Sign Out</span>
                    </button>
                </div>
            {/if}
        </div>
    </div>
</header>

<style>
    .header {
        height: 56px;
        background-color: #1e1e1e;
        border-bottom: 1px solid #2d2d2d;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 1rem;
    }

    .header-left,
    .header-right {
        flex: 1;
    }

    .header-right {
        display: flex;
        justify-content: flex-end;
    }

    .header-center {
        display: flex;
        justify-content: center;
    }

    .logo {
        font-size: 1.25rem;
        font-weight: 700;
        color: #bb86fc;
        margin: 0;
    }

    .view-toggle {
        display: flex;
        gap: 0.5rem;
        background-color: #2d2d2d;
        padding: 4px;
        border-radius: 8px;
    }

    .toggle-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: transparent;
        border: none;
        border-radius: 6px;
        color: #888;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .toggle-btn:hover {
        color: #e1e1e1;
    }

    .toggle-btn.active {
        background-color: #bb86fc;
        color: #000;
    }

    .user-menu-container {
        position: relative;
    }

    .user-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 8px;
        color: #aaa;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .user-btn:hover {
        background-color: #2d2d2d;
        color: #e1e1e1;
    }

    .user-dropdown {
        position: absolute;
        right: 0;
        top: calc(100% + 8px);
        width: 220px;
        background-color: #2d2d2d;
        border: 1px solid #3d3d3d;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        overflow: hidden;
        z-index: 100;
    }

    .user-info {
        padding: 1rem;
    }

    .user-name {
        display: block;
        font-weight: 600;
        color: #e1e1e1;
    }

    .user-email {
        display: block;
        font-size: 0.75rem;
        color: #888;
        margin-top: 2px;
    }

    .dropdown-divider {
        height: 1px;
        background-color: #3d3d3d;
    }

    .dropdown-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.75rem 1rem;
        background: transparent;
        border: none;
        color: #e1e1e1;
        font-size: 0.875rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .dropdown-item:hover {
        background-color: #3d3d3d;
    }

    .dropdown-item.logout {
        color: #cf6679;
    }
</style>
