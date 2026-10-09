import { __ } from "@wordpress/i18n";
import {
	useState,
	useLayoutEffect,
	useEffect,
	renderToString,
} from "@wordpress/element";
import {
	insertObject,
	useAnchor,
	registerFormatType,
	isCollapsed,
	removeFormat,
} from "@wordpress/rich-text";
import { BlockControls, RichTextShortcut } from "@wordpress/block-editor";
import { Icon } from "@wordpress/icons";
import {
	ToolbarButton,
	Dropdown,
	Popover,
	Button,
	Flex,
	__experimentalNumberControl as NumberControl,
	TabPanel,
	ColorPalette,
} from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { speak } from "@wordpress/a11y";

// Import our reusable components
import Library from "./../../blocks/icon/components/library";
import QuickInserter from "./../../blocks/icon/components/quick-inserter";
import { icons, getIconType as getCurrentIconType } from "./../../utils/icons";

const name = "blocklayouts/inline-icon";
const title = __("Inline Icon");
const inlineIcon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24px"
		viewBox="0 -960 960 960"
		width="24px"
		fill="currentColor"
	>
		<path d="M480.07-100q-78.84 0-148.21-29.92t-120.68-81.21q-51.31-51.29-81.25-120.63Q100-401.1 100-479.93q0-78.84 29.92-148.21t81.21-120.68q51.29-51.31 120.63-81.25Q401.1-860 479.93-860q78.84 0 148.21 29.92t120.68 81.21q51.31 51.29 81.25 120.63Q860-558.9 860-480.07q0 78.84-29.92 148.21t-81.21 120.68q-51.29 51.31-120.63 81.25Q558.9-100 480.07-100Zm-.07-60q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Zm-14 50v146.23q0 13.31 12.5 16.04 12.5 2.73 18.19-8.96l99.46-226.62q3.85-9.23-1.45-17.96T579.69-530H500v-149.38q0-13.31-12.5-16.35-12.5-3.04-18.19 8.65L365.23-456.69q-3.84 9.84 1.08 18.27 4.92 8.42 14.77 8.42H466Z" />
	</svg>
);

// Register the format type
registerFormatType(name, {
	title,
	object: true,
	tagName: "img",
	className: "wp-blocklayouts-inline-icon",
	keywords: [__("icon", "blocklayouts")],
	attributes: {
		className: "class",
		width: "width",
		style: "style",
		url: "src",
		alt: "alt",
		icon: "icon",
		iconName: "icon-name",
		color: "color",
		customColor: "custom-color",
		iconType: "icon-type",
		marginLeft: "margin-left",
		marginRight: "margin-right",
	},
	edit: Edit,
});

