import { writable } from "svelte/store";
import { statisticsApi } from "../services/api.js";

export const statistics = writable({
    total_completed: 0,
    current_streak: 0,
    longest_streak: 0,
    last_activity_date: null,
});

export async function loadStatistics() {
    try {
        const data = await statisticsApi.get();
        if (data) statistics.set(data);
    } catch (error) {
        console.error("Failed to load statistics:", error);
    }
}

export async function updateStatistics(data) {
    try {
        const updated = await statisticsApi.update(data);
        statistics.set(updated);
        return updated;
    } catch (error) {
        console.error("Failed to update statistics:", error);
        throw error;
    }
}

export async function incrementCompleted() {
    statistics.update((s) => {
        const today = new Date().toISOString().split("T")[0];
        const newStats = {
            ...s,
            total_completed: s.total_completed + 1,
        };

        if (s.last_activity_date !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0];

            if (s.last_activity_date === yesterdayStr) {
                newStats.current_streak = s.current_streak + 1;
            } else {
                newStats.current_streak = 1;
            }

            newStats.last_activity_date = today;

            if (newStats.current_streak > s.longest_streak) {
                newStats.longest_streak = newStats.current_streak;
            }
        }

        statisticsApi.update(newStats).catch(console.error);

        return newStats;
    });
}
