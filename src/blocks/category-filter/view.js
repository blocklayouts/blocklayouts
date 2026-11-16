/**
 * WordPress dependencies.
 */
import * as interactivity from "@wordpress/interactivity";

const { store, getContext, getElement } = interactivity;

// `withSyncEvent` (WP 6.8+) lets an action call event.preventDefault()
// synchronously. Older versions run actions synchronously anyway.
const withSyncEvent = interactivity.withSyncEvent || ((callback) => callback);

let routerModule;
const loadRouter = () => {
	routerModule ??= import("@wordpress/interactivity-router");
	return routerModule;
};

/**
 * The router region core adds to a Query Loop when "Reload full page" is off.
 *
 * @param {number} queryId Query Loop queryId.
 * @return {HTMLElement|null} Region element.
 */
const getRegion = (queryId) =>
	document.querySelector(`[data-wp-router-region="query-${queryId}"]`);

/**
 * Build the URL that selects `slug` for this filter, keeping every other
 * parameter (other filters, search…) and resetting the Query Loop pagination.
 *
 * @param {Object} context Block context.
 * @param {string} slug    Term slug, or an empty string for "All".
 * @return {string} URL.
 */
const buildUrl = (context, slug) => {
	const url = new URL(state.url);

	if (slug) {
		url.searchParams.set(context.param, slug);
	} else {
		url.searchParams.delete(context.param);
	}
	url.searchParams.delete(context.pageParam);
	// Start over from the first page after "Load more" (infinite scroll block).
	url.searchParams.delete(context.pageParam.replace(/-page$/, "-loaded"));

	return url.href;
};

/**
 * The selected slug: read from the URL in query mode so it always matches the
 * results (including after back/forward), fixed by the server in archive mode.
 *
 * @param {Object} context Block context.
 * @return {string} Selected slug.
 */
const getSelected = (context) => {
	if (context.mode !== "query") {
		return context.selected;
	}
	return new URL(state.url).searchParams.get(context.param) || "";
};

const prefersReducedMotion = () =>
	window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Scroll the carousel by most of its visible width.
 *
 * @param {number} direction 1 for next, -1 for previous.
 */
const scrollCarousel = (direction) => {
	const { ref } = getElement();
	const viewport = ref
		.closest(".wp-block-blocklayouts-category-filter")
		?.querySelector(".wp-block-blocklayouts-category-filter__viewport");

	if (!viewport) {
		return;
	}

	const isRtl = window.getComputedStyle(viewport).direction === "rtl";

	viewport.scrollBy({
		left: direction * (isRtl ? -1 : 1) * viewport.clientWidth * 0.8,
		behavior: prefersReducedMotion() ? "auto" : "smooth",
	});
};

