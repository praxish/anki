<!--
Copyright: Ankitects Pty Ltd and contributors
License: GNU AGPL, version 3 or later; http://www.gnu.org/licenses/agpl.html
-->
<script lang="ts">
    export let html = "";
    export let x: number = 0;
    export let y: number = 0;
    export let show = true;

    let width = 0;

    let adjustedX: number, adjustedY: number;

    $: {
        // move tooltip away from edge as user approaches right side
        const shiftLeftAmount = Math.round(
            width * 1.2 * (x / document.body.clientWidth),
        );
        adjustedX = x + 40 - shiftLeftAmount;
        adjustedY = y + 40;
    }
</script>

<div
    bind:clientWidth={width}
    class="tooltip"
    style="left: clamp(0px, {adjustedX}px, calc(100% - {width}px)); top: {adjustedY}px; opacity: {show
        ? 1
        : 0}"
>
    {@html html}
</div>

<style lang="scss">
    .tooltip {
        position: absolute;
        box-sizing: border-box;
        width: max-content;
        max-width: 100%;
        overflow-wrap: anywhere;
        padding: 15px;
        border-radius: 5px;
        font-family: inherit;
        font-size: 15px;
        opacity: 0;
        pointer-events: none;
        transition: opacity var(--transition);
        color: var(--fg);
        background: var(--canvas-overlay);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

        :global(table) {
            border-spacing: 1em 0;
        }
    }
</style>
