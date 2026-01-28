import { writable, derived } from "svelte/store";

export const currentPage = writable("main");
export const viewMode = writable("daily");
export const selectedDate = writable(new Date().toISOString().split("T")[0]);

export const isToday = derived(selectedDate, ($date) => {
    return $date === new Date().toISOString().split("T")[0];
});

export const isPastDate = derived(selectedDate, ($date) => {
    const today = new Date().toISOString().split("T")[0];
    return $date < today;
});

export function goToToday() {
    selectedDate.set(new Date().toISOString().split("T")[0]);
}

export function goToPreviousDay() {
    selectedDate.update((date) => {
        const d = new Date(date);
        d.setDate(d.getDate() - 1);
        return d.toISOString().split("T")[0];
    });
}

export function goToNextDay() {
    selectedDate.update((date) => {
        const d = new Date(date);
        d.setDate(d.getDate() + 1);
        return d.toISOString().split("T")[0];
    });
}
