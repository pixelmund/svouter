<script lang="ts">
	import { type SvelteComponent, onDestroy } from 'svelte';
	import { useRouter } from './contexts.js';
	import { canUseDOM } from './utils.js';
	import type { Route } from './types.js';

	type AsyncSvelteComponent = () => Promise<{
		default: typeof SvelteComponent<any>;
	}>;

	export let path: string = '';
	export let component: typeof SvelteComponent<any> | AsyncSvelteComponent | null = null;

	let routeParams: any = {};
	let routeProps: any = {};

	const { registerRoute, unregisterRoute, activeRoute } = useRouter();

	const route: Route = {
		path,
		// If no path prop is given, this Route will act as the default Route
		// that is rendered if no other Route in the Router is a match.
		default: path === '',
		_path: path,
		canActivate: () => true,
	};

	$: if ($activeRoute && $activeRoute.route === route) {
		routeParams = $activeRoute.params;

		const { component: c, path, ...rest } = $$props;
		routeProps = rest;

		if (c) {
			if (c.toString().startsWith('class ')) component = c;
			else component = c();
		}

		canUseDOM() && !$activeRoute.preserveScroll && window?.scrollTo(0, 0);
	}

	registerRoute(route);

	onDestroy(() => {
		unregisterRoute(route);
	});
</script>

{#if $activeRoute && $activeRoute.route === route}
	{#if component}
		{#await component then resolvedComponent}
			<svelte:component
				this={resolvedComponent?.default || resolvedComponent}
				{...routeParams}
				{...routeProps}
			/>
		{/await}
	{:else}
		<slot params={routeParams} />
	{/if}
{/if}