function Edit({
	value,
	onChange,
	onFocus,
	isObjectActive,
	activeObjectAttributes,
	contentRef,
}) {
	const [addingIcon, setAddingIcon] = useState(false);
	const [openedBy, setOpenedBy] = useState(null);

	// Modal
	const [modalState, setModalState] = useState({
		isOpen: false,
		activeTab: "library",
	});

	const openModal = (tab = "library") => {
		setModalState({
			isOpen: true,
			activeTab: tab,
		});
	};

	// Attributes
	const {
		icon = "",
		iconName = "",
		width = "24",
		color = "#000000",
		customColor = "",
		marginLeft = "",
		marginRight = "",
	} = activeObjectAttributes;

	// Check preferences and selected block - must call all hooks before any conditional returns
	const { useIconButton, selectedBlock } = useSelect((select) => {
		const { get } = select("core/preferences");
		const { getSelectedBlock } = select("core/block-editor");
		return {
			useIconButton: get("blocklayouts/preferences", "buttonIcon") ?? true,
			selectedBlock: getSelectedBlock(),
		};
	}, []);

	// Check if feature should be enabled
	const isEnabled =
		useIconButton && (!selectedBlock || selectedBlock.name === "core/button");

	// Reset states when icon becomes inactive
	useEffect(() => {
		if (!isObjectActive) {
			setAddingIcon(false);
		}
	}, [isObjectActive]);

	// Helper function to get the effective color (custom or inherited)
	const getEffectiveColor = () => {
		if (customColor) {
			return customColor;
		}
		const editableContentElement = contentRef.current;
		if (editableContentElement) {
			return getComputedStyle(editableContentElement).color;
		}
		return color;
	};

	// Function to clear custom color and use inherited color
	const clearCustomColor = () => {
		const updatedAttributes = {
			...activeObjectAttributes,
			customColor: "",
		};

		const newReplacements = value.replacements.slice();
		newReplacements[value.start] = {
			type: name,
			attributes: updatedAttributes,
		};

		onChange({
			...value,
			replacements: newReplacements,
		});
	};

	// Handle clicks on existing icons
	useLayoutEffect(() => {
		const editableContentElement = contentRef.current;
		if (!editableContentElement) {
			return;
		}

		function handleClick(event) {
			const editable = event.target.closest("[contenteditable]");
			const iconElement = editable
				? editable.querySelector(".wp-blocklayouts-inline-icon")
				: null;

			if (!iconElement || !isObjectActive) {
				return;
			}

			setAddingIcon(true);
			setOpenedBy({
				el: iconElement,
				action: "click",
			});
		}

		editableContentElement.addEventListener("click", handleClick);

		return () => {
			editableContentElement.removeEventListener("click", handleClick);
		};
	}, [contentRef, isObjectActive]);

	function addIcon(target) {
		if (!isObjectActive && !isCollapsed(value)) {
			// Insert default icon when text is selected
			insertDefaultIcon();
		} else {
			// Open icon picker
			if (target) {
				setOpenedBy({
					el: target,
					action: null,
				});
			}
			setAddingIcon(true);
		}
	}

	function insertDefaultIcon() {
		const defaultIcon = icons[0];
		const iconString = renderToString(defaultIcon.icon);
		const textColor = getComputedStyle(contentRef.current).color;
		const dataUrl = createColoredIconUrl(iconString, textColor);

		const toInsert = {
			type: name,
			attributes: {
				width: "24",
				url: dataUrl,
				alt: defaultIcon.name || "icon",
				icon: iconString || "",
				iconName: defaultIcon.name || "default",
				color: textColor || color,
				customColor: "",
				iconType: "fill",
				marginRight: marginRight,
				marginLeft: marginLeft,
			},
		};

		onChange(insertObject(value, toInsert));
		speak(__("Icon inserted.", "blocklayouts"), "assertive");
	}

	const setIcon = (icon) => {
		const textColor = getComputedStyle(contentRef.current).color;
		const iconType = getCurrentIconType(icon.icon);
		const iconString = renderToString(icon.icon);
		// Use effective color (custom or inherited)
		const iconColor = getEffectiveColor();
		const dataUrl = createColoredIconUrl(iconString, iconColor);

		const toInsert = {
			type: name,
			attributes: {
				width: width,
				url: dataUrl,
				alt: icon.name || "icon",
				icon: iconString || "",
				iconName: icon.name || "default",
				color: textColor || color,
				customColor: customColor,
				iconType: iconType || "fill",
				marginRight: marginRight,
				marginLeft: marginLeft,
				style: [
					marginLeft ? `margin-left: ${marginLeft}px;` : "",
					marginRight ? `margin-right: ${marginRight}px;` : "",
				]
					.filter(Boolean)
					.join(" "),
			},
		};

		onChange(insertObject(value, toInsert));
		speak(__("Icon inserted.", "blocklayouts"), "assertive");
		setAddingIcon(false);
	};

	function setCustomIcon({ customSvgCode, iconType }) {
		const textColor = getComputedStyle(contentRef.current).color;
		// Use effective color (custom or inherited)
		// const iconColor = getEffectiveColor();
		const dataUrl = svgToDataUrl(customSvgCode);
		const toInsert = {
			type: name,
			attributes: {
				width: width,
				url: dataUrl,
				alt: "SVG icon",
				icon: customSvgCode.toString() || "",
				iconName: "custom",
				color: textColor || color,
				customColor: customColor,
				iconType: iconType,
				marginRight: marginRight,
				marginLeft: marginLeft,
				style: [
					marginLeft ? `margin-left: ${marginLeft}px;` : "",
					marginRight ? `margin-right: ${marginRight}px;` : "",
				]
					.filter(Boolean)
					.join(" "),
			},
		};

		onChange(insertObject(value, toInsert));
		speak(__("Custom icon inserted.", "blocklayouts"), "assertive");
		setAddingIcon(false);
	}

	function stopAddingIcon() {
		setAddingIcon(false);

		// Return focus appropriately
		if (openedBy?.el?.tagName === "BUTTON") {
			openedBy.el.focus();
		} else {
			onFocus();
		}
		setOpenedBy(null);
	}

	function onFocusOutside() {
		setAddingIcon(false);
		setOpenedBy(null);
	}

	function updateIconColor(newColor, isCustomColor) {
		if (!icon) return;

		const iconString = icon;
		const dataUrl = createColoredIconUrl(iconString, newColor);

		const updatedAttributes = {
			...activeObjectAttributes,
			color: isCustomColor ? "" : newColor,
			customColor: isCustomColor ? newColor : "",
			url: dataUrl,
		};

		const newReplacements = value.replacements.slice();
		newReplacements[value.start] = {
			type: name,
			attributes: updatedAttributes,
		};

		onChange({
			...value,
			replacements: newReplacements,
		});
	}

	function updateIconAttributes(newAttributes) {
		const updatedAttributes = {
			...activeObjectAttributes,
			...newAttributes,
		};

		let inlineStlye = [];
		const marginLeftAttr =
			newAttributes.marginLeft !== undefined
				? newAttributes.marginLeft
				: marginLeft;
		const marginRightAttr =
			newAttributes.marginRight !== undefined
				? newAttributes.marginRight
				: marginRight;

		// Only set style if marginLeft or marginRight is present
		if (marginLeftAttr !== undefined) {
			inlineStlye = [...inlineStlye, `margin-left: ${marginLeftAttr}px;`];
		}
		if (marginRightAttr !== undefined) {
			inlineStlye = [...inlineStlye, `margin-right: ${marginRightAttr}px;`];
		}
		if (inlineStlye.length > 0) {
			updatedAttributes.style = inlineStlye.filter(Boolean).join(" ");
		}

		const newReplacements = value.replacements.slice();
		newReplacements[value.start] = {
			type: name,
			attributes: updatedAttributes,
		};

		onChange({
			...value,
			replacements: newReplacements,
		});
	}

	function onRemoveFormat() {
		onChange(removeFormat(value, name));
		speak(__("icon removed.", "blocklayouts"), "assertive");
	}

	const anchorRef = useAnchor({
		editableContentElement: contentRef.current,
		settings: {
			tagName: "img",
			className: "wp-blocklayouts-inline-icon",
		},
	});

	// Extract current values for modal
	const hasSelection = !isCollapsed(value);

	// Don't render UI if feature is disabled
	if (!isEnabled) {
		return null;
	}

	return (
		<>
			<RichTextShortcut type="primary" character="." onUse={addIcon} />
			<RichTextShortcut
				type="primaryShift"
				character="."
				onUse={onRemoveFormat}
			/>

			<BlockControls group="block">
				<Dropdown
					popoverProps={{
						placement: "bottom",
						offset: 16,
						shift: true,
					}}
					className="blocklayouts-inline-icon__dropdown"
					renderToggle={({ isOpen, onToggle, onClose }) => (
						<ToolbarButton
							icon={<Icon icon={inlineIcon} />}
							label={title}
							className="toolbar-button__advanced-inline-icon"
							onClick={onToggle}
							isActive={isOpen}
						/>
					)}
					renderContent={({ onClose }) => (
						<QuickInserter
							setIcon={setIcon}
							onClose={() => {
								stopAddingIcon();
								onClose();
							}}
							openModal={openModal}
							// withCustomSvg={false}
						/>
					)}
				/>
			</BlockControls>

			{addingIcon && ( // isObjectActive ||
				<Popover
					ref={anchorRef}
					position="bottom right"
					offset={16}
					focusOnMount={false}
					onFocusOutside={onFocusOutside}
					anchor={anchorRef}
					className="block-editor-format-toolbar__inline-icon-popover"
				>
					{hasSelection && (
						<div
							className="blocklayouts-inline-icon__settings"
							style={{ width: "320px" }}
						>
							<TabPanel
								className="blocklayouts-inline-icon__tabs"
								activeClass="is-active"
								initialTabName="settings"
								tabs={[
									{
										name: "settings",
										title: __("Settings", "blocklayouts"),
										className: "blocklayouts-inline-icon__tab-settings",
									},
									{
										name: "color",
										title: __("Color", "blocklayouts"),
										className: "blocklayouts-inline-icon__tab-color",
									},
								]}
							>
								{(tab) => (
									<div
										className="blocklayouts-inline-icon__tab-content"
										style={{ padding: "16px" }}
									>
										{tab.name === "settings" && (
											<div>
												<NumberControl
													label={__("Icon size", "blocklayouts")}
													value={parseInt(width)}
													onChange={(value) =>
														updateIconAttributes({ width: value.toString() })
													}
													min={8}
													__next40pxDefaultSize
												/>
												<Flex style={{ marginTop: "16px" }}>
													<NumberControl
														style={{ flex: "1" }}
														label={__("Margin left", "blocklayouts")}
														value={parseInt(marginLeft)}
														max={260}
														onChange={(value) =>
															updateIconAttributes({
																marginLeft: value.toString(),
															})
														}
														__next40pxDefaultSize
													/>
													<NumberControl
														style={{ flex: "1" }}
														label={__("Margin right", "blocklayouts")}
														value={parseInt(marginRight)}
														max={260}
														onChange={(value) =>
															updateIconAttributes({
																marginRight: value.toString(),
															})
														}
														__next40pxDefaultSize
													/>
												</Flex>

												<p style={{ margin: "16px 0" }}>
													{__(
														"We only support one icon per button.",
														"blocklayouts",
													)}
												</p>
												<Button
													style={{ width: "100%", justifyContent: "center" }}
													variant="primary"
													onClick={() => openModal("library")}
													__next40pxDefaultSize
												>
													{__("Replace Icon", "blocklayouts")}
												</Button>
											</div>
										)}
										{tab.name === "color" && (
											<div>
												<div style={{ marginBottom: "16px" }}>
													<label
														style={{
															display: "block",
															marginBottom: "8px",
															fontWeight: "500",
														}}
													>
														{__("Icon Color", "blocklayouts")}
													</label>
													<ColorPalette
														value={customColor}
														onChange={(newColor) => {
															updateIconColor(newColor, true);
														}}
														enableAlpha
														__experimentalIsRenderedInSidebar
														clearable={false}
													/>
												</div>

												<Button
													style={{
														width: "100%",
														justifyContent: "center",
														marginBottom: "8px",
													}}
													variant="secondary"
													onClick={() => {
														const editableContentElement = contentRef.current;
														const textColor = getComputedStyle(
															editableContentElement,
														).color;
														updateIconColor(textColor, false);
													}}
													__next40pxDefaultSize
												>
													{__("Match Button Text Color", "blocklayouts")}
												</Button>

												<p
													style={{
														fontSize: "12px",
														color: "#666",
														margin: "0",
													}}
												>
													{__(
														"The icon will inherit and match your button's text color.",
														"blocklayouts",
													)}
												</p>
											</div>
										)}
									</div>
								)}
							</TabPanel>
						</div>
					)}
					{!hasSelection && (
						<QuickInserter
							setIcon={setIcon}
							onClose={() => {
								stopAddingIcon();
							}}
							openModal={openModal}
						/>
					)}
				</Popover>
			)}

			<Library
				onClose={() => {
					setModalState((prev) => ({
						...prev,
						isOpen: false,
					}));
					stopAddingIcon();
				}}
				onIconSelect={setIcon}
				onCustomSvgInsert={setCustomIcon}
				currentIconName={iconName}
				currentCustomSvg={icon}
				modalState={modalState}
				setModalState={setModalState}
			/>
		</>
	);
}

