import { __ } from "@wordpress/i18n";
import {
	RangeControl,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

const Opacity = ({ setAttributes, additionalCSS }) => {
	const { opacity } = additionalCSS;

	return (
		<>
			<ToolsPanelItem
				hasValue={() => opacity !== undefined}
				label={__("Opacity", "blocklayouts")}
				onDeselect={() =>
					setAttributes({
						additionalCSS: { ...additionalCSS, opacity: undefined },
					})
				}
				onSelect={() =>
					setAttributes({
						additionalCSS: { ...additionalCSS, opacity: 1 },
					})
				}
			>
				<RangeControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={__("Opacity", "blocklayouts")}
					value={opacity}
					onChange={(value) =>
						setAttributes({
							additionalCSS: { ...additionalCSS, opacity: value },
						})
					}
					min={0.1}
					max={1}
					step={0.1}
				/>
			</ToolsPanelItem>
		</>
	);
};

export default Opacity;
