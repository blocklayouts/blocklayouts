import clsx from "clsx";

/**
 * WordPress dependencies
 */
import {
	useBlockProps,
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles,
	__experimentalGetColorClassesAndStyles as getColorClassesAndStyles,
	__experimentalGetSpacingClassesAndStyles as getSpacingClassesAndStyles,
	__experimentalGetShadowClassesAndStyles as getShadowClassesAndStyles,
} from "@wordpress/block-editor";
import { Icon } from "@wordpress/components";

/**
 * Internal dependencies
 */
import { getIconType, getIconByName } from "../../utils/icons";

/**
 * Save function for the block.
 *
 * @param {Object}   props
 * @param {Object}   props.attributes - Block attributes.
 * @param {string}   props.className  - Additional class name.
 * @return {WPElement} Element to render.
 */
export default function save({ attributes, className }) {
	const {
		iconName,
		iconSize,
		customSvgCode,
		iconType,
		style,
		justifyContent,
		tagName: Tag,
		href,
		linkTarget,
		linkRel,
	} = attributes;

	// Get block support props
	const borderProps = getBorderClassesAndStyles(attributes);
	const colorProps = getColorClassesAndStyles(attributes);
	const spacingProps = getSpacingClassesAndStyles(attributes);
	const shadowProps = getShadowClassesAndStyles(attributes);

	// Outer wrapper block props (only className for alignment or custom classes)
	const blockProps = useBlockProps.save({
		className: clsx(className, {
			[`is-${iconType}`]: iconType,
			[`justify-${justifyContent}`]: justifyContent,
		}),
	});

	// Inner icon container classes and styles
	const iconClasses = clsx(
		"icon-container",
		colorProps.className,
		borderProps.className,
		spacingProps.className,
		shadowProps.className,
		{
			"no-border-radius": style?.border?.radius === 0,
			"has-padding":
				style?.spacing?.padding &&
				Object.keys(style.spacing.padding).length > 0,
		},
	);

	const iconStyle = {
		...borderProps.style,
		...colorProps.style,
		...spacingProps.style,
		...shadowProps.style,
		width: `${iconSize}px`,
		height: `${iconSize}px`,
	};

	// Render custom SVG if available
	if (customSvgCode) {
		return (
			<Tag
				{...blockProps}
				{...(href && { href, target: linkTarget, rel: linkRel })}
			>
				<div
					className={iconClasses}
					style={iconStyle}
					dangerouslySetInnerHTML={{ __html: customSvgCode }}
				/>
			</Tag>
		);
	}

	// Fallback to default icon
	const selectedIcon = getIconByName(iconName);
	if (!selectedIcon) {
		return null;
	}

	return (
		<Tag
			{...blockProps}
			{...(href && { href, target: linkTarget, rel: linkRel })}
		>
			<div className={iconClasses} style={iconStyle}>
				<Icon icon={selectedIcon.icon} size={iconSize} />
			</div>
		</Tag>
	);
}
