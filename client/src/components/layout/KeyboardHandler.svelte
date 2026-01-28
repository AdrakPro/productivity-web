<script>
    import { createEventDispatcher } from "svelte";
    import {
        viewMode,
        currentPage,
        goToPreviousDay,
        goToNextDay,
        goToToday,
        isToday,
    } from "$lib/stores/viewStore.js";
    import { success } from "$lib/stores/toastStore.js";

    const dispatch = createEventDispatcher();

    let isHandling = false;

    function handleKeydown(event) {
        if (isHandling) return;

        const activeElement = document.activeElement;
        const isTyping =
            activeElement &&
            (activeElement.tagName === "INPUT" ||
                activeElement.tagName === "TEXTAREA" ||
                activeElement.isContentEditable);

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "n"
        ) {
            event.preventDefault();
            event.stopPropagation();
            dispatch("newTask");
            return;
        }

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "s"
        ) {
            event.preventDefault();
            return;
        }

        if (isTyping) return;

        if ($viewMode === "daily" && $currentPage === "main") {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                isHandling = true;
                goToPreviousDay();
                setTimeout(() => (isHandling = false), 50);
                return;
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                isHandling = true;
                goToNextDay();
                setTimeout(() => (isHandling = false), 50);
                return;
            }
        }

        if (
            event.key.toLowerCase() === "t" &&
            !event.ctrlKey &&
            !event.metaKey
        ) {
            if ($viewMode === "daily" && $currentPage === "main") {
                event.preventDefault();
                let isTodayValue;
                isToday.subscribe((v) => (isTodayValue = v))();
                if (!isTodayValue) {
                    goToToday();
                    success("Jumped to today");
                }
                return;
            }
        }

        if (
            event.key.toLowerCase() === "n" &&
            !event.ctrlKey &&
            !event.metaKey
        ) {
            event.preventDefault();
            dispatch("newTask");
        }
    }
</script>

<svelte:window on:keydown="{handleKeydown}" />
