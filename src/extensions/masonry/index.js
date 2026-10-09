/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { ToggleControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
/**
 * Internal dependencies
 */
import "./editor.scss";

/**
 * Add masonry attributes to core/group and core/gallery blocks
 */
addFilter(
	"blocks.registerBlockType",
	"blocklayouts/masonry/add-attributes",
	(settings, name) => {
		if (name !== "core/group" && name !== "core/gallery") {
			return settings;
		}

		return {
			...settings,
			attributes: {
				...settings.attributes,
				enableMasonry: {
					type: "boolean",
					default: false,
				},
			},
		};
	},
);

/**
 * Add inspector controls for Masonry settings
 */
export const Masonry = ({ name, attributes, setAttributes, clientId }) => {
	// Check if this is a supported block
	const isGroup = name === "core/group" && attributes?.layout?.type === "grid";
	const isGallery = name === "core/gallery";

	// Only show for core/group with grid layout or core/gallery
	if (!isGroup && !isGallery) {
		return;
	}

	const { useMasonry } = useSelect((select) => {
		const { get } = select("core/preferences");
		return {
			useMasonry: get("blocklayouts/preferences", "masonry") ?? true,
		};
	}, []);

	if (!useMasonry) {
		return;
	}

	const { enableMasonry = false } = attributes;

	return (
		<InspectorControls group="advanced">
			<ToggleControl
				label={__("Masonry", "blocklayouts")}
				checked={enableMasonry}
				onChange={(value) => setAttributes({ enableMasonry: value })}
				help={__(
					"Apply masonry layout to this grid. Effect will be visible on the frontend.",
					"blocklayouts",
				)}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
		</InspectorControls>
	);
};

/**
 * Add data attributes to block save output for frontend masonry
 */
addFilter(
	"blocks.getSaveContent.extraProps",
	"blocklayouts/masonry/add-save-props",
	(extraProps, blockType, attributes) => {
		// Check if masonry is enabled
		if (!attributes?.enableMasonry) {
			return extraProps;
		}

		// Handle core/group block
		if (
			blockType.name === "core/group" &&
			attributes?.layout?.type === "grid"
		) {
			const { layout = {}, style = {} } = attributes;

			// Get layout settings
			const minimumColumnWidth = layout.minimumColumnWidth || "12rem";
			const columnCount = layout.columnCount;

			// Get spacing from style.spacing.blockGap
			const blockGap = style?.spacing?.blockGap;

			return {
				...extraProps,
				className: `${extraProps.className || ""} is-masonry-grid`.trim(),
				"data-masonry-enabled": "true",
				"data-masonry-minimum-column-width": minimumColumnWidth,
				...(columnCount && { "data-masonry-column-count": columnCount }),
				...(blockGap && { "data-masonry-block-gap": JSON.stringify(blockGap) }),
			};
		}

		// Handle core/gallery block
		if (blockType.name === "core/gallery") {
			const { style = {} } = attributes;

			// Get gallery columns (default to 3 if not specified)
			const columns = attributes.columns || 3;

			// Get spacing from style.spacing.blockGap
			const blockGap = style?.spacing?.blockGap;

			return {
				...extraProps,
				className: `${extraProps.className || ""} is-masonry-grid`.trim(),
				"data-masonry-enabled": "true",
				"data-masonry-column-count": columns,
				...(blockGap && { "data-masonry-block-gap": JSON.stringify(blockGap) }),
			};
		}

		return extraProps;
	},
);
