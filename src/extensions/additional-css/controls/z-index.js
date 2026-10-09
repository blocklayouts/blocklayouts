import { __ } from "@wordpress/i18n";
import {
	RangeControl,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

const ZIndex = ({ setAttributes, additionalCSS }) => {
	const { zIndex } = additionalCSS;

	return (
		<>
			<ToolsPanelItem
				hasValue={() => zIndex !== undefined}
				label={__("Z-Index", "blocklayouts")}
				onDeselect={() =>
					setAttributes({
						additionalCSS: { ...additionalCSS, zIndex: undefined },
					})
				}
				onSelect={() =>
					setAttributes({
						additionalCSS: { ...additionalCSS, zIndex: 1 },
					})
				}
			>
				<RangeControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={__("Z-Index", "blocklayouts")}
					value={zIndex || 0}
					onChange={(value) =>
						setAttributes({
							additionalCSS: { ...additionalCSS, zIndex: value },
						})
					}
					min={-999}
					max={999}
					step={1}
					help={__(
						"Controls the stacking order of positioned elements.",
						"blocklayouts",
					)}
				/>
			</ToolsPanelItem>
		</>
	);
};

export default ZIndex;
