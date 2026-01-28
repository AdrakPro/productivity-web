<script>
    import { createEventDispatcher } from "svelte";

    export let checked = false;
    export let disabled = false;

    const dispatch = createEventDispatcher();

    function handleChange() {
        if (disabled) return;
        checked = !checked;
        dispatch("change", { checked });
    }
</script>

<button
    type="button"
    role="switch"
    aria-checked="{checked}"
    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors
    {checked ? 'bg-primary' : 'bg-surface-lighter'}
    {disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
    on:click="{handleChange}"
    {disabled}
>
    <span
        class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform
      {checked ? 'translate-x-6' : 'translate-x-1'}"
    ></span>
</button>
