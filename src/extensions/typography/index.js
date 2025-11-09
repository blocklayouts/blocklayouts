/**
 * Typography Extension
 * Handles typography-related features
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
import TypographyControls from "./controls";
import { typographyAttributes } from "./attributes";

/**
 * Generate classes for typography
 */
export const generateTypographyClasses = (attributes) => {
	const { nowrap } = attributes;

	return {
		nowrap: nowrap,
	};
};

/**
 * Register Typography attributes
 */
addFilter(
	"blocks.registerBlockType",
	"blocklayouts/typography/add-attributes",
	(settings, name) => {
		// Only add to blocks with typography support
		const typographySupport = getBlockSupport(settings, "typography");
		const hasTypographySupport = typographySupport && typographySupport.fontSize !== false;

		if (!hasTypographySupport) {
			return settings;
		}

		return {
			...settings,
			attributes: {
				...settings.attributes,
				...typographyAttributes,
			},
		};
	},
);

/**
 * Add Typography inspector controls to the block editor
 */
addFilter(
	"editor.BlockEdit",
	"blocklayouts/typography/add-inspector-controls",
	createHigherOrderComponent((BlockEdit) => {
		return (props) => {
			const { name, attributes, setAttributes, clientId } = props;

			// Get block type definition
			const blockType = getBlockType(name);

			// Typography support check
			const typographySupport = getBlockSupport(blockType, "typography");
			const hasTypographySupport = typographySupport && typographySupport.fontSize !== false;

			// A block is considered dynamic if it has no save function or save returns null
			const isDynamic =
				!blockType.save ||
				blockType.save === undefined ||
				(blockType.save.name === "save" &&
					blockType.save.toString() === "()=>null");

			// Skip if not supported or dynamic
			if (!hasTypographySupport || isDynamic) {
				return <BlockEdit {...props} />;
			}

			return (
				<>
					<BlockEdit key="edit" {...props} />
					<InspectorControls group="typography">
						<TypographyControls
							attributes={attributes}
							setAttributes={setAttributes}
							clientId={clientId}
						/>
					</InspectorControls>
				</>
			);
		};
	}, "withTypographyControls"),
);

/**
 * Add Typography classes to saved block
 */
addFilter(
	"blocks.getSaveContent.extraProps",
	"blocklayouts/typography/add-save-props",
	(extraProps, blockType, attributes) => {
		// Generate classes
		const classes = generateTypographyClasses(attributes);
		extraProps.className = classnames(extraProps.className, classes);

		return extraProps;
	},
);

/**
 * Add Typography classes to block in editor
 */
addFilter(
	"editor.BlockListBlock",
	"blocklayouts/typography/add-editor-props",
	createHigherOrderComponent((BlockListBlock) => {
		return (props) => {
			const { attributes } = props;

			// Generate classes
			const classes = classnames(
				props?.className,
				generateTypographyClasses(attributes),
			);

			return (
				<BlockListBlock
					{...props}
					className={classes}
				/>
			);
		};
	}, "withTypographyEditorProps"),
);

// Export the controls component for use in main index.js
export { TypographyControls };
