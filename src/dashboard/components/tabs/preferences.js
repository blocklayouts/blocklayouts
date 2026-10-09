/**
 * BlockLayouts Preferences Component
 *
 */
import {
	ToggleControl,
	SelectControl,
	__experimentalNumberControl as NumberControl,
	Flex,
	FlexBlock,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { useSelect, useDispatch } from "@wordpress/data";
import { store as preferencesStore } from "@wordpress/preferences";

// Preferences scope
export const PREFERENCES_SCOPE = "blocklayouts/preferences";

const Preferences = () => {
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

		return prefs;
	}, []);

	// Update preference by key
	const updatePreference = (key, value) => {
		setPreference(PREFERENCES_SCOPE, key, value);
	};

	return (
		<div className="blocklayouts-dashboard__preferences">
			<h3>{__("Pattern Library", "blocklayouts")}</h3>
			<Flex gap={3} direction="column" style={{ maxWidth: "320px" }}>
				<FlexBlock>
					<ToggleControl
						label={__("Live Preview", "blocklayouts")}
						help={
							preferences.livePreview
								? __(
										"Patterns will be displayed as live, interactive previews",
										"blocklayouts"
								  )
								: __(
										"Patterns will be displayed as static images for faster loading",
										"blocklayouts"
								  )
						}
						checked={preferences.livePreview}
						onChange={(value) => updatePreference("livePreview", value)}
						__nextHasNoMarginBottom
					/>
				</FlexBlock>

				<FlexBlock>
					<SelectControl
						label={__("Order By", "blocklayouts")}
						help={__(
							"Choose how patterns are sorted in the library",
							"blocklayouts"
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
				</FlexBlock>
				<FlexBlock>
					<NumberControl
						label={__("Items Per Page", "blocklayouts")}
						help={__("Number of patterns to display per page", "blocklayouts")}
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
				</FlexBlock>
			</Flex>
		</div>
	);
};

export default Preferences;
