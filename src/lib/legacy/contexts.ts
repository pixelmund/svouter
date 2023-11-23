import { getContext } from 'svelte';
import type { RouteLocation, RouterContext, RouterProps } from './types.js';
import type { Writable } from 'svelte/store';
import type { globalHistory } from './history.js';

// @ts-ignore
export const LOCATION: RouteLocation = {};
// @ts-ignore
export const ROUTER: RouterProps = {};
export const HISTORY: Record<string | number, any> = {};

export const useLocation = () => getContext<Writable<RouteLocation>>(LOCATION);
export const useRouter = () => getContext<RouterContext>(ROUTER);
export const useHistory = () => getContext<typeof globalHistory>(HISTORY);
