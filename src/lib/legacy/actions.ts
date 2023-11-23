import { navigate } from "./history.js";
import { hostMatches, shouldNavigate } from "./utils.js";

/**
 * A link action that can be added to <a href=""> tags rather
 * than using the <Link> component.
 *
 * Example:
 * ```html
 * <a href="/post/{postId}" use:link>{post.title}</a>
 * ```
 */
const link = (node: Element) => {
    const onClick = (event: Event & { currentTarget: HTMLAnchorElement }) => {
        const anchor = event.currentTarget;

        if (
            (anchor.target === "" || anchor.target === "_self") &&
            hostMatches(anchor) &&
            shouldNavigate(event)
        ) {
            event.preventDefault();
            navigate(anchor.pathname + anchor.search, {
                replace: anchor.hasAttribute("replace"),
                preserveScroll: anchor.hasAttribute("preserveScroll"),
            });
        }
    };

    node.addEventListener("click", onClick as EventListener);

    return {
        destroy() {
            node.removeEventListener("click", onClick as EventListener);
        },
    };
};

/**
 * An action to be added at a root element of your application to
 * capture all relative links and push them onto the history stack.
 *
 * Example:
 * ```html
 * <div use:links>
 *   <Router>
 *     <Route path="/" component={Home} />
 *     <Route path="/p/:projectId/:docId?" component={ProjectScreen} />
 *     {#each projects as project}
 *       <a href="/p/{project.id}">{project.title}</a>
 *     {/each}
 *   </Router>
 * </div>
 * ```
 */
const links = (node: Element) => {
    const findClosest = <T extends Element>(tagName: string, el: T) => {
        while (el && el.tagName !== tagName) el = el.parentNode as T;
        return el;
    };

    const onClick = (event: Event & { target: HTMLAnchorElement }) => {
        const anchor = findClosest("A", event.target);
        if (
            anchor &&
            (anchor.target === "" || anchor.target === "_self") &&
            hostMatches(anchor) &&
            shouldNavigate(event) &&
            !anchor.hasAttribute("noroute")
        ) {
            event.preventDefault();
            navigate(anchor.pathname + anchor.search, {
                replace: anchor.hasAttribute("replace"),
                preserveScroll: anchor.hasAttribute("preserveScroll"),
            });
        }
    };

    node.addEventListener("click", onClick as EventListener);

    return {
        destroy() {
            node.removeEventListener("click", onClick as EventListener);
        },
    };
};

export { link, links };
