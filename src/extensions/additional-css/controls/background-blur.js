import { __ } from "@wordpress/i18n";
import {
	__experimentalUnitControl as UnitControl,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

const BackgroundBlur = ({ setAttributes, additionalCSS }) => {
	const { blur } = additionalCSS;

	return (
		<>
			<ToolsPanelItem
				hasValue={() => blur !== undefined}
				label={__("Background blur", "blocklayouts")}
				onDeselect={() =>
					setAttributes({
						additionalCSS: { ...additionalCSS, blur: undefined },
					})
				}
				onSelect={() =>
					setAttributes({
						additionalCSS: { ...additionalCSS, blur: 0 },
					})
				}
			>
				<UnitControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={__("Background blur", "blocklayouts")}
					value={blur}
					onChange={(value) =>
						setAttributes({
							additionalCSS: { ...additionalCSS, blur: value },
						})
					}
					units={[{ value: "px", label: "px" }]}
				/>
			</ToolsPanelItem>
		</>
	);
};

export default BackgroundBlur;
