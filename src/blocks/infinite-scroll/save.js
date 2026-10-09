/**
 * External dependencies
 */
import clsx from "clsx";

/**
 * WordPress dependencies
 */
import {
	RichText,
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles,
	__experimentalGetColorClassesAndStyles as getColorClassesAndStyles,
	__experimentalGetSpacingClassesAndStyles as getSpacingClassesAndStyles,
	__experimentalGetShadowClassesAndStyles as getShadowClassesAndStyles,
	__experimentalGetElementClassName,
	getTypographyClassesAndStyles,
} from "@wordpress/block-editor";

export default function save({ attributes, className }) {
	const { style, buttonText } = attributes;

	const borderProps = getBorderClassesAndStyles(attributes);
	const colorProps = getColorClassesAndStyles(attributes);
	const spacingProps = getSpacingClassesAndStyles(attributes);
	const shadowProps = getShadowClassesAndStyles(attributes);
	const typographyProps = getTypographyClassesAndStyles(attributes);
	const buttonClasses = clsx(
		"wp-block-blocklayouts-infinite-scroll__button",
		colorProps.className,
		borderProps.className,
		typographyProps.className,
		{
			// For backwards compatibility add style that isn't provided via
			// block support.
			"no-border-radius": style?.border?.radius === 0,
			[`has-custom-font-size`]: style?.typography?.fontSize,
		},
		__experimentalGetElementClassName("button")
	);
	const buttonStyle = {
		...borderProps.style,
		...colorProps.style,
		...spacingProps.style,
		...shadowProps.style,
		...typographyProps.style,
		writingMode: undefined,
	};

	return (
		<RichText.Content
			tagName="button"
			type="button"
			className={buttonClasses}
			style={buttonStyle}
			value={buttonText}
			data-wp-on--click="actions.loadMore"
			data-wp-bind--hidden="context.isLoading"
			data-wp-class--is-loading="context.isLoading"
		/>
	);
}
