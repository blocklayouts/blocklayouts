/**
 * External dependencies
 */
import classnames from "classnames";

/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { __experimentalToolsPanel as ToolsPanel } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { createHigherOrderComponent } from "@wordpress/compose";
import { addFilter } from "@wordpress/hooks";
import { InspectorControls } from "@wordpress/block-editor";
import { getBlockType } from "@wordpress/blocks";

/*
 * Internal dependencies
 */
import Position from "./controls/position";
import ZIndex from "./controls/z-index";
import Transform from "./controls/transform";
import CustomCSS from "./controls/custom-css";
import Opacity from "./controls/opacity";
import OverflowHidden from "./controls/overflow-hidden";
import BackgroundBlur from "./controls/background-blur";

import { registerAdditionalCSSAttributes } from "./attributes";

import "./editor.scss";

/**
 * Generate inline styles for additional CSS
 */
const generateInlineStyles = (additionalCSS, isEditor = false) => {
	const {
		position,
		overflowHidden,
		top,
		right,
		bottom,
		left,
		zIndex,
		rotate,
		translateX,
		translateY,
		translateZ,
		opacity,
		blur,
	} = additionalCSS;

	// Transform utility
	const createTransformStyle = (rotate, translateX, translateY, translateZ) => {
		const transformParts = [];

		if (rotate) {
			transformParts.push(`rotate(${rotate}deg)`);
		}

		if (translateX || translateY || translateZ) {
			transformParts.push(
				`translate3d(${translateX || 0}, ${translateY || 0}, ${
					translateZ || 0
				})`,
			);
		}

		return transformParts.length > 0 ? transformParts.join(" ") : undefined;
	};

	// Blur filter utility
	const createBlurFilter = (blur) => (blur ? `blur(${blur})` : undefined);

	return {
		// Position and layout styles
		...(position && (isEditor ? position !== "fixed" : true) && { position }),
		...(top && { top }),
		...(right && { right }),
		...(bottom && { bottom }),
		...(left && { left }),
		...(zIndex && { zIndex }),
		...(opacity !== undefined && { opacity }),
		// overflow
		...(overflowHidden && {
			overflow: "hidden",
		}),

		// Transform styles
		transform: createTransformStyle(rotate, translateX, translateY, translateZ),
		backdropFilter: createBlurFilter(blur),
	};
};

/**
 * Process custom CSS with responsive breakpoints
 */
const processCustomCSS = (customCSS, selector) => {
	if (!customCSS || !selector) return "";

	// Replace "selector" with the actual selector
	let blockCustomCSS = customCSS.replace(/selector/g, `.${selector}`);

	// Responsive CSS handling
	// @mobile { ... } => @media (max-width: 779px)  { ... }
	// @tablet { ... } => @media (min-width: 780px) and (max-width: 1024px) { ... }
	// @desktop { ... } => @media (min-width: 1025px) { ... }
	blockCustomCSS = blockCustomCSS
		.replace(/@mobile\s*{([^}]*)}/g, "@media (max-width: 779px) {$1}")
		.replace(
			/@tablet\s*{([^}]*)}/g,
			"@media (min-width: 780px) and (max-width: 1024px) {$1}",
		)
		.replace(/@desktop\s*{([^}]*)}/g, "@media (min-width: 1025px) {$1}");

	return blockCustomCSS;
};

/**
 * Register Additional CSS attributes
 */
addFilter(
	"blocks.registerBlockType",
	"blocklayouts/additional-css/add-attributes",
	registerAdditionalCSSAttributes,
);

/**
 * Add Additional CSS inspector controls to the block editor
 */
