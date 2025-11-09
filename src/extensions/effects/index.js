/**
 * External dependencies
 */
import classnames from "classnames";

/**
 * WordPress dependencies
 */
import { createHigherOrderComponent } from "@wordpress/compose";
import { addFilter } from "@wordpress/hooks";
import { InspectorControls } from "@wordpress/block-editor";
import { getBlockType } from "@wordpress/blocks";
import { __experimentalToolsPanel as ToolsPanel } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { useSelect } from "@wordpress/data";

/**
 * Internal dependencies
 */
import Animations from "./controls/animations";
// import Hovers from "./controls/hovers";
import { registerEffectsAttributes } from "./attributes";
import "./editor.scss";

/**
 * Generate classes for effects
 */
const generateEffectsClasses = (attributes) => {
	const { effects = {} } = attributes;
	const { animation } = effects;

	return {
		...(animation?.enabled && {
			"has-animation-effect": animation?.enabled,
			[`animation-trigger-${animation.trigger}`]: animation?.trigger,
			[`animation-preset-${animation.preset}`]: animation?.preset,
		}),
	};
};

/**
 * Generate inline styles for effects
 */
const generateEffectsStyles = (attributes) => {
	const { effects = {} } = attributes;
	const { animation } = effects;
	const { duration, delay, easing } = animation || {};

	return {
		...(animation?.enabled && {
			"--animation-duration": `${duration || 0}s`,
			"--animation-delay": `${delay || 0}s`,
			"--animation-easing": easing,
		}),
	};
};

/**
 * Register Effects attributes
 */
addFilter(
	"blocks.registerBlockType",
	"blocklayouts/effects/add-attributes",
	registerEffectsAttributes,
);

/**
 * Add Effects inspector controls to the block editor
 */
addFilter(
	"editor.BlockEdit",
	"blocklayouts/effects/add-inspector-controls",
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

			const { useAnimationsEffects } = useSelect((select) => {
				const { get } = select("core/preferences");
				return {
					useAnimationsEffects:
						get("blocklayouts/preferences", "animationsEffects") ?? true,
				};
			}, []);

			// Skip dynamic blocks
			if (isDynamic || !useAnimationsEffects) {
				return <BlockEdit {...props} />;
			}

			return (
				<>
					<BlockEdit key="edit" {...props} />
					<InspectorControls group="styles">
						<ToolsPanel
							label={__("Effects", "blocklayouts")}
							resetAll={() => {
								setAttributes({
									effects: {
										animation: {
											enabled: undefined,
											trigger: undefined,
											preset: undefined,
											duration: undefined,
											delay: undefined,
											easing: undefined,
										},
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
							<div className="blocklayouts-effects-panel__inner-wrapper">
								{useAnimationsEffects && (
									<Animations
										attributes={attributes}
										setAttributes={setAttributes}
										clientId={clientId}
									/>
								)}
							</div>
						</ToolsPanel>
					</InspectorControls>
				</>
			);
		};
	}, "withEffectsControls"),
);

/**
 * Add Effects classes and styles to saved block
 */
addFilter(
	"blocks.getSaveContent.extraProps",
	"blocklayouts/effects/add-save-props",
	(extraProps, blockType, attributes) => {
		// Generate classes
		const classes = generateEffectsClasses(attributes);
		extraProps.className = classnames(extraProps.className, classes);

		// Generate inline styles
		const inlineStyle = generateEffectsStyles(attributes);
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
 * Add Effects classes and styles to block in editor
 */
addFilter(
	"editor.BlockListBlock",
	"blocklayouts/effects/add-editor-props",
	createHigherOrderComponent((BlockListBlock) => {
		return (props) => {
			const { attributes } = props;

			// Generate classes
			const classes = classnames(
				props?.className,
				generateEffectsClasses(attributes),
			);

			// Generate inline styles
			const inlineStyle = generateEffectsStyles(attributes);
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
	}, "withEffectsEditorProps"),
);