const { state } = store("blocklayouts/category-filter", {
	state: {
		url: window.location.href,
	},

	actions: {
		/**
		 * Filter the Query Loop without a full page load.
		 *
		 * Falls back to the link's normal navigation when the Query Loop has no
		 * router region (i.e. "Reload full page" is on) or in archive mode.
		 */
		select: withSyncEvent(function* (event) {
			const context = getContext();

			if (
				context.mode !== "query" ||
				event.defaultPrevented ||
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.altKey
			) {
				return;
			}

			const region = getRegion(context.queryId);
			if (!region) {
				return;
			}

			event.preventDefault();

			if (getSelected(context) === context.slug) {
				return;
			}

			const href = buildUrl(context, context.slug);
			const previousUrl = state.url;

			// Update the selection right away; results follow.
			state.url = href;
			context.isLoading = true;
			region.setAttribute("aria-busy", "true");

			try {
				const { actions: router } = yield loadRouter();
				yield router.navigate(href);
				state.url = window.location.href;
			} catch (error) {
				state.url = previousUrl;
				window.location.assign(href);
			} finally {
				context.isLoading = false;
				region.removeAttribute("aria-busy");
			}
		}),

		/**
		 * Warm the router cache when a user is about to pick an option.
		 */
		*prefetch() {
			const context = getContext();

			if (
				context.mode !== "query" ||
				getSelected(context) === context.slug ||
				!getRegion(context.queryId)
			) {
				return;
			}

			const { actions: router } = yield loadRouter();
			yield router.prefetch(buildUrl(context, context.slug));
		},

		scrollPrev() {
			scrollCarousel(-1);
		},

		scrollNext() {
			scrollCarousel(1);
		},
	},

	callbacks: {
		/**
		 * Keep each link's href and active state in sync with the URL.
		 */
		syncLink() {
			const context = getContext();
			const { ref } = getElement();
			const isActive = getSelected(context) === context.slug;

			ref.classList.toggle("is-active", isActive);

			if (isActive) {
				ref.setAttribute("aria-current", "page");
			} else {
				ref.removeAttribute("aria-current");
			}

			if (context.mode === "query") {
				ref.setAttribute("href", buildUrl(context, context.slug));
			}
		},

		/**
		 * Track browser back/forward so the selection follows the URL.
		 */
		init() {
			const onPopState = () => {
				state.url = window.location.href;
			};

			window.addEventListener("popstate", onPopState);
			return () => window.removeEventListener("popstate", onPopState);
		},

		/**
		 * Carousel: arrow visibility, edge masks, drag to scroll and keeping the
		 * selected option in view.
		 */
		initCarousel() {
			const context = getContext();
			const { ref: viewport } = getElement();

			let frame = 0;
			const update = () => {
				const max = viewport.scrollWidth - viewport.clientWidth;
				const position = Math.abs(viewport.scrollLeft);

				context.canScrollPrev = position > 1;
				context.canScrollNext = position < max - 1;
			};
			const scheduleUpdate = () => {
				window.cancelAnimationFrame(frame);
				frame = window.requestAnimationFrame(update);
			};

			// Center the selected option when it starts out of view, without
			// moving the page.
			const active = viewport.querySelector('[aria-current="page"]');
			if (active) {
				const viewportRect = viewport.getBoundingClientRect();
				const activeRect = active.getBoundingClientRect();

				if (
					activeRect.left < viewportRect.left ||
					activeRect.right > viewportRect.right
				) {
					viewport.scrollLeft +=
						activeRect.left -
						viewportRect.left -
						(viewportRect.width - activeRect.width) / 2;
				}
			}

			update();

			viewport.addEventListener("scroll", scheduleUpdate, { passive: true });

			const resizeObserver = new window.ResizeObserver(scheduleUpdate);
			resizeObserver.observe(viewport);
			if (viewport.firstElementChild) {
				resizeObserver.observe(viewport.firstElementChild);
			}

			// Drag to scroll with a mouse; touch and trackpads scroll natively.
			let drag = null;
			let hasDragged = false;

			const onPointerMove = (event) => {
				if (!drag) {
					return;
				}

				const distance = event.clientX - drag.startX;
				if (!hasDragged && Math.abs(distance) < 5) {
					return;
				}

				hasDragged = true;
				viewport.classList.add("is-dragging");
				viewport.scrollLeft = drag.startScroll - distance;
			};

			const onPointerUp = () => {
				drag = null;
				viewport.classList.remove("is-dragging");
				window.removeEventListener("pointermove", onPointerMove);
				window.removeEventListener("pointerup", onPointerUp);
			};

			const onPointerDown = (event) => {
				if (event.pointerType !== "mouse" || event.button !== 0) {
					return;
				}

				drag = { startX: event.clientX, startScroll: viewport.scrollLeft };
				hasDragged = false;
				window.addEventListener("pointermove", onPointerMove);
				window.addEventListener("pointerup", onPointerUp);
			};

			// A drag must not count as a click on the option under the cursor.
			const onClickCapture = (event) => {
				if (hasDragged) {
					event.preventDefault();
					event.stopPropagation();
					hasDragged = false;
				}
			};

			const onDragStart = (event) => event.preventDefault();

			viewport.addEventListener("pointerdown", onPointerDown);
			viewport.addEventListener("click", onClickCapture, true);
			viewport.addEventListener("dragstart", onDragStart);

			return () => {
				window.cancelAnimationFrame(frame);
				resizeObserver.disconnect();
				onPointerUp();
				viewport.removeEventListener("scroll", scheduleUpdate);
				viewport.removeEventListener("pointerdown", onPointerDown);
				viewport.removeEventListener("click", onClickCapture, true);
				viewport.removeEventListener("dragstart", onDragStart);
			};
		},
	},
});
