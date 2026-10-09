import { __ } from "@wordpress/i18n";
import {
	SelectControl,
	__experimentalUnitControl as UnitControl,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

const Position = ({ setAttributes, additionalCSS }) => {
	const { position, top, left, right, bottom } = additionalCSS;

	const positionOptions = [
		{ label: __("Default", "blocklayouts"), value: "" },
		{ label: __("Static", "blocklayouts"), value: "static" },
		{ label: __("Relative", "blocklayouts"), value: "relative" },
		{ label: __("Absolute", "blocklayouts"), value: "absolute" },
		{ label: __("Fixed", "blocklayouts"), value: "fixed" },
		{ label: __("Sticky", "blocklayouts"), value: "sticky" },
	];

	const isAbsolutePosition = position === "absolute" || position === "fixed";

	return (
		<>
			<ToolsPanelItem
				hasValue={() => !!position}
				label={__("Position", "blocklayouts")}
				onDeselect={() =>
					setAttributes({
						additionalCSS: {
							...additionalCSS,
							position: undefined,
							top: undefined,
							left: undefined,
							right: undefined,
							bottom: undefined,
						},
					})
				}
				onSelect={() =>
					setAttributes({
						additionalCSS: { ...additionalCSS, position: "relative" },
					})
				}
			>
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={__("Position", "blocklayouts")}
					value={position || ""}
					options={positionOptions}
					onChange={(value) =>
						setAttributes({
							additionalCSS: {
								...additionalCSS,
								position: value || undefined,
							},
						})
					}
					help={__(
						"Set the positioning method for the element.",
						"blocklayouts",
					)}
				/>

				{isAbsolutePosition && (
					<div
						className="blocklayouts__position-controls"
						style={{
							position: "relative",
							display: "grid",
							marginTop: "16px",
							gridTemplateColumns: "repeat(2, 1fr)",
							gap: "12px",
						}}
					>
						<div
							style={{
								position: "absolute",
								inset: "20px 39px",
								borderWidth: "1px",
								borderStyle: "solid",
								borderColor: "rgb(224, 224, 224)",
							}}
						></div>
						<div
							style={{
								display: "block",
								gridColumn: "span 2",
								margin: "0px auto",
							}}
						>
							<UnitControl
								style={{
									width: "100px",
								}}
								hideLabelFromVision={true}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={__("Top", "blocklayouts")}
								value={top}
								onChange={(value) =>
									setAttributes({
										additionalCSS: { ...additionalCSS, top: value },
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
						</div>
						<div
							style={{
								padding: "0px",
								margin: "0px",
							}}
						>
							<UnitControl
								style={{
									width: "100px",
								}}
								hideLabelFromVision={true}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={__("Left", "blocklayouts")}
								value={left}
								onChange={(value) =>
									setAttributes({
										additionalCSS: { ...additionalCSS, left: value },
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
						</div>
						<div
							style={{
								padding: "0px",
								margin: "0px 0px 0px auto",
							}}
						>
							<UnitControl
								style={{
									width: "100px",
								}}
								hideLabelFromVision={true}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={__("Right", "blocklayouts")}
								value={right}
								onChange={(value) =>
									setAttributes({
										additionalCSS: { ...additionalCSS, right: value },
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
						</div>

						<div
							style={{
								display: "block",
								gridColumn: "span 2",
								margin: "0px auto",
							}}
						>
							<UnitControl
								style={{
									width: "100px",
								}}
								hideLabelFromVision={true}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={__("Bottom", "blocklayouts")}
								value={bottom}
								onChange={(value) =>
									setAttributes({
										additionalCSS: { ...additionalCSS, bottom: value },
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
						</div>
					</div>
				)}
			</ToolsPanelItem>
		</>
	);
};

export default Position;
