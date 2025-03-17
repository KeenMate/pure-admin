<script>
	import { onDestroy, tick, createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	export let orientation = undefined;
	export let shown = false;
	export let targetSize = undefined;
	export let alwaysVisible = false;

	let mainContentElement;
	let data = null;
	let expandedOrientation;
	let contentDimensions;

	$: expandedOrientation =
		orientation || (document.dir === "rtl" ? "left" : "right");
	$: contentDimensions = getContentDimensions(expandedOrientation);

	onDestroy(() => {
		if (shown) {
			hideModal();
		}
	});

	export async function showModal(_data) {
		data = _data;
		await tick();
		shown = true;
	}

	export function hideModal() {
		shown = false;
	}

	function getContentDimensions(orientation) {
		const targetSizeDefault = targetSize || "fit-content";


		switch (orientation) {
			case "top":
			case "bottom":
				return { w: "100vw", h: targetSizeDefault };
			case "left":
			case "right":
				return { w: targetSizeDefault, h: "100vh" };
			default:
				throw new Error(`Invalid orientation: ${orientation}`);
		}
	}

	function onRootElementClick(ev) {
		if (mainContentElement.contains(ev.target)) {
			return;
		}
		dispatch("close", { callback: hideModal });
	}
</script>

{#if alwaysVisible || shown}
	<div
		class="sidebar-modal {shown ? 'show' : ''}"
		on:click|capture={onRootElementClick}
	>
		<main
			bind:this={mainContentElement}
			class={expandedOrientation}
			style="width: {contentDimensions.w}; height: {contentDimensions.h};"
		>
			<slot {data} {hideModal} />
		</main>
	</div>
{/if}

<style>
	.sidebar-modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 1038;
		background-color: rgba(0, 0, 0, 0.25);
		display: flex;
		justify-content: center;
		align-items: center;
		transition: opacity 0.3s ease-in-out;
	}

	.sidebar-modal main {
		background-color: white;
		overflow: auto;
		position: absolute;
		transition: transform 0.3s ease-in-out;
		box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
	}

	.sidebar-modal .left {
		left: 0;
		transform: translateX(-100%);
	}

	.sidebar-modal .right {
		right: 0;
		transform: translateX(100%);
	}

	.sidebar-modal .top {
		top: 0;
		transform: translateY(-100%);
	}

	.sidebar-modal .bottom {
		bottom: 0;
		transform: translateY(100%);
	}

	.sidebar-modal.show .left,
	.sidebar-modal.show .right,
	.sidebar-modal.show .top,
	.sidebar-modal.show .bottom {
		transform: translate(0);
	}
</style>
