<script>
    import { onMount } from "svelte";
    import {
        BarChart3,
        Flame,
        Trophy,
        CheckCircle2,
        Calendar,
        TrendingUp,
    } from "lucide-svelte";
    import { statistics, loadStatistics } from "$lib/stores/statisticsStore.js";
    import { streaksApi } from "$lib/services/api.js";

    let streaks = [];
    let isLoading = true;

    onMount(async () => {
        await loadStatistics();
        try {
            streaks = await streaksApi.getAll();
        } catch (err) {
            console.error("Failed to load streaks:", err);
        }
        isLoading = false;
    });

    function formatDate(dateStr) {
        if (!dateStr) return "Never";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    function getLast30Days() {
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];
            const streak = streaks.find((s) => s.date === dateStr);
            days.push({
                date: dateStr,
                count: streak?.completed_count || 0,
            });
        }
        return days;
    }

    function getActivityLevel(count) {
        if (count === 0) return "level-0";
        if (count <= 2) return "level-1";
        if (count <= 4) return "level-2";
        if (count <= 6) return "level-3";
        return "level-4";
    }

    function formatDayDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    }

    $: last30Days = getLast30Days();
    $: totalLast30 = last30Days.reduce((sum, d) => sum + d.count, 0);
</script>

<div class="statistics-view">
    <!-- Header -->
    <div class="view-header">
        <div class="header-icon">
            <BarChart3 size="{24}" />
        </div>
        <div class="header-text">
            <h1>Statistics</h1>
            <p>Track your productivity over time</p>
        </div>
    </div>

    {#if isLoading}
        <div class="loading">
            <div class="spinner"></div>
        </div>
    {:else}
        <!-- Stats Grid -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon green">
                    <CheckCircle2 size="{24}" />
                </div>
                <div class="stat-info">
                    <span class="stat-label">Total Completed</span>
                    <span class="stat-value"
                        >{$statistics.total_completed || 0}</span
                    >
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon orange">
                    <Flame size="{24}" />
                </div>
                <div class="stat-info">
                    <span class="stat-label">Current Streak</span>
                    <span class="stat-value">
                        {$statistics.current_streak || 0}
                        <small>days</small>
                    </span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon purple">
                    <Trophy size="{24}" />
                </div>
                <div class="stat-info">
                    <span class="stat-label">Longest Streak</span>
                    <span class="stat-value">
                        {$statistics.longest_streak || 0}
                        <small>days</small>
                    </span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon blue">
                    <Calendar size="{24}" />
                </div>
                <div class="stat-info">
                    <span class="stat-label">Last Activity</span>
                    <span class="stat-value small"
                        >{formatDate($statistics.last_activity_date)}</span
                    >
                </div>
            </div>
        </div>

        <!-- Activity Grid -->
        <div class="activity-card">
            <div class="card-header">
                <div class="header-left">
                    <TrendingUp size="{18}" />
                    <h2>Activity (Last 30 Days)</h2>
                </div>
                <span class="activity-total">{totalLast30} tasks completed</span
                >
            </div>

            <div class="activity-grid">
                {#each last30Days as day}
                    <div
                        class="activity-cell {getActivityLevel(day.count)}"
                        title="{formatDayDate(
                            day.date
                        )}: {day.count} task{day.count !== 1 ? 's' : ''}"
                    ></div>
                {/each}
            </div>

            <div class="activity-legend">
                <span class="legend-label">Less</span>
                <div class="legend-cells">
                    <div class="legend-cell level-0"></div>
                    <div class="legend-cell level-1"></div>
                    <div class="legend-cell level-2"></div>
                    <div class="legend-cell level-3"></div>
                    <div class="legend-cell level-4"></div>
                </div>
                <span class="legend-label">More</span>
            </div>
        </div>

        <!-- Motivational Card -->
        {#if $statistics.current_streak > 0}
            <div class="motivation-card">
                <div class="motivation-emoji">
                    {#if $statistics.current_streak >= 30}
                        🏆
                    {:else if $statistics.current_streak >= 14}
                        🔥
                    {:else if $statistics.current_streak >= 7}
                        ⭐
                    {:else}
                        💪
                    {/if}
                </div>
                <div class="motivation-text">
                    <h3>
                        {#if $statistics.current_streak >= 30}
                            Incredible! 30+ day streak!
                        {:else if $statistics.current_streak >= 14}
                            Amazing! 2+ week streak!
                        {:else if $statistics.current_streak >= 7}
                            Great job! 1+ week streak!
                        {:else}
                            Keep it up!
                        {/if}
                    </h3>
                    <p>
                        You've completed tasks for {$statistics.current_streak} day{$statistics.current_streak !==
                        1
                            ? "s"
                            : ""} in a row.
                    </p>
                </div>
            </div>
        {:else}
            <div class="motivation-card empty">
                <div class="motivation-emoji">🎯</div>
                <div class="motivation-text">
                    <h3>Start your streak today!</h3>
                    <p>
                        Complete a task to begin building your productivity
                        streak.
                    </p>
                </div>
            </div>
        {/if}
    {/if}
</div>

<style>
    .statistics-view {
        max-width: 900px;
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

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .stat-card {
        background-color: #1e1e1e;
        border: 1px solid #2d2d2d;
        border-radius: 12px;
        padding: 1.25rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 12px;
    }

    .stat-icon.green {
        background-color: rgba(3, 218, 198, 0.15);
        color: #03dac6;
    }

    .stat-icon.orange {
        background-color: rgba(251, 140, 0, 0.15);
        color: #fb8c00;
    }

    .stat-icon.purple {
        background-color: rgba(187, 134, 252, 0.15);
        color: #bb86fc;
    }

    .stat-icon.blue {
        background-color: rgba(59, 130, 246, 0.15);
        color: #3b82f6;
    }

    .stat-info {
        display: flex;
        flex-direction: column;
    }

    .stat-label {
        font-size: 0.875rem;
        color: #888;
    }

    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #e1e1e1;
    }

    .stat-value.small {
        font-size: 1.125rem;
    }

    .stat-value small {
        font-size: 0.875rem;
        font-weight: 400;
        color: #888;
        margin-left: 0.25rem;
    }

    .activity-card {
        background-color: #1e1e1e;
        border: 1px solid #2d2d2d;
        border-radius: 12px;
        padding: 1.25rem;
        margin-bottom: 1.5rem;
    }

    .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #888;
    }

    .header-left h2 {
        font-size: 1rem;
        font-weight: 600;
        color: #e1e1e1;
        margin: 0;
    }

    .activity-total {
        font-size: 0.875rem;
        color: #888;
    }

    .activity-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 1rem;
    }

    .activity-cell {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        cursor: pointer;
        transition: transform 0.1s;
    }

    .activity-cell:hover {
        transform: scale(1.2);
    }

    .activity-cell.level-0 {
        background-color: #2d2d2d;
    }
    .activity-cell.level-1 {
        background-color: rgba(187, 134, 252, 0.25);
    }
    .activity-cell.level-2 {
        background-color: rgba(187, 134, 252, 0.45);
    }
    .activity-cell.level-3 {
        background-color: rgba(187, 134, 252, 0.65);
    }
    .activity-cell.level-4 {
        background-color: #bb86fc;
    }

    .activity-legend {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.5rem;
    }

    .legend-label {
        font-size: 0.75rem;
        color: #666;
    }

    .legend-cells {
        display: flex;
        gap: 3px;
    }

    .legend-cell {
        width: 12px;
        height: 12px;
        border-radius: 2px;
    }

    .legend-cell.level-0 {
        background-color: #2d2d2d;
    }
    .legend-cell.level-1 {
        background-color: rgba(187, 134, 252, 0.25);
    }
    .legend-cell.level-2 {
        background-color: rgba(187, 134, 252, 0.45);
    }
    .legend-cell.level-3 {
        background-color: rgba(187, 134, 252, 0.65);
    }
    .legend-cell.level-4 {
        background-color: #bb86fc;
    }

    .motivation-card {
        background: linear-gradient(
            135deg,
            rgba(187, 134, 252, 0.1),
            rgba(3, 218, 198, 0.1)
        );
        border: 1px solid rgba(187, 134, 252, 0.2);
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .motivation-card.empty {
        background: #1e1e1e;
        border-color: #2d2d2d;
    }

    .motivation-emoji {
        font-size: 2.5rem;
    }

    .motivation-text h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #e1e1e1;
        margin: 0 0 0.25rem 0;
    }

    .motivation-text p {
        font-size: 0.875rem;
        color: #888;
        margin: 0;
    }
</style>
