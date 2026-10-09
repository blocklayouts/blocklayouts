/**
 * External dependencies.
 */
import clsx from "clsx";

/**
 * WordPress dependencies.
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	InspectorControls,
	JustifyToolbar,
	BlockControls,
	RichText,
	__experimentalUseBorderProps as useBorderProps,
	__experimentalUseColorProps as useColorProps,
	__experimentalGetSpacingClassesAndStyles as useSpacingProps,
	__experimentalGetShadowClassesAndStyles as useShadowProps,
	__experimentalGetElementClassName,
	getTypographyClassesAndStyles as useTypographyProps,
} from "@wordpress/block-editor";
import {
	PanelBody,
	TextControl,
	RangeControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

/**
 * Internal dependencies.
 */
import "./editor.scss";

/**
 * Edit component for the Infinite Scroll block.
 */
export default function Edit({ attributes, setAttributes, className }) {
	const {
		infiniteType,
		buttonText,
		loadingText,
		noMoreText,
		triggerDistance,
		justifyContent,
		style,
	} = attributes;
	const blockProps = useBlockProps({
		className: clsx(className, {
			[`justify-${justifyContent}`]: justifyContent,
		}),
	});

	const borderProps = useBorderProps(attributes);
	const colorProps = useColorProps(attributes);
	const spacingProps = useSpacingProps(attributes);
	const shadowProps = useShadowProps(attributes);
	const typographyProps = useTypographyProps(attributes);

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
					<ToggleGroupControl
						label={__("Load Type", "blocklayouts")}
						value={infiniteType}
						onChange={(infiniteType) => setAttributes({ infiniteType })}
						help={
							infiniteType === "infinite"
								? __(
										"Posts will automatically load as users scroll down the page",
										"blocklayouts"
								  )
								: __(
										"Users click a button to manually load more posts",
										"blocklayouts"
								  )
						}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOption
							value="infinite"
							label={__("Infinite", "blocklayouts")}
						/>
						<ToggleGroupControlOption
							value="button"
							label={__("Button", "blocklayouts")}
						/>
					</ToggleGroupControl>

					{infiniteType === "infinite" && (
						<RangeControl
							label={__("Trigger Distance", "blocklayouts")}
							value={triggerDistance}
							onChange={(triggerDistance) => setAttributes({ triggerDistance })}
							min={50}
							max={500}
							step={25}
							help={__(
								"Distance from the bottom to start loading (px)",
								"blocklayouts"
							)}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					)}

					<TextControl
						label={__("Loading Text", "blocklayouts")}
						value={loadingText}
						onChange={(loadingText) => setAttributes({ loadingText })}
						help={__(
							"Text displayed while loading more content",
							"blocklayouts"
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
							"blocklayouts"
						)}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{infiniteType === "button" ? (
					<RichText
						tagName="button"
						type="button"
						value={buttonText}
						onChange={(buttonText) => setAttributes({ buttonText })}
						placeholder={__("Load More", "blocklayouts")}
						allowedFormats={["core/bold", "core/italic"]}
						withoutInteractiveFormatting
						className={clsx(
							"wp-block-blocklayouts-infinite-scroll__button",
							colorProps.className,
							borderProps.className,
							typographyProps.className,
							{
								// For backwards compatibility add style that isn't
								// provided via block support.
								"no-border-radius": style?.border?.radius === 0,
								[`has-custom-font-size`]: blockProps.style.fontSize,
							},
							__experimentalGetElementClassName("button")
						)}
						style={{
							...borderProps.style,
							...colorProps.style,
							...spacingProps.style,
							...shadowProps.style,
							...typographyProps.style,
							writingMode: undefined,
						}}
					/>
				) : (
					<div
						className={clsx(
							"wp-block-blocklayouts-infinite-scroll__loading",
							"is-visible",
							colorProps.className,
							borderProps.className,
							typographyProps.className,
							{
								// For backwards compatibility add style that isn't
								// provided via block support.
								"no-border-radius": style?.border?.radius === 0,
								[`has-custom-font-size`]: blockProps.style.fontSize,
							}
						)}
						style={{
							...borderProps.style,
							...colorProps.style,
							...spacingProps.style,
							...shadowProps.style,
							...typographyProps.style,
							writingMode: undefined,
						}}
					>
						<span className="wp-block-blocklayouts-infinite-scroll__loading-spinner"></span>
						<RichText
							tagName="span"
							value={loadingText}
							onChange={(loadingText) => setAttributes({ loadingText })}
							placeholder={__("Loading more posts...", "blocklayouts")}
							allowedFormats={["core/bold", "core/italic"]}
							withoutInteractiveFormatting
						/>
					</div>
				)}
			</div>
		</>
	);
}
