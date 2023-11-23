<script lang="ts">
	import { globalHistory } from '$lib/history';
	import type { Viewtransition } from '$lib/types';
	import { setContext } from 'svelte';
	import { ROUTER, Router } from './state.svelte.js';

	const {
		basePath = '/',
		url = null,
		viewtransition = null,
		history = globalHistory
	} = $props<{
		basePath?: string;
		url?: string | null;
		viewtransition?: ((direction?: string) => Viewtransition) | null;
		history?: typeof globalHistory;
	}>();

	const viewtransitionFn = (node: Element, _: unknown, direction: string) => {
		if (!viewtransition) return;
		const vt = viewtransition(direction);
		if (typeof vt?.fn === 'function') return vt.fn(node, vt);
		else return vt;
	};

	const router = new Router({
		history,
		url,
		basePath
	});

	setContext(ROUTER, router);
</script>

{#if viewtransition}
	{#key router.location.pathname}
		<div in:viewtransitionFn out:viewtransitionFn>
			<slot route={router.activeRoute?.uri} location={router.location} />
		</div>
	{/key}
{:else}
	<slot route={router.activeRoute?.uri} location={router.location} />
{/if}
