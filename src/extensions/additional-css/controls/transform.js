import { __ } from "@wordpress/i18n";
import {
	__experimentalUnitControl as UnitControl,
	__experimentalToolsPanelItem as ToolsPanelItem,
	AnglePickerControl,
} from "@wordpress/components";

const Transform = ({ setAttributes, additionalCSS }) => {
	const { rotate, translateX, translateY } = additionalCSS;

	return (
		<>
			<ToolsPanelItem
				hasValue={() => rotate || translateX || translateY}
				label={__("Transform", "blocklayouts")}
				onDeselect={() =>
					setAttributes({
						additionalCSS: {
							...additionalCSS,
							rotate: undefined,
							translateX: undefined,
							translateY: undefined,
						},
					})
				}
			>
				<div
					className="blocklayouts__transform-controls"
					style={{
						display: "grid",
						marginTop: "16px",
						gridTemplateColumns: "repeat(2, 1fr)",
						gap: "16px",
					}}
				>
					<UnitControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={__("Translate X", "blocklayouts")}
						value={translateX}
						onChange={(value) =>
							setAttributes({
								additionalCSS: { ...additionalCSS, translateX: value },
							})
						}
						units={[
							{ value: "px", label: "px" },
							{ value: "%", label: "%" },
							{ value: "em", label: "em" },
							{ value: "rem", label: "rem" },
							{ value: "vw", label: "vw" },
						]}
					/>

					<UnitControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={__("Translate Y", "blocklayouts")}
						value={translateY}
						onChange={(value) =>
							setAttributes({
								additionalCSS: { ...additionalCSS, translateY: value },
							})
						}
						units={[
							{ value: "px", label: "px" },
							{ value: "%", label: "%" },
							{ value: "em", label: "em" },
							{ value: "rem", label: "rem" },
							{ value: "vh", label: "vh" },
						]}
					/>

					<AnglePickerControl
						style={{
							gridColumn: "1 / -1",
						}}
						__next40pxDefaultSize
						label={__("Rotate", "blocklayouts")}
						value={rotate || 0}
						onChange={(value) =>
							setAttributes({
								additionalCSS: { ...additionalCSS, rotate: value },
							})
						}
					/>
				</div>
			</ToolsPanelItem>
		</>
	);
};

export default Transform;
