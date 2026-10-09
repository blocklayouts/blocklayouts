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
			label={__("Clip Content", "blocklayouts")}
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
				label={__("Clip Content", "blocklayouts")}
				description={__(
					"Set CSS overflow: hidden to hide content spilling out of a block.",
					"blocklayouts"
				)}
			/>
		</ToolsPanelItem>
	);
};

export default OverflowHidden;
