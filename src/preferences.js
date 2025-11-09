/**
 * BlockLayouts Preferences Component
 *
 */

import { useState } from "@wordpress/element";
import {
	Button,
	ToggleControl,
	SelectControl,
	__experimentalNumberControl as NumberControl,
	__experimentalScrollable as Scrollable,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { useSelect, useDispatch } from "@wordpress/data";
import { store as preferencesStore } from "@wordpress/preferences";

// Preferences scope
export const PREFERENCES_SCOPE = "blocklayouts/preferences";

const ENHANCED_BLOCKS_EXTENSIONS = [
	{
		name: "button-icon",
		preferenceKey: "buttonIcon",
		label: __("Button Icon", "blocklayouts"),
		description: __("Add an icon to button blocks", "blocklayouts"),
		defaultValue: true,
	},
	{
		name: "linked-group",
		preferenceKey: "linkedGroup",
		label: __("Linked Group", "blocklayouts"),
		description: __("Add link to core/group", "blocklayouts"),
		defaultValue: true,
	},
];

const ADDITIONAL_CSS_EXTENSIONS = [
	{
		name: "css-position",
		preferenceKey: "cssPosition",
		label: __("Position", "blocklayouts"),
		description: __(
			"Control element positioning using CSS position property options: static, relative, absolute, fixed, and sticky.",
			"blocklayouts",
		),
		defaultValue: true,
	},
	{
		name: "css-transform",
		preferenceKey: "cssTransform",
		label: __("Transform", "blocklayouts"),
		description: __(
			"Apply CSS transforms: rotate, scale, translate, and skew elements.",
			"blocklayouts",
		),
		defaultValue: true,
	},
	{
		name: "css-background-blur",
		preferenceKey: "cssBackgroundBlur",
		label: __("Background Blur", "blocklayouts"),
		description: __(
			"Add a background blur effect to your block using the CSS backdrop-filter.",
			"blocklayouts",
		),
		defaultValue: true,
	},
	{
		name: "css-opacity",
		preferenceKey: "cssOpacity",
		label: __("Opacity", "blocklayouts"),
		description: __(
			"Adjust the transparency level of your block (0 = fully transparent, 1 = fully opaque).",
			"blocklayouts",
		),
		defaultValue: true,
	},
	{
		name: "css-overflow",
		preferenceKey: "cssOverflow",
		label: __("Overflow", "blocklayouts"),
		description: __(
			"Set CSS overflow (visible, hidden, scroll, or auto) to control how content spilling out of a block is handled.",
			"blocklayouts",
		),
		defaultValue: true,
	},
	{
		name: "custom-css",
		preferenceKey: "customCss",
		label: __("Custom CSS", "blocklayouts"),
		description: __(
			"Write and apply your own custom CSS code for advanced control over block styling.",
			"blocklayouts",
		),
		defaultValue: true,
	},
];

const EFFECTS_EXTENSIONS = [
	{
		name: "animations",
		preferenceKey: "animationsEffects",
		label: __("Animations", "blocklayouts"),
		description: __("Add animations to blocks", "blocklayouts"),
		defaultValue: true,
	},
	// {
	// 	name: "hover-effects",
	// 	preferenceKey: "hoverEffects",
	// 	label: __("Hover Effects", "blocklayouts"),
	// 	description: __("Add hover effects to blocks", "blocklayouts"),
	// 	defaultValue: true,
	// },
];

const TabButton = ({ tab, selectedTab, onSelect, icon }) => (
	<Button
		className={`blocklayouts-preferences-modal__sidebar-tab ${
			selectedTab === tab.value ? "is-selected" : ""
		}`}
		onClick={() => onSelect(tab.value)}
	>
		{tab.label}
	</Button>
);

export const PreferencesPanel = () => {
	const [selectedTab, setSelectedTab] = useState("general");

	const tabs = [
		{ label: __("General", "blocklayouts"), value: "general" },
		{
			label: __("Extensions", "blocklayouts"),
			value: "extensions",
		},
	];

	// Get dispatch actions
	const { set: setPreference } = useDispatch(preferencesStore);

	// Get preferences from the store
	const preferences = useSelect((select) => {
		const { get } = select(preferencesStore);

		// Build preferences object
		const prefs = {
			livePreview: get(PREFERENCES_SCOPE, "livePreview") ?? true,
			orderBy: get(PREFERENCES_SCOPE, "orderBy") ?? "newest",
			itemsPerPage: get(PREFERENCES_SCOPE, "itemsPerPage") ?? 12,
		};

		// Get all extension preferences
		[
			...ENHANCED_BLOCKS_EXTENSIONS,
			...ADDITIONAL_CSS_EXTENSIONS,
			...EFFECTS_EXTENSIONS,
		].forEach((extension) => {
			prefs[extension.preferenceKey] =
				get(PREFERENCES_SCOPE, extension.preferenceKey) ??
				extension.defaultValue;
		});

		return prefs;
	}, []);

	// Update preference by key
	const updatePreference = (key, value) => {
		setPreference(PREFERENCES_SCOPE, key, value);
	};

	// Render content based on selected category
	const renderContent = () => {
		switch (selectedTab) {
			case "general":
				return (
					<div className="blocklayouts-preferences__section">
						<h2 className="blocklayouts-preferences__section-title">
							{__("Display Settings", "blocklayouts")}
						</h2>
						<p style={{ marginBottom: "16px", color: "#757575" }}>
							{__(
								"Choose how patterns appear and are sorted in your library.",
								"blocklayouts",
							)}
						</p>

						<h4 className="blocklayouts-preferences__section-subtitle">
							{__("Pattern Preview", "blocklayouts")}
						</h4>

						<ToggleControl
							label={__("Live Preview", "blocklayouts")}
							help={
								preferences.livePreview
									? __(
											"Patterns will be displayed as live, interactive previews",
											"blocklayouts",
									  )
									: __(
											"Patterns will be displayed as static images for faster loading",
											"blocklayouts",
									  )
							}
							checked={preferences.livePreview}
							onChange={(value) => updatePreference("livePreview", value)}
							__nextHasNoMarginBottom
						/>

						<h4 className="blocklayouts-preferences__section-subtitle">
							{__("Sorting", "blocklayouts")}
						</h4>

						<div style={{ display: "inline-block", minWidth: "260px" }}>
							<SelectControl
								label={__("Order By", "blocklayouts")}
								help={__(
									"Choose how patterns are sorted in the library",
									"blocklayouts",
								)}
								value={preferences.orderBy}
								options={[
									{
										label: __("Free First (Default)", "blocklayouts"),
										value: "default",
									},
									{
										label: __("Newest First", "blocklayouts"),
										value: "newest",
									},
									{
										label: __("Oldest First", "blocklayouts"),
										value: "oldest",
									},
									{
										label: __("Most Popular", "blocklayouts"),
										value: "popular",
										disabled: true,
									},
									{
										label: __("Name (A-Z)", "blocklayouts"),
										value: "name",
									},
								]}
								onChange={(value) => updatePreference("orderBy", value)}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
						</div>

						<h4 className="blocklayouts-preferences__section-subtitle">
							{__("Pagination", "blocklayouts")}
						</h4>

						<div style={{ display: "inline-block", minWidth: "260px" }}>
							<NumberControl
								label={__("Items Per Page", "blocklayouts")}
								help={__(
									"Number of patterns to display per page",
									"blocklayouts",
								)}
								value={preferences.itemsPerPage}
								min={6}
								max={100}
								step={1}
								onChange={(value) => {
									const numValue = parseInt(value);
									if (!isNaN(numValue) && numValue >= 6 && numValue <= 100) {
										updatePreference("itemsPerPage", numValue);
									}
								}}
								__next40pxDefaultSize
							/>
						</div>
					</div>
				);

			case "extensions":
				return (
					<div className="blocklayouts-preferences__section">
						<h2 className="blocklayouts-preferences__section-title">
							{__("Extension Settings", "blocklayouts")}
						</h2>

						<p style={{ marginBottom: "16px", color: "#757575" }}>
							{__(
								"Enable or disable BlockLayouts extensions. Disabled extensions will not appear in block inspector controls.",
								"blocklayouts",
							)}
						</p>
						<h4 className="blocklayouts-preferences__section-subtitle">
							{__("Enhanced Blocks", "blocklayouts")}
						</h4>
						<div
							style={{
								display: "flex",
								gap: "16px",
								flexDirection: "column",
								alignItems: "flex-start",
								marginBottom: "16px",
							}}
						>
							{ENHANCED_BLOCKS_EXTENSIONS.map((extension) => (
								<ToggleControl
									label={extension.label}
									help={extension.description}
									checked={preferences[extension.preferenceKey]}
									onChange={(value) =>
										updatePreference(extension.preferenceKey, value)
									}
									__nextHasNoMarginBottom
								/>
							))}
						</div>

						<h4 className="blocklayouts-preferences__section-subtitle">
							{__("Additional CSS", "blocklayouts")}
						</h4>
						<div
							style={{
								display: "flex",
								gap: "16px",
								flexDirection: "column",
								alignItems: "flex-start",
								marginBottom: "16px",
							}}
						>
							{ADDITIONAL_CSS_EXTENSIONS.map((extension) => (
								<ToggleControl
									label={extension.label}
									help={extension.description}
									checked={preferences[extension.preferenceKey]}
									onChange={(value) =>
										updatePreference(extension.preferenceKey, value)
									}
									__nextHasNoMarginBottom
								/>
							))}
						</div>
						<h4 className="blocklayouts-preferences__section-subtitle">
							{__("Effects", "blocklayouts")}
						</h4>
						<div
							style={{
								display: "flex",
								gap: "16px",
								flexDirection: "column",
								alignItems: "flex-start",
								marginBottom: "16px",
							}}
						>
							{EFFECTS_EXTENSIONS.map((extension) => (
								<ToggleControl
									label={extension.label}
									help={extension.description}
									checked={preferences[extension.preferenceKey]}
									onChange={(value) =>
										updatePreference(extension.preferenceKey, value)
									}
									__nextHasNoMarginBottom
								/>
							))}
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div
			className="blocklayouts-preferences-modal__container"
			style={{ display: "flex", gap: "26px" }}
		>
			{/* Sidebar with categories */}
			<div
				className="blocklayouts-preferences-modal__sidebar"
				style={{ minWidth: "160px" }}
			>
				<div
					className="blocklayouts-preferences-modal__sidebar-tabs"
					style={{ display: "flex", flexDirection: "column", gap: "8px" }}
				>
					{tabs.map((tab) => (
						<TabButton
							key={tab.value}
							tab={tab}
							selectedTab={selectedTab}
							onSelect={setSelectedTab}
						/>
					))}
				</div>
			</div>

			{/* Content area */}
			<div
				className="blocklayouts-preferences-modal__content"
				style={{ flex: 1 }}
			>
				<Scrollable className="blocklayouts-preferences-modal__scrollable">
					{renderContent()}
				</Scrollable>
			</div>
		</div>
	);
};
