/**
 * WordPress dependencies.
 */
import * as interactivity from "@wordpress/interactivity";

const { store, getContext, getElement } = interactivity;

// WP 6.8+: the server state of the page the router last navigated to.
const { getServerState } = interactivity;

const { state } = store("blocklayouts/infinite-scroll", {
	state: { queries: {} },
});

/**
 * Progress of the Query Loop a block belongs to.
 *
 * @param {Object} context Block context.
 * @returns {{loaded: number, hasMore: boolean}} Progress.
 */
const getProgress = (context) =>
	state.queries[context.key] || { loaded: 1, hasMore: false };

let routerModule;
const loadRouter = () => {
	routerModule ??= import("@wordpress/interactivity-router");
	return routerModule;
};

/**
 * Load the next page of a Query Loop.
 *
 * Asks the router for the current URL with one more loaded page; the server
 * renders pages 1..N (see inc/blocks/infinite-scroll.php) and the router
 * swaps the Query Loop region. Because the router hydrates the new markup,
 * interactive blocks inside the loaded posts work like the first ones.
 *
 * @param {Object} context Block context.
 * @returns {Promise<void>}
 */
const loadMore = async (context) => {
	const progress = getProgress(context);

	if (!progress.hasMore || context.isLoading) {
		return;
	}

	const url = new URL(window.location.href);
	url.searchParams.set(context.param, String(progress.loaded + 1));
	if (context.pageParam) {
		url.searchParams.delete(context.pageParam);
	}

	context.isLoading = true;

	try {
		const { actions: router } = await loadRouter();
		const countBefore = countPosts(context);

		// Replace the history entry: "Back" should leave the page, not unload posts.
		await router.navigate(url.href, {
			replace: true,
			loadingAnimation: false,
			screenReaderAnnouncement: true,
		});

		// Without getServerState (WP < 6.8), track progress here: stop once a
		// load adds nothing.
		if (!getServerState) {
			progress.loaded += 1;
			progress.hasMore = countPosts(context) > countBefore;
		}
	} catch (error) {
		console.error("Failed to load more posts.", error);
		progress.hasMore = false;
	} finally {
		context.isLoading = false;
	}
};

/**
 * Number of posts currently rendered in the block's Query Loop.
 *
 * @param {Object} context Block context.
 * @returns {number} Post count.
 */
const countPosts = (context) =>
	document.querySelector(`[data-wp-router-region="${context.region}"] .wp-block-post-template`)
		?.children.length ?? 0;

/**
 * Whether an element is within `distance` pixels of the viewport.
 *
 * @param {HTMLElement} element  Element.
 * @param {number}      distance Distance in pixels.
 * @returns {boolean}
 */
const isNearViewport = (element, distance) => {
	const rect = element.getBoundingClientRect();
	return (
		rect.width + rect.height > 0 &&
		rect.top <= window.innerHeight + distance &&
		rect.bottom >= -distance
	);
};

store("blocklayouts/infinite-scroll", {
	actions: {
		/**
		 * Load more posts (button type).
		 */
		*loadMore() {
			yield loadMore(getContext());
		},
	},

	callbacks: {
		/**
		 * Copy fresh progress from the server after each load. The router merges
		 * new server state without overwriting existing values, so it has to be
		 * copied over explicitly.
		 */
		syncProgress() {
			if (!getServerState) {
				return;
			}

			const context = getContext();
			const serverProgress = getServerState().queries?.[context.key];

			if (serverProgress) {
				state.queries[context.key] = {
					...(state.queries[context.key] || {}),
					...serverProgress,
				};
			}
		},

		/**
		 * Load more posts when the trigger gets close to the viewport.
		 *
		 * Re-runs whenever `hasMore` or `isLoading` change, so it keeps loading
		 * while the trigger stays visible (e.g. short pages on tall screens).
		 */
		infiniteScroll() {
			const { ref } = getElement();
			const context = getContext();

			if (!ref || !getProgress(context).hasMore || context.isLoading) {
				return;
			}

			const distance = parseInt(ref.dataset.triggerDistance, 10) || 100;

			const observer = new window.IntersectionObserver(
				(entries) => {
					if (entries.some((entry) => entry.isIntersecting)) {
						observer.disconnect();
						loadMore(context);
					}
				},
				{ rootMargin: `${distance}px 0px` }
			);

			observer.observe(ref);

			// The observer only reports changes: handle a trigger that is
			// already in view after the previous load.
			if (isNearViewport(ref, distance)) {
				observer.disconnect();
				// Deferred: loading updates the state this callback depends on.
				window.queueMicrotask(() => loadMore(context));
			}

			return () => observer.disconnect();
		},
	},
});
