document.addEventListener("DOMContentLoaded", function () {
	// MiniMasonry Constructor
	var MiniMasonry = function (conf) {
		this._sizes = [];
		this._columns = [];
		this._container = null;
		this._count = null;
		this._width = 0;
		this._removeListener = null;
		this._currentGutterX = null;
		this._currentGutterY = null;
		this._resizeTimeout = null;

		this.conf = {
			baseWidth: 255,
			gutterX: null,
			gutterY: null,
			gutter: 10,
			container: null,
			minify: true,
			ultimateGutter: 5,
			surroundingGutter: true,
			direction: "ltr",
			wedge: false,
		};

		this.init(conf);
		return this;
	};

	MiniMasonry.prototype.init = function (conf) {
		for (var i in this.conf) {
			if (conf[i] != undefined) {
				this.conf[i] = conf[i];
			}
		}

		if (this.conf.gutterX == null || this.conf.gutterY == null) {
			this.conf.gutterX = this.conf.gutterY = this.conf.gutter;
		}

		this._currentGutterX = this.conf.gutterX;
		this._currentGutterY = this.conf.gutterY;

		this._container =
			typeof this.conf.container == "object" && this.conf.container.nodeName
				? this.conf.container
				: document.querySelector(this.conf.container);

		if (!this._container) {
			throw new Error("Container not found or missing");
		}

		// Get container padding to respect it in positioning
		var computedStyle = window.getComputedStyle(this._container);
		this._paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
		this._paddingTop = parseFloat(computedStyle.paddingTop) || 0;
		this._paddingRight = parseFloat(computedStyle.paddingRight) || 0;
		this._paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;

		var onResize = this.resizeThrottler.bind(this);
		window.addEventListener("resize", onResize);

		this._removeListener = function () {
			window.removeEventListener("resize", onResize);
			if (this._resizeTimeout != null) {
				window.clearTimeout(this._resizeTimeout);
				this._resizeTimeout = null;
			}
		};

		this.layout();
	};

	MiniMasonry.prototype.reset = function () {
		this._sizes = [];
		this._columns = [];
		this._count = null;

		// Update padding values (in case they changed)
		var computedStyle = window.getComputedStyle(this._container);
		this._paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
		this._paddingTop = parseFloat(computedStyle.paddingTop) || 0;
		this._paddingRight = parseFloat(computedStyle.paddingRight) || 0;
		this._paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;

		// Account for padding when calculating available width
		this._width =
			this._container.clientWidth - this._paddingLeft - this._paddingRight;

		var minWidth = this.conf.baseWidth;

		if (this._width < minWidth) {
			this._width = minWidth;
			this._container.style.minWidth = minWidth + "px";
		}

		if (this.getCount() == 1) {
			this._currentGutterX = this.conf.ultimateGutter;
			this._count = 1;
		} else if (this._width < this.conf.baseWidth + 2 * this._currentGutterX) {
			this._currentGutterX = 0;
		} else {
			this._currentGutterX = this.conf.gutterX;
		}
	};

	MiniMasonry.prototype.getCount = function () {
		if (this.conf.surroundingGutter) {
			return Math.floor(
				(this._width - this._currentGutterX) /
					(this.conf.baseWidth + this._currentGutterX)
			);
		}
		return Math.floor(
			(this._width + this._currentGutterX) /
				(this.conf.baseWidth + this._currentGutterX)
		);
	};

	MiniMasonry.prototype.computeWidth = function () {
		var width;

		if (this.conf.surroundingGutter) {
			width =
				(this._width - this._currentGutterX) / this._count -
				this._currentGutterX;
		} else {
			width =
				(this._width + this._currentGutterX) / this._count -
				this._currentGutterX;
		}

		width = Number.parseFloat(width.toFixed(2));
		return width;
	};

	MiniMasonry.prototype.layout = function () {
		if (!this._container) {
			console.error("Container not found");
			return;
		}

		// Set container to relative positioning for absolute children
		this._container.style.position = "relative";

		this.reset();

		if (this._count == null) {
			this._count = this.getCount();
		}

		var colWidth = this.computeWidth();

		for (var i = 0; i < this._count; i++) {
			this._columns[i] = 0;
		}

		var children = this._container.children;

		for (var k = 0; k < children.length; k++) {
			children[k].style.position = "absolute";
			children[k].style.width = colWidth + "px";
			this._sizes[k] = children[k].clientHeight;
		}

		var startX;

		if (this.conf.direction == "ltr") {
			startX = this.conf.surroundingGutter ? this._currentGutterX : 0;
		} else {
			startX =
				this._width - (this.conf.surroundingGutter ? this._currentGutterX : 0);
		}

		if (this._count > this._sizes.length) {
			var occupiedSpace =
				this._sizes.length * (colWidth + this._currentGutterX) -
				this._currentGutterX;

			if (this.conf.wedge === false) {
				if (this.conf.direction == "ltr") {
					startX = (this._width - occupiedSpace) / 2;
				} else {
					startX = this._width - (this._width - occupiedSpace) / 2;
				}
			} else {
				if (this.conf.direction == "ltr") {
					//
				} else {
					startX = this._width - this._currentGutterX;
				}
			}
		}

		for (var index = 0; index < children.length; index++) {
			var nextColumn = this.conf.minify
				? this.getShortest()
				: this.getNextColumn(index);

			var childrenGutter = 0;

			if (this.conf.surroundingGutter || nextColumn != this._columns.length) {
				childrenGutter = this._currentGutterX;
			}

			var x;

			if (this.conf.direction == "ltr") {
				x = startX + (colWidth + childrenGutter) * nextColumn;
			} else {
				x = startX - (colWidth + childrenGutter) * nextColumn - colWidth;
			}

			var y = this._columns[nextColumn];

			children[index].style.transform =
				"translate3d(" + Math.round(x) + "px," + Math.round(y) + "px,0)";

			this._columns[nextColumn] +=
				this._sizes[index] +
				(this._count > 1 ? this.conf.gutterY : this.conf.ultimateGutter);
		}

		// Set container height
		// For border-box (WordPress default), height includes padding
		// For content-box, padding is added automatically by the browser
		// We add padding to accommodate border-box while not breaking content-box
		var contentHeight = this._columns[this.getLongest()] - this._currentGutterY;
		var boxSizing = window.getComputedStyle(this._container).boxSizing;

		if (boxSizing === "border-box") {
			this._container.style.height =
				contentHeight + this._paddingTop + this._paddingBottom + "px";
		} else {
			this._container.style.height = contentHeight + "px";
		}
	};

	MiniMasonry.prototype.getNextColumn = function (index) {
		return index % this._columns.length;
	};

	MiniMasonry.prototype.getShortest = function () {
		var shortest = 0;
		for (var i = 0; i < this._count; i++) {
			if (this._columns[i] < this._columns[shortest]) {
				shortest = i;
			}
		}
		return shortest;
	};

	MiniMasonry.prototype.getLongest = function () {
		var longest = 0;
		for (var i = 0; i < this._count; i++) {
			if (this._columns[i] > this._columns[longest]) {
				longest = i;
			}
		}
		return longest;
	};

	MiniMasonry.prototype.resizeThrottler = function () {
		if (!this._resizeTimeout) {
			this._resizeTimeout = setTimeout(
				function () {
					this._resizeTimeout = null;
					if (this._container.clientWidth != this._width) {
						this.layout();
					}
				}.bind(this),
				33
			);
		}
	};

	MiniMasonry.prototype.destroy = function () {
		if (typeof this._removeListener == "function") {
			this._removeListener();
		}

		var children = this._container.children;

		for (var k = 0; k < children.length; k++) {
			children[k].style.removeProperty("position");
			children[k].style.removeProperty("width");
			children[k].style.removeProperty("transform");
		}

		this._container.style.removeProperty("position");
		this._container.style.removeProperty("height");
		this._container.style.removeProperty("min-width");
	};

	// Masonry Controller - Automatic initialization
	const masonryController = {
		instances: new Map(),

		init() {
			this.initMasonryGrids();
		},

		/**
		 * Parse CSS value to pixels
		 */
		parseToPixels(value, containerWidth) {
			if (!value) return 0;

			// Remove whitespace
			value = String(value).trim();

			// If it's just a number, treat as pixels
			if (/^\d+\.?\d*$/.test(value)) {
				return parseFloat(value);
			}

			// Parse px values
			if (value.endsWith("px")) {
				return parseFloat(value);
			}

			// Parse rem values (assuming 16px base)
			if (value.endsWith("rem")) {
				return parseFloat(value) * 16;
			}

			// Parse em values (assuming 16px base)
			if (value.endsWith("em")) {
				return parseFloat(value) * 16;
			}

			// Parse percentage values
			if (value.endsWith("%")) {
				return (parseFloat(value) / 100) * containerWidth;
			}

			// Parse vw values
			if (value.endsWith("vw")) {
				return (parseFloat(value) / 100) * window.innerWidth;
			}

			// Default fallback
			return parseFloat(value) || 0;
		},

		/**
		 * Calculate base width from column count
		 */
		calculateBaseWidth(grid, columnCount, gutter) {
			// Get container padding
			const computedStyle = window.getComputedStyle(grid);
			const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
			const paddingRight = parseFloat(computedStyle.paddingRight) || 0;

			// Calculate available width accounting for padding
			const containerWidth = grid.clientWidth - paddingLeft - paddingRight;
			// With surroundingGutter: false, we only have gutters between columns
			const totalGutterSpace = gutter * (columnCount - 1);
			const availableWidth = containerWidth - totalGutterSpace;
			return Math.floor(availableWidth / columnCount);
		},

		initMasonryGrids() {
			const masonryGrids = document.querySelectorAll(
				".is-masonry-grid[data-masonry-enabled='true']"
			);

			masonryGrids.forEach((grid) => {
				// Skip if already initialized
				if (this.instances.has(grid)) {
					return;
				}

				// Get computed style for padding calculations
				const computedStyle = window.getComputedStyle(grid);
				const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
				const paddingRight = parseFloat(computedStyle.paddingRight) || 0;

				// Get container width for percentage calculations (excluding padding)
				const containerWidth = grid.clientWidth - paddingLeft - paddingRight;

				// Parse blockGap - handle WordPress preset values
				let gutter = 10;

				if (grid.dataset.masonryBlockGap) {
					try {
						const blockGap = JSON.parse(grid.dataset.masonryBlockGap);

						if (typeof blockGap === "string") {
							// Check if it's a WordPress preset (e.g., "var:preset|spacing|30")
							if (blockGap.startsWith("var:preset|")) {
								// Get computed gap from CSS (WordPress converts presets to CSS variables)
								const computedGap = computedStyle.gap || computedStyle.gridGap;

								if (computedGap && computedGap !== "normal") {
									gutter = parseFloat(computedGap);
								}
							} else {
								// Regular CSS value (e.g., "20px", "2rem")
								gutter = this.parseToPixels(blockGap, containerWidth);
							}
						}
					} catch (e) {
						console.warn("Failed to parse blockGap:", e);

						// Fallback: Try to get computed gap from CSS
						try {
							const computedGap = computedStyle.gap || computedStyle.gridGap;
							if (computedGap && computedGap !== "normal") {
								gutter = parseFloat(computedGap);
							}
						} catch (err) {
							// Use default gutter of 10px
						}
					}
				}

				// Calculate base width
				let baseWidth = 300; // default
				const minimumColumnWidth = grid.dataset.masonryMinimumColumnWidth;
				const columnCount = grid.dataset.masonryColumnCount;

				if (columnCount) {
					// Calculate from column count
					const columns = parseInt(columnCount);
					baseWidth = this.calculateBaseWidth(grid, columns, gutter);
				} else if (minimumColumnWidth) {
					// Check if it's a WordPress preset
					if (minimumColumnWidth.startsWith("var:preset|")) {
						// Try to get the actual computed width from the grid template
						const gridTemplateColumns = computedStyle.gridTemplateColumns;

						if (gridTemplateColumns && gridTemplateColumns !== "none") {
							// Extract first column width (e.g., "300px 300px" -> "300px")
							const firstColumn = gridTemplateColumns.split(" ")[0];
							baseWidth = parseFloat(firstColumn) || 300;
						} else {
							// Fallback to default
							baseWidth = 300;
						}
					} else {
						// Use minimum column width
						baseWidth = this.parseToPixels(minimumColumnWidth, containerWidth);
					}
				}

				// Read configuration from data attributes
				const config = {
					container: grid,
					baseWidth: baseWidth,
					gutter: gutter,
					minify: true,
					surroundingGutter: false,
					ultimateGutter: gutter,
					direction: "ltr",
					wedge: false,
				};

				// Initialize MiniMasonry
				try {
					const instance = new MiniMasonry(config);
					this.instances.set(grid, instance);
				} catch (error) {
					console.error("Failed to initialize masonry grid:", error);
				}
			});
		},

		destroy() {
			this.instances.forEach((instance) => {
				instance.destroy();
			});
			this.instances.clear();
		},
	};

	// Effects Controller
	const effectsController = {
		init() {
			this.setupScrollTriggers();
		},
		setupScrollTriggers() {
			const scrollElements = document.querySelectorAll(
				".has-animation-effect.animation-trigger-onScroll"
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
				}
			);
			scrollElements.forEach((el) => observer.observe(el));
		},
	};

	// Initialize all controllers
	masonryController.init();
	effectsController.init();
});
