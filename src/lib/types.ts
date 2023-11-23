import type { Writable } from 'svelte/store';

export type RouteLocation = {
	pathname: string;
	search: string;
	hash?: string;
	state: {
		[k in string | number]: unknown;
	};
};

export type RouteParams = {
	[param: string]: string;
};

export type RouterProps = {
	basepath?: string;
	url?: string;
	viewtransition?: (direction?: string) => Viewtransition;
};

export type Viewtransition = {
	fn?: any;
	delay?: number;
	duration?: number;
	x?: number;
	y?: number;
	opacity?: number;
	easing?: any;
	css?: (t: number) => string;
};

export type ActiveRoute = {
	params: RouteParams;
	uri: string;
	route: Route;
	preserveScroll?: boolean;
};

export type RouterBase = {
	path: string;
	uri: string;
};

export type Route = {
	path: string;
	default: boolean;
	_path: string;
	canActivate: boolean | ((params: RouteParams) => boolean);
};

export type RouterContext = {
	activeRoute: Writable<ActiveRoute | null>;
	routerBase: Writable<RouterBase>;
	base: Writable<RouterBase>;
	registerRoute: (route: Route) => void;
	unregisterRoute: (route: Route) => void;
};

export type RouterNavigateOptions = {
	replace?: boolean;
	preserveScroll?: boolean;
	state?: any;
	blurActiveElement?: boolean;
}

export type RouterNavigate = (
	to?: string | null,
	options?: RouterNavigateOptions
) => void;
