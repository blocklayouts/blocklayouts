import { __ } from "@wordpress/i18n";
import {
	ToggleControl,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

const OverflowHidden = ({ setAttributes, additionalCSS }) => {
	const { overflowHidden } = additionalCSS;

	return (
		<ToolsPanelItem
			hasValue={() => overflowHidden}
			label={__("Overflow", "blocklayouts")}
			onDeselect={() =>
				setAttributes({
					additionalCSS: { ...additionalCSS, overflowHidden: undefined },
				})
			}
			onSelect={() =>
				setAttributes({
					additionalCSS: { ...additionalCSS, overflowHidden: true },
				})
			}
		>
			<ToggleControl
				__nextHasNoMarginBottom
				checked={overflowHidden}
				onChange={() =>
					setAttributes({
						additionalCSS: {
							...additionalCSS,
							overflowHidden: !overflowHidden,
						},
					})
				}
				label={__("Overflow Hidden", "blocklayouts")}
			/>
		</ToolsPanelItem>
	);
};

export default OverflowHidden;
