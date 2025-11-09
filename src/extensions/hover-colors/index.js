/**
 * Hover Colors Extension
 * Handles hover color effects for text, background, and borders
 */

/**
 * External dependencies
 */
import classnames from "classnames";

/**
 * WordPress dependencies
 */
import { createHigherOrderComponent } from "@wordpress/compose";
import { addFilter } from "@wordpress/hooks";
import { getBlockSupport, getBlockType } from "@wordpress/blocks";
import { InspectorControls } from "@wordpress/block-editor";

/**
 * Internal dependencies
 */
import HoverColorsControls from "./controls";
import { hoverColorsAttributes } from "./attributes";
import "./editor.scss";

/**
 * Generate classes for hover colors
 */
export const generateHoverColorsClasses = (attributes) => {
	const {
		hoverTextColor,
		customHoverTextColor,
		hoverBackgroundColor,
		customHoverBackgroundColor,
		hoverBorderColor,
		customHoverBorderColor,
	} = attributes;

	return {
		"has-hover__color": hoverTextColor || customHoverTextColor,
		"has-hover__background-color":
			hoverBackgroundColor || customHoverBackgroundColor,
		"has-hover__border-color": hoverBorderColor || customHoverBorderColor,
	};
};

/**
 * Generate inline styles for hover colors
 */
export const generateHoverColorsStyles = (attributes) => {
	const {
		hoverTextColor,
		customHoverTextColor,
		hoverBackgroundColor,
		customHoverBackgroundColor,
		hoverBorderColor,
		customHoverBorderColor,
		hoverTransitionDuration = 160,
	} = attributes;

	const getColorValue = (presetColor, customColor) => {
		return presetColor
			? `var(--wp--preset--color--${presetColor})`
			: customColor || undefined;
	};

	const hasHoverColors =
		hoverTextColor ||
		customHoverTextColor ||
		hoverBackgroundColor ||
		customHoverBackgroundColor ||
		hoverBorderColor ||
		customHoverBorderColor;

	return {
		"--hover-color": getColorValue(hoverTextColor, customHoverTextColor),
		"--hover-background-color": getColorValue(
			hoverBackgroundColor,
			customHoverBackgroundColor,
		),
		"--hover-border-color": getColorValue(
			hoverBorderColor,
			customHoverBorderColor,
		),

		// Add transition properties if any hover colors are set
		...(hasHoverColors && {
			transitionDuration: `${hoverTransitionDuration}ms`,
			transitionProperty: "color, background-color, border-color",
			transitionTimingFunction: "ease-in-out",
		}),
	};
};

/**
 * Register Hover Colors attributes
 */
addFilter(
	"blocks.registerBlockType",
	"blocklayouts/hover-colors/add-attributes",
	(settings, name) => {
		// Only add to blocks with text color support
		const colorSupport = getBlockSupport(settings, "color");
		const hasTextColorSupport = colorSupport && colorSupport.text !== false;

		if (!hasTextColorSupport) {
			return settings;
		}

		return {
			...settings,
			attributes: {
				...settings.attributes,
				...hoverColorsAttributes,
			},
		};
	},
);

/**
 * Add Hover Colors inspector controls to the block editor
 */
addFilter(
	"editor.BlockEdit",
	"blocklayouts/hover-colors/add-inspector-controls",
	createHigherOrderComponent((BlockEdit) => {
		return (props) => {
			const { name, attributes, setAttributes, clientId } = props;

			// Get block type definition
			const blockType = getBlockType(name);

			// Color text support check
			const colorSupport = getBlockSupport(blockType, "color");
			const hasTextColorSupport = colorSupport && colorSupport.text !== false;

			// A block is considered dynamic if it has no save function or save returns null
			const isDynamic =
				!blockType.save ||
				blockType.save === undefined ||
				(blockType.save.name === "save" &&
					blockType.save.toString() === "()=>null");

			// Skip if not supported or dynamic
			if (!hasTextColorSupport || isDynamic) {
				return <BlockEdit {...props} />;
			}

			return (
				<>
					<BlockEdit key="edit" {...props} />
					<InspectorControls group="color">
						<HoverColorsControls
							attributes={attributes}
							setAttributes={setAttributes}
							clientId={clientId}
						/>
					</InspectorControls>
				</>
			);
		};
	}, "withHoverColorsControls"),
);

/**
 * Add Hover Colors classes and styles to saved block
 */
addFilter(
	"blocks.getSaveContent.extraProps",
	"blocklayouts/hover-colors/add-save-props",
	(extraProps, blockType, attributes) => {
		// Generate classes
		const classes = generateHoverColorsClasses(attributes);
		extraProps.className = classnames(extraProps.className, classes);

		// Generate inline styles
		const inlineStyle = generateHoverColorsStyles(attributes);
		const cleanedStyles = Object.fromEntries(
			Object.entries(inlineStyle).filter(([, value]) => value !== undefined),
		);

		extraProps.style = {
			...extraProps.style,
			...cleanedStyles,
		};

		return extraProps;
	},
);

/**
 * Add Hover Colors classes and styles to block in editor
 */
addFilter(
	"editor.BlockListBlock",
	"blocklayouts/hover-colors/add-editor-props",
	createHigherOrderComponent((BlockListBlock) => {
		return (props) => {
			const { attributes } = props;

			// Generate classes
			const classes = classnames(
				props?.className,
				generateHoverColorsClasses(attributes),
			);

			// Generate inline styles
			const inlineStyle = generateHoverColorsStyles(attributes);
			const cleanedInlineStyle = Object.fromEntries(
				Object.entries(inlineStyle).filter(([, value]) => value !== undefined),
			);

			return (
				<BlockListBlock
					{...props}
					className={classes}
					wrapperProps={{
						...props.wrapperProps,
						style: {
							...props.wrapperProps?.style,
							...cleanedInlineStyle,
						},
					}}
				/>
			);
		};
	}, "withHoverColorsEditorProps"),
);

// Export the controls component for use in main index.js
export { HoverColorsControls };
