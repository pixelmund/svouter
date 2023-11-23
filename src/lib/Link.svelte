<script lang="ts">
	import type { RouteLocation } from './types.js';
	import { createEventDispatcher } from 'svelte';
	import { resolve, shouldNavigate } from './utils.js';
	import { useRouter } from './state.svelte.js';

	const router = useRouter();

	type GetPropsParams = {
		location: RouteLocation;
		href: string;
		isPartiallyCurrent: boolean;
		isCurrent: boolean;
		existingProps: Record<string, any>;
	};

	const {
		to = '#',
		replace = false,
		state = {},
		getProps = (props: GetPropsParams): Record<string, any> => ({}),
		preserveScroll = false,
		...restProps
	} = $props<{
		to: string;
		replace?: boolean;
		state?: { [k in string | number]: unknown };
		getProps?: (props: GetPropsParams) => Record<string, any>;
		preserveScroll?: boolean;
		[key: string]: any;
	}>();

	const getHref = () => (to === '/' ? router.base!.uri : resolve(to, router.base!.uri));

	let href = $derived(getHref());
	let isPartiallyCurrent = $derived(router.location.pathname.startsWith(href));
	let isCurrent = $derived(href === router.location.pathname);
	let ariaCurrent = $derived((isCurrent ? 'page' : undefined) as 'page' | undefined);

	let props = $derived(
		getProps({
			location: router.location,
			href,
			isPartiallyCurrent,
			isCurrent,
			existingProps: restProps
		})
	);

	const dispatch = createEventDispatcher();

	const onClick = (event: any) => {
		dispatch('click', event);
		if (shouldNavigate(event)) {
			event.preventDefault();
			// Don't push another entry to the history stack when the user
			// clicks on a Link to the page they are currently on.
			const shouldReplace = router.location.pathname === href || replace;
			router.history.navigate(href, { state, replace: shouldReplace, preserveScroll });
		}
	};
</script>

<a {href} aria-current={ariaCurrent} on:click={onClick} {...props} {...restProps}>
	<slot active={!!ariaCurrent} />
</a>
