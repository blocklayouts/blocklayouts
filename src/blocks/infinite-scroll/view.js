/**
 * WordPress dependencies.
 */
import { store, getContext, getElement } from "@wordpress/interactivity";

// Intersection Observer for infinite scroll
let intersectionObserver = null;

/**
 * Fetches the next page of content.
 * @param {string} url - The URL to fetch
 * @returns {Promise<Document|null>} Parsed HTML document or null on error
 */
const fetchNextPage = async (url) => {
  try {
    const res = await window.fetch(url);

    if (!res.ok) {
      console.error(`Failed to fetch next page. Status: ${res.status}`);
      return null;
    }

    const html = await res.text();
    return new window.DOMParser().parseFromString(html, "text/html");
  } catch (e) {
    console.error("Failed to fetch next page.", e);
    return null;
  }
};

/**
 * Handles loading new posts from the fetched page.
 * @param {HTMLElement} queryEl - Query block container element
 * @param {Document} dom - Parsed HTML document
 * @param {Object} context - Interactivity API context
 * @param {Object} state - Store state
 * @param {HTMLElement} ref - Trigger element reference
 * @returns {boolean} Success status
 */
const loadNewPosts = (queryEl, dom, context, state, ref) => {
  const postTemplate = dom.querySelector(".wp-block-post-template");

  if (!postTemplate || !postTemplate.children.length) {
    console.warn("No new post content found.");
    state.hasMore = false;
    return false;
  }

  // Add class to new content for potential animations/styling
  const fragment = document.createDocumentFragment();
  Array.from(postTemplate.children).forEach((child) => {
    child.classList.add("is-inserted-post");
    fragment.appendChild(child.cloneNode(true));
  });

  state.paged += 1;
  queryEl.querySelector(".wp-block-post-template").appendChild(fragment);

  return true;
};

const { state, actions } = store("blocklayouts/infinite-scroll", {
  state: {
    hasMore: true,
    paged: 1,
  },

  actions: {
    /**
     * Clean up observer on component unmount.
     */
    cleanup() {
      if (intersectionObserver) {
        intersectionObserver.disconnect();
        intersectionObserver = null;
      }
    },
  },

  callbacks: {
    infiniteScroll() {
      const { ref } = getElement();
      const context = getContext();

      if (!ref) return;

      // Clean up existing observer
      actions.cleanup();

      // Get trigger distance from data attribute
      const triggerDistance = parseInt(ref.dataset.triggerDistance, 10) || 100;

      // Create intersection observer with debounced handler
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          if (!entry.isIntersecting || !state.hasMore || context.isLoading) {
            return;
          }

          const queryEl = ref.closest(".wp-block-query");

          if (!queryEl) {
            console.error("Query block container not found.");
            return;
          }

          // Set loading state
          context.isLoading = true;

          const queryId = context.queryId;
          const paged = state.paged + 1;
          const pageId = `query-${queryId}-page`;

          // Build URL with updated page parameter
          const url = new URL(window.location);
          url.searchParams.set(pageId, paged);

          fetchNextPage(url.toString())
            .then((dom) => {
              if (dom) {
                loadNewPosts(queryEl, dom, context, state, ref);
              } else {
                state.hasMore = false;
              }
            })
            .catch((error) => {
              console.error("Error loading next page:", error);
              state.hasMore = false;
            })
            .finally(() => {
              context.isLoading = false;
            });
        },
        {
          rootMargin: `${triggerDistance}px`,
          threshold: 0.1,
        }
      );

      // Start observing the trigger element
      intersectionObserver.observe(ref);
    },
  },
});

// Export for potential external use
export { state, actions };
