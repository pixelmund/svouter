<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { useHistory, useLocation, useRouter } from './contexts.js';
	import { resolve, shouldNavigate } from './utils.js';
	import type { RouteLocation } from './types.js';

	type GetPropsParams = {
		location: RouteLocation;
		href: string;
		isPartiallyCurrent: boolean;
		isCurrent: boolean;
		existingProps: Record<string, any>;
	};

	export let to: string = '#';
	export let replace: boolean = false;
	export let state: { [k in string | number]: unknown } = {};
	export let getProps = (props: GetPropsParams): Record<string, any> => ({});
	export let preserveScroll = false;

	const location = useLocation();
	const { base } = useRouter();
	const { navigate } = useHistory();
	const dispatch = createEventDispatcher();

	let href: string, isPartiallyCurrent: boolean, isCurrent: boolean, props: Record<string, any>;

	$: href = to === '/' ? $base.uri : resolve(to, $base.uri);

	$: isPartiallyCurrent = $location.pathname.startsWith(href);

	$: isCurrent = href === $location.pathname;

	$: ariaCurrent = (isCurrent ? 'page' : undefined) as 'page' | undefined;

	$: props = getProps({
		location: $location,
		href,
		isPartiallyCurrent,
		isCurrent,
		existingProps: $$restProps
	});

	const onClick = (event: any) => {
		dispatch('click', event);
		if (shouldNavigate(event)) {
			event.preventDefault();
			// Don't push another entry to the history stack when the user
			// clicks on a Link to the page they are currently on.
			const shouldReplace = $location.pathname === href || replace;
			navigate(href, { state, replace: shouldReplace, preserveScroll });
		}
	};
</script>

<a {href} aria-current={ariaCurrent} on:click={onClick} {...props} {...$$restProps}>
	<slot active={!!ariaCurrent} />
</a>
