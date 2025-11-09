import { __ } from "@wordpress/i18n";
import {
	ToggleControl,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

/**
 * Extended typography controls component.
 */
const TypographyControls = ({ attributes, setAttributes, clientId }) => {
	const { nowrap } = attributes;

	return (
		<>
			<ToolsPanelItem
				hasValue={() => !!nowrap}
				label={__("Text wrapping", "blocklayouts")}
				onDeselect={() => setAttributes({ nowrap: undefined })}
				resetAllFilter={() => ({
					nowrap: undefined,
				})}
				onSelect={() => setAttributes({ nowrap: false })}
				panelId={clientId}
			>
				<ToggleControl
					__nextHasNoMarginBottom
					checked={nowrap}
					onChange={() =>
						setAttributes({
							nowrap: !nowrap,
						})
					}
					label={__("Prevent Text Wrapping", "blocklayouts")}
					help={__(
						"If enabled, the text will not wrap to the next line.",
						"blocklayouts",
					)}
				/>
			</ToolsPanelItem>
		</>
	);
};

export default TypographyControls;
