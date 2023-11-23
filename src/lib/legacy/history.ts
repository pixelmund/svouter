/**
 * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
 * https://github.com/reach/router/blob/master/LICENSE
 */
import { canUseDOM } from './utils.js';
import type { RouterNavigateOptions } from './types.js';

const getLocation = (source: typeof window) => {
	return {
		...source.location,
		state: source.history.state,
		key: (source.history.state && source.history.state.key) || 'initial'
	};
};

type Listener = (params: {
	location: ReturnType<typeof getLocation>;
	action: 'POP' | 'PUSH';
	preserveScroll?: boolean;
}) => void;

const createHistory = (source: typeof window) => {
	const listeners: Listener[] = [];
	let location = getLocation(source);

	return {
		get location() {
			return location;
		},

		listen(listener: Listener) {
			listeners.push(listener);

			const popstateListener = () => {
				location = getLocation(source);
				listener({ location, action: 'POP' });
			};

			source.addEventListener('popstate', popstateListener);

			return () => {
				source.removeEventListener('popstate', popstateListener);
				const index = listeners.indexOf(listener);
				listeners.splice(index, 1);
			};
		},

		navigate(
			to: string,
			{
				state = {},
				replace = false,
				preserveScroll = false,
				blurActiveElement = true
			}: RouterNavigateOptions = {}
		) {
			state = { ...state, key: Date.now() + '' };

			// try...catch iOS Safari limits to 100 pushState calls
			try {
				if (replace) source.history.replaceState(state, '', to);
				else source.history.pushState(state, '', to);
			} catch (e) {
				source.location[replace ? 'replace' : 'assign'](to!);
			}

			location = getLocation(source);

			listeners.forEach((listener) => listener({ location, action: 'PUSH', preserveScroll }));

			if (blurActiveElement && document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
		}
	};
};

type StackItem = { pathname: string; search: string };

// Stores history entries in memory for testing or other platforms like Native
const createMemorySource = (initialPathname: string = '/') => {
	let index = 0;
	const stack: StackItem[] = [{ pathname: initialPathname, search: '' }];
	const states: any[] = [];

	return {
		get location() {
			return stack[index];
		},
		addEventListener(name: string, fn: any) {},
		removeEventListener(name: string, fn: any) {},
		history: {
			get entries() {
				return stack;
			},
			get index() {
				return index;
			},
			get state() {
				return states[index];
			},
			pushState(state: any, _: unknown, uri: string) {
				const [pathname, search = ''] = uri.split('?');
				index++;
				stack.push({ pathname, search });
				states.push(state);
			},
			replaceState(state: any, _: unknown, uri: string) {
				const [pathname, search = ''] = uri.split('?');
				stack[index] = { pathname, search };
				states[index] = state;
			}
		}
	};
};

// Global history uses window.history as the source if available,
// otherwise a memory history
const globalHistory = createHistory(
	canUseDOM() ? window : (createMemorySource() as any as typeof window)
);

const { navigate } = globalHistory;

export { globalHistory, navigate, createHistory, createMemorySource };
