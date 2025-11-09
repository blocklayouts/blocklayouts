document.addEventListener("DOMContentLoaded", function () {
	const effectsController = {
		init() {
			this.setupScrollTriggers();
		},
		setupScrollTriggers() {
			const scrollElements = document.querySelectorAll(
				".has-animation-effect.animation-trigger-onScroll",
			);
			if (scrollElements.length === 0) return;
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							entry.target.classList.add("animation-play");
						} else {
							entry.target.classList.remove("animation-play");
							entry.target.offsetHeight;
						}
					});
				},
				{
					threshold: 0.4,
					rootMargin: "50px",
				},
			);
			scrollElements.forEach((el) => observer.observe(el));
		},
	};
	effectsController.init();
});
