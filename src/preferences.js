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
import { group, button, code } from "@wordpress/icons";

const animationIcon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
	>
		<path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"></path>
	</svg>
);

// Preferences scope
export const PREFERENCES_SCOPE = "blocklayouts/preferences";

export const ENHANCED_BLOCKS_EXTENSIONS = [
	{
		name: "masonry",
		preferenceKey: "masonry",
		title: __("Masonry", "blocklayouts"),
		description: __(
			"Add masonry layout to Group or Gallery blocks",
			"blocklayouts",
		),
		defaultValue: true,
		icon: group,
	},
	{
		name: "button-icon",
		preferenceKey: "buttonIcon",
		title: __("Button Icon", "blocklayouts"),
		description: __("Add an icon to button blocks", "blocklayouts"),
		defaultValue: true,
		icon: button,
	},
	{
		name: "linked-group",
		preferenceKey: "linkedGroup",
		title: __("Linked Group", "blocklayouts"),
		description: __("Add link to core/group", "blocklayouts"),
		defaultValue: true,
		icon: group,
	},
];

export const ADDITIONAL_CSS_EXTENSIONS = [
	{
		name: "css-position",
		preferenceKey: "cssPosition",
		title: __("Position", "blocklayouts"),
		description: __(
			"Control element positioning using CSS position property.",
			"blocklayouts",
		),
		defaultValue: true,
		icon: code,
	},
	{
		name: "css-transform",
		preferenceKey: "cssTransform",
		title: __("Transform", "blocklayouts"),
		description: __(
			"Apply CSS transforms: rotate, scale, translate, and skew elements.",
			"blocklayouts",
		),
		defaultValue: true,
		icon: code,
	},
	{
		name: "css-background-blur",
		preferenceKey: "cssBackgroundBlur",
		title: __("Background Blur", "blocklayouts"),
		description: __(
			"Add a background blur effect to your block using the CSS backdrop-filter.",
			"blocklayouts",
		),
		defaultValue: true,
		icon: code,
	},
	{
		name: "css-opacity",
		preferenceKey: "cssOpacity",
		title: __("Opacity", "blocklayouts"),
		description: __(
			"Adjust the transparency level of your block.",
			"blocklayouts",
		),
		defaultValue: true,
		icon: code,
	},
	{
		name: "css-overflow",
		preferenceKey: "cssOverflow",
		title: __("Clip Content", "blocklayouts"),
		description: __(
			"Set CSS overflow: hidden to hide content spilling out of a block.",
			"blocklayouts",
		),
		defaultValue: true,
		icon: code,
	},
];

export const EFFECTS_EXTENSIONS = [
	{
		name: "animations",
		preferenceKey: "animationsEffects",
		title: __("Animations", "blocklayouts"),
		description: __("Add animations to blocks", "blocklayouts"),
		defaultValue: true,
		icon: animationIcon,
	},
	// {
	// 	name: "hover-effects",
	// 	preferenceKey: "hoverEffects",
	// 	title: __("Hover Effects", "blocklayouts"),
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
		// {
		// 	label: __("Extensions", "blocklayouts"),
		// 	value: "extensions",
		// },
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
									label={extension.title}
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
									label={extension.title}
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
									label={extension.title}
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
