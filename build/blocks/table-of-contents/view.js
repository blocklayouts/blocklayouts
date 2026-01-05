/******/ (() => { // webpackBootstrap
/*!**********************************************!*\
  !*** ./src/blocks/table-of-contents/view.js ***!
  \**********************************************/
/**
 * Table of Contents - Frontend Script
 *
 * Handles smooth scroll behavior for TOC links.
 *
 * @package BlockLayouts
 */

(function () {
  'use strict';

  // Smooth scroll behavior for TOC links
  document.addEventListener('DOMContentLoaded', function () {
    const tocLinks = document.querySelectorAll('.wp-block-blocklayouts-table-of-contents.smooth-scroll .wp-block-blocklayouts-table-of-contents__link');
    tocLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // Update URL without triggering scroll
          if (history.pushState) {
            history.pushState(null, null, '#' + targetId);
          }
        }
      });
    });
  });
})();
/******/ })()
;
//# sourceMappingURL=view.js.map