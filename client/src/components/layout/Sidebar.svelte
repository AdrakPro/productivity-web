<script>
    import {
        Home,
        FileText,
        Archive,
        BarChart3,
        Settings,
    } from "lucide-svelte";
    import { currentPage } from "$lib/stores/viewStore.js";

    const navItems = [
        { id: "main", icon: Home, label: "Tasks" },
        { id: "files", icon: FileText, label: "Files" },
        { id: "archive", icon: Archive, label: "Archive" },
        { id: "statistics", icon: BarChart3, label: "Statistics" },
        { id: "settings", icon: Settings, label: "Settings" },
    ];
</script>

<aside class="sidebar">
    <nav class="nav">
        {#each navItems as item}
            <button
                class="nav-item"
                class:active="{$currentPage === item.id}"
                on:click="{() => currentPage.set(item.id)}"
            >
                <svelte:component this="{item.icon}" size="{20}" />
                <span>{item.label}</span>
            </button>
        {/each}
    </nav>
</aside>

<style>
    .sidebar {
        width: 200px;
        background-color: #1e1e1e;
        border-right: 1px solid #2d2d2d;
        padding: 0.75rem;
    }

    .nav {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .nav-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.75rem 1rem;
        background: transparent;
        border: none;
        border-radius: 8px;
        color: #888;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
    }

    .nav-item:hover {
        background-color: #2d2d2d;
        color: #e1e1e1;
    }

    .nav-item.active {
        background-color: rgba(187, 134, 252, 0.15);
        color: #bb86fc;
    }
</style>
