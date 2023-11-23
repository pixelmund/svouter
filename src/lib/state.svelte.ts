import type {
	ActiveRoute,
	Route,
	RouteLocation,
	RouterBase,
	RouterNavigateOptions
} from './legacy/types.js';
import { combinePaths, pick } from './utils.js';
import { globalHistory } from './history.js';
import { getContext, untrack } from 'svelte';

export type InitProps = {
	basePath: string;
	url?: string | null;
	history: typeof globalHistory;
};

export const ROUTER = {};

export class Router {
	routes = $state<Route[]>([]);
	activeRoute = $state<ActiveRoute | null>(null);
	history = $state<typeof globalHistory>()!;
	location = $state<RouteLocation | null>(null)!;
	base = $state<RouterBase | null>(null);
	preserveScroll = $state<boolean>(false);
	routerBase = $derived(this.getRouterBase());

	constructor({ url = null, basePath = '/', history = globalHistory }: InitProps) {
		const parentRouter = getContext<Router>(ROUTER);

		this.history = history;
		this.location = this.location ? ({ pathname: url } as RouteLocation) : history.location;
		this.base = parentRouter ? parentRouter.routerBase : { path: basePath, uri: basePath };

		$effect.pre(() => {
			const unlisten = this.history.listen((event) => {
				this.preserveScroll = event.preserveScroll || false;
				this.location = event.location;
			});

			return () => {
				unlisten();
			};
		});

		$effect.pre(() => {
			const bestMatch = pick(this.routes, this.location.pathname);
			this.activeRoute = bestMatch ? { ...bestMatch, preserveScroll: false } : bestMatch;
		});

		$effect.pre(() => {
			const { path: basepath } = this.base!;
			untrack(() => {
				this.routes = this.routes.map((r) =>
					Object.assign(r, { path: combinePaths(basepath, r._path) })
				);
			});
		});
	}

	navigate(to: string, options: RouterNavigateOptions = {}) {
		this.history.navigate(to, options);
	}

	registerRoute(route: Route) {
		const { path: basepath } = this.base!;
		let { path } = route;

		// We store the original path in the _path property so we can reuse
		// it when the basepath changes. The only thing that matters is that
		// the route reference is intact, so mutation is fine.
		route._path = path;
		route.path = combinePaths(basepath, path);

		if (typeof window === 'undefined') {
			// In SSR we should set the activeRoute immediately if it is a match.
			// If there are more Routes being registered after a match is found,
			// we just skip them.
			if (this.activeRoute) return;

			const matchingRoute = pick([route], this.location!.pathname);

			if (matchingRoute) {
				this.activeRoute = matchingRoute;
			}
		} else {
			this.routes = [...this.routes, route];
		}
	}

	unregisterRoute(route: Route) {
		this.routes = this.routes.filter((r) => r !== route);
	}

	getRouterBase() {
		if (!this.activeRoute) return this.base;
		const { path: basepath } = this.base!;
		const { route, uri } = this.activeRoute;
		const path = route.default ? basepath : route.path.replace(/\*.*$/, '');
		return { path, uri };
	}
}

export function useRouter() {
	const router = getContext<Router>(ROUTER);

	if (!router) {
		throw new Error('Missing router context');
	}

	return router;
}

export function useLocation() {
	const router = useRouter();
	return router.location;
}

export function useParams() {
	const router = useRouter();
	return router.activeRoute ? router.activeRoute.params : {};
}
