/**
 * Wrapper Link Extension
 * Handles wrapping blocks with links
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
import { useSelect } from "@wordpress/data";

/**
 * Internal dependencies
 */
import LinkControls from "./controls";
import { wrapperLinkAttributes } from "./attributes";
import "./editor.scss";

/**
 * Generate classes for wrapper link
 */
export const generateWrapperLinkClasses = (attributes) => {
	const { wrapperLink = {} } = attributes;
	const { href } = wrapperLink;

	return {
		"is-linked": href,
	};
};

/**
 * Generate props for wrapper link
 */
export const generateWrapperLinkProps = (attributes) => {
	const { wrapperLink = {} } = attributes;
	const { href, linkTarget, linkRel } = wrapperLink;

	if (!href) {
		return {};
	}

	return {
		href,
		...(linkTarget && { target: linkTarget }),
		...(linkRel && { rel: linkRel }),
	};
};

/**
 * Register Wrapper Link attributes
 */
addFilter(
	"blocks.registerBlockType",
	"blocklayouts/wrapper-link/add-attributes",
	(settings, name) => {
		// Also add to specific blocks by default
		const supportedBlocks = ["core/group"];

		if (!supportedBlocks.includes(name)) {
			return settings;
		}

		return {
			...settings,
			attributes: {
				...settings.attributes,
				...wrapperLinkAttributes,
			},
		};
	},
);

/**
 * Add Wrapper Link inspector controls to the block editor
 */
export const WrapperLink = ({ name, attributes, setAttributes, clientId }) => {

	// Also add to specific blocks by default
	const supportedBlocks = ["core/group"];

	if (!supportedBlocks.includes(name)) {
		return;
	}

	const { useWrapperLink } = useSelect((select) => {
		const { get } = select("core/preferences");
		return {
			useWrapperLink: get("blocklayouts/preferences", "wrapperLink") ?? true,
		};
	}, []);

	if (!useWrapperLink) {
		return;
	}

	return (
		<LinkControls
			attributes={attributes}
			setAttributes={setAttributes}
			clientId={clientId}
		/>
	);
};

/**
 * Add Wrapper Link classes to saved block
 */
addFilter(
	"blocks.getSaveContent.extraProps",
	"blocklayouts/wrapper-link/add-save-props",
	(extraProps, blockType, attributes) => {
		// Generate classes
		const classes = generateWrapperLinkClasses(attributes);
		extraProps.className = classnames(extraProps.className, classes);

		return extraProps;
	},
);

/**
 * Add Wrapper Link classes to block in editor
 */
addFilter(
	"editor.BlockListBlock",
	"blocklayouts/wrapper-link/add-editor-props",
	createHigherOrderComponent((BlockListBlock) => {
		return (props) => {
			const { attributes } = props;

			// Generate classes
			const classes = classnames(
				props?.className,
				generateWrapperLinkClasses(attributes),
			);

			return <BlockListBlock {...props} className={classes} />;
		};
	}, "withWrapperLinkEditorProps"),
);
