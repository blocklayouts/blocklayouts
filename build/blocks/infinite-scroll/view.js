import * as __WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__ from "@wordpress/interactivity";
/******/ var __webpack_modules__ = ({

/***/ "@wordpress/interactivity":
/*!*******************************************!*\
  !*** external "@wordpress/interactivity" ***!
  \*******************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__;

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!********************************************!*\
  !*** ./src/blocks/infinite-scroll/view.js ***!
  \********************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   actions: () => (/* binding */ actions),
/* harmony export */   state: () => (/* binding */ state)
/* harmony export */ });
/* harmony import */ var _wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/interactivity */ "@wordpress/interactivity");
/**
 * WordPress dependencies.
 */


// Intersection Observer for infinite scroll
let intersectionObserver = null;

/**
 * Fetches the next page of content.
 * @param {string} url - The URL to fetch
 * @returns {Promise<Document|null>} Parsed HTML document or null on error
 */
const fetchNextPage = async url => {
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
  Array.from(postTemplate.children).forEach(child => {
    child.classList.add("is-inserted-post");
    fragment.appendChild(child.cloneNode(true));
  });
  state.paged += 1;
  queryEl.querySelector(".wp-block-post-template").appendChild(fragment);
  return true;
};
const {
  state,
  actions
} = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)("blocklayouts/infinite-scroll", {
  state: {
    hasMore: true,
    paged: 1
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
    }
  },
  callbacks: {
    infiniteScroll() {
      const {
        ref
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getElement)();
      const context = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      if (!ref) return;

      // Clean up existing observer
      actions.cleanup();

      // Get trigger distance from data attribute
      const triggerDistance = parseInt(ref.dataset.triggerDistance, 10) || 100;

      // Create intersection observer with debounced handler
      intersectionObserver = new IntersectionObserver(entries => {
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
        fetchNextPage(url.toString()).then(dom => {
          if (dom) {
            loadNewPosts(queryEl, dom, context, state, ref);
          } else {
            state.hasMore = false;
          }
        }).catch(error => {
          console.error("Error loading next page:", error);
          state.hasMore = false;
        }).finally(() => {
          context.isLoading = false;
        });
      }, {
        rootMargin: `${triggerDistance}px`,
        threshold: 0.1
      });

      // Start observing the trigger element
      intersectionObserver.observe(ref);
    }
  }
});

// Export for potential external use

})();

const __webpack_exports__actions = __webpack_exports__.actions;
const __webpack_exports__state = __webpack_exports__.state;
export { __webpack_exports__actions as actions, __webpack_exports__state as state };

//# sourceMappingURL=view.js.map