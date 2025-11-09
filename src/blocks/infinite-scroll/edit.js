/**
 * WordPress dependencies.
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	InspectorControls,
	JustifyToolbar,
	BlockControls,
} from "@wordpress/block-editor";
import {
	PanelBody,
	TextControl,
	RangeControl,
	Notice,
} from "@wordpress/components";
import clsx from "clsx";

/**
 * Internal dependencies.
 */
import "./editor.scss";

/**
 * Edit component for the Infinite Scroll block.
 */
export default function Edit({ attributes, setAttributes, className }) {
	const { loadingText, noMoreText, triggerDistance, justifyContent } =
		attributes;
	const blockProps = useBlockProps({
		className: clsx(className, {
			[`justify-${justifyContent}`]: justifyContent,
		}),
	});

	return (
		<>
			<BlockControls group="block">
				<JustifyToolbar
					allowedControls={["left", "center", "right"]}
					value={justifyContent}
					onChange={(value) => setAttributes({ justifyContent: value })}
				/>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={__("Settings", "blocklayouts")}>
					<TextControl
						label={__("Loading Text", "blocklayouts")}
						value={loadingText}
						onChange={(loadingText) => setAttributes({ loadingText })}
						help={__(
							"Text displayed while loading more content",
							"blocklayouts",
						)}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>

					<TextControl
						label={__("No More Content Text", "blocklayouts")}
						value={noMoreText}
						onChange={(noMoreText) => setAttributes({ noMoreText })}
						help={__(
							"Text displayed when no more content is available",
							"blocklayouts",
						)}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>

					<RangeControl
						label={__("Trigger Distance", "blocklayouts")}
						value={triggerDistance}
						onChange={(triggerDistance) => setAttributes({ triggerDistance })}
						min={50}
						max={500}
						step={25}
						help={__(
							"Distance from the bottom to start loading (px)",
							"blocklayouts",
						)}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div className="blocklayouts-infinite-scroll__preview">
				<div {...blockProps}>
					<div className="wp-block-blocklayouts-infinite-scroll__loading is-visible">
						<div className="wp-block-blocklayouts-infinite-scroll__loading-spinner"></div>
						<span>
							{loadingText || __("Loading more posts...", "blocklayouts")}
						</span>
					</div>
				</div>
			</div>
		</>
	);
}
