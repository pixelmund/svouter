<script lang="ts">
	import type { Route, RouteParams } from './types.js';
	import { getContext, onDestroy, type SvelteComponent, type Snippet } from 'svelte';
	import { ROUTER, type Router } from './state.svelte.js';

	const router = getContext<Router>(ROUTER);

	const {
		path,
		component,
		children,
		canActivate = true,
		...rest
	} = $props<{
		path: Route['path'];
		canActivate?: Route['canActivate'];
		children?: Snippet<{ params: RouteParams; [key: string]: any }>;
		[key: string]: any;
	}>();

	let routeParams = $derived(router.activeRoute?.params || {});

	function canRouteBeActivated() {
		if (typeof canActivate === 'boolean') {
			return canActivate;
		}

		return canActivate(routeParams);
	}

	let shouldActivate = $derived(canRouteBeActivated());

	const route: Route = {
		path,
		// If no path prop is given, this Route will act as the default Route
		// that is rendered if no other Route in the Router is a match.
		default: path === '',
		_path: path,
		canActivate
	};

	$effect(() => {
		if (router.activeRoute && router.activeRoute.route === route) {
			!router.activeRoute.preserveScroll && window?.scrollTo(0, 0);
		}
	});

	router.registerRoute(route);

	onDestroy(() => {
		router.unregisterRoute(route);
	});
</script>

{#if router.activeRoute && router.activeRoute?.route === route && children && shouldActivate}
	{@render children({ params: routeParams, ...rest })}
{/if}