function svgToDataUrl(svgString) {
	const encodedSvg = encodeURIComponent(svgString).replace(/'/g, "%27");
	return `data:image/svg+xml,${encodedSvg}`;
}

function createColoredIconUrl(svgString, color = "#000000") {
	let coloredSvg = svgString;

	// Check if SVG has any fill attributes
	const hasFill = /fill="[^"]*"/.test(svgString);
	// Check if SVG has any stroke attributes
	const hasStroke = /stroke="[^"]*"/.test(svgString);

	if (hasFill) {
		// Replace existing fill colors (except "none")
		coloredSvg = coloredSvg.replace(/fill="(?!none)[^"]*"/g, `fill="${color}"`);
	} else {
		// Add fill attribute to the first <path>, <circle>, <rect>, etc.
		coloredSvg = coloredSvg.replace(
			/<(path|circle|rect|polygon|ellipse|line)([^>]*?)>/i,
			`<$1$2 fill="${color}">`,
		);
	}

	if (hasStroke) {
		// Replace existing stroke colors (except "none")
		coloredSvg = coloredSvg.replace(
			/stroke="(?!none)[^"]*"/g,
			`stroke="${color}"`,
		);
	}

	// Also handle CSS style attributes
	coloredSvg = coloredSvg.replace(
		/style="([^"]*?)fill:\s*[^;]*;?([^"]*)"/g,
		`style="$1fill: ${color};$2"`,
	);
	coloredSvg = coloredSvg.replace(
		/style="([^"]*?)stroke:\s*[^;]*;?([^"]*)"/g,
		`style="$1stroke: ${color};$2"`,
	);

	return svgToDataUrl(coloredSvg);
}
