<script>
    import { ChevronLeft, ChevronRight, Calendar } from "lucide-svelte";
    import {
        selectedDate,
        goToPreviousDay,
        goToNextDay,
        goToToday,
        isToday,
    } from "$lib/stores/viewStore.js";

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        };
        return date.toLocaleDateString("en-US", options);
    }
</script>

<div class="day-nav">
    <div class="nav-center">
        <button
            class="nav-btn"
            on:click="{goToPreviousDay}"
            title="Previous day (←)"
        >
            <ChevronLeft size="{24}" />
        </button>

        <div class="date-display">
            <h1 class="date-title">
                {#if $isToday}
                    Today
                {:else}
                    {formatDate($selectedDate)}
                {/if}
            </h1>
            {#if $isToday}
                <p class="date-subtitle">{formatDate($selectedDate)}</p>
            {/if}
        </div>

        <button class="nav-btn" on:click="{goToNextDay}" title="Next day (→)">
            <ChevronRight size="{24}" />
        </button>

        {#if !$isToday}
            <button class="today-btn" on:click="{goToToday}">
                <Calendar size="{16}" />
                <span>Today</span>
            </button>
        {/if}
    </div>
</div>

<style>
    .day-nav {
        display: flex;
        justify-content: center;
        width: 100%;
    }

    .nav-center {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .nav-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: transparent;
        border: none;
        border-radius: 8px;
        color: #888;
        cursor: pointer;
        transition: all 0.2s;
    }

    .nav-btn:hover {
        background-color: #2d2d2d;
        color: #e1e1e1;
    }

    .date-display {
        text-align: center;
        min-width: 280px;
    }

    .date-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #e1e1e1;
        margin: 0;
    }

    .date-subtitle {
        font-size: 0.875rem;
        color: #888;
        margin: 0.25rem 0 0 0;
    }

    .today-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.875rem;
        background: transparent;
        border: 1px solid #3d3d3d;
        border-radius: 8px;
        color: #888;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .today-btn:hover {
        background-color: #2d2d2d;
        color: #e1e1e1;
        border-color: #4d4d4d;
    }
</style>