addFilter(
	"editor.BlockEdit",
	"blocklayouts/additional-css/add-inspector-controls",
	createHigherOrderComponent((BlockEdit) => {
		return (props) => {
			const { name, attributes, setAttributes, clientId } = props;

			// Get block type definition
			const blockType = getBlockType(name);

			// A block is considered dynamic if it has no save function or save returns null
			const isDynamic =
				!blockType.save ||
				blockType.save === undefined ||
				(blockType.save.name === "save" &&
					blockType.save.toString() === "()=>null");

			// Skip dynamic blocks
			if (isDynamic) {
				return <BlockEdit {...props} />;
			}

			const { additionalCSS = {} } = attributes;

			const {
				usePosition,
				useTransform,
				useBackgroundBlur,
				useOpacity,
				useOverflow,
				useCustomCSS,
			} = useSelect((select) => {
				const { get } = select("core/preferences");
				return {
					usePosition: get("blocklayouts/preferences", "cssPosition") ?? true,
					useTransform: get("blocklayouts/preferences", "cssTransform") ?? true,
					useBackgroundBlur:
						get("blocklayouts/preferences", "cssBackgroundBlur") ?? true,
					useOpacity: get("blocklayouts/preferences", "cssOpacity") ?? true,
					useOverflow: get("blocklayouts/preferences", "cssOverflow") ?? true,
					useCustomCSS: get("blocklayouts/preferences", "cssCustomCSS") ?? true,
				};
			}, []);

			return (
				<>
					<BlockEdit key="edit" {...props} />
					<InspectorControls group="styles">
						<ToolsPanel
							label={__("Additional CSS", "blocklayouts")}
							resetAll={() => {
								setAttributes({
									additionalCSS: {
										position: undefined,
										top: undefined,
										right: undefined,
										bottom: undefined,
										left: undefined,
										zIndex: undefined,
										rotate: undefined,
										translateX: undefined,
										translateY: undefined,
										blur: undefined,
										opacity: undefined,
										overflowHidden: undefined,
									},
								});
							}}
							dropdownMenuProps={{
								popoverProps: {
									placement: "left-start",
									offset: 259,
								},
							}}
						>
							{usePosition && (
								<>
									<Position
										setAttributes={setAttributes}
										additionalCSS={additionalCSS}
									/>

									<ZIndex
										setAttributes={setAttributes}
										additionalCSS={additionalCSS}
									/>
								</>
							)}
							{useTransform && (
								<Transform
									setAttributes={setAttributes}
									additionalCSS={additionalCSS}
								/>
							)}

							{useBackgroundBlur && (
								<BackgroundBlur
									setAttributes={setAttributes}
									additionalCSS={additionalCSS}
								/>
							)}

							{useOpacity && (
								<Opacity
									setAttributes={setAttributes}
									additionalCSS={additionalCSS}
								/>
							)}

							{useOverflow && (
								<OverflowHidden
									setAttributes={setAttributes}
									additionalCSS={additionalCSS}
								/>
							)}

							{useCustomCSS && (
								<CustomCSS
									setAttributes={setAttributes}
									additionalCSS={additionalCSS}
								/>
							)}
						</ToolsPanel>
					</InspectorControls>
				</>
			);
		};
	}, "withAdditionalCSSControls"),
);

/**
 * Add Additional CSS classes and styles to saved block
 */
addFilter(
	"blocks.getSaveContent.extraProps",
	"blocklayouts/additional-css/add-save-props",
	(extraProps, blockType, attributes) => {
		const { additionalCSS = {} } = attributes;
		const { position, overflowHidden, selector } = additionalCSS;

		// Generate classes
		extraProps.className = classnames(extraProps.className, {
			[`position-${position}`]: position,
			"overflow-hidden": overflowHidden,
			[`${selector}`]: selector,
		});

		// Generate inline styles
		const inlineStyle = generateInlineStyles(additionalCSS, false);
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
 * Add Additional CSS classes and styles to block in editor
 */
addFilter(
	"editor.BlockListBlock",
	"blocklayouts/additional-css/add-editor-props",
	createHigherOrderComponent((BlockListBlock) => {
		return (props) => {
			const { attributes } = props;
			const { additionalCSS = {} } = attributes;
			const { customCSS, selector, position, overflowHidden } = additionalCSS;

			// Generate classes
			const classes = classnames(props?.className, {
				[`position-${position}`]: position,
				"overflow-hidden": overflowHidden,
				[`${selector}`]: selector,
			});

			// Generate inline styles
			const inlineStyle = generateInlineStyles(additionalCSS, true);
			const cleanedInlineStyle = Object.fromEntries(
				Object.entries(inlineStyle).filter(([, value]) => value !== undefined),
			);

			// If custom CSS exists, render it
			if (customCSS && selector) {
				const blockCustomCSS = processCustomCSS(customCSS, selector);

				return (
					<>
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
						<style>{blockCustomCSS}</style>
					</>
				);
			}

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
	}, "withAdditionalCSSEditorProps"),
);
