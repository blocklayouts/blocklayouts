/**
 * WordPress dependencies.
 */

import { ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { useSelect, useDispatch } from "@wordpress/data";
import { store as preferencesStore } from "@wordpress/preferences";
import { Flex, FlexItem, FlexBlock, Icon, Button } from "@wordpress/components";
import { useEntityRecord } from "@wordpress/core-data";
import { plugins, lock, group, button, code } from "@wordpress/icons";

/**
 * Internal dependencies.
 */
import { ExtensionSkeleton } from "../../../utils/skeleton";
import {
	ENHANCED_BLOCKS_EXTENSIONS,
	ADDITIONAL_CSS_EXTENSIONS,
	EFFECTS_EXTENSIONS,
	PREFERENCES_SCOPE,
} from "../../../preferences";

const ExtensionItem = ({ extension, checked, onChange }) => {
	const { icon, title, description, premium } = extension;

	const licenseData = useEntityRecord("blocklayouts/v1", "license");
	const license = licenseData?.record?.data;
	const isActiveLicense = license?.is_active;
	const licenseLoading = !licenseData.hasResolved;

	if (licenseLoading) {
		return <ExtensionSkeleton />;
	}

	return (
		<Flex
			className="blocklayouts-dashboard__card-item"
			gap={3}
			align="flex-start"
			justify="space-between"
		>
			<FlexItem className="blocklayouts-dashboard__card-item__icon">
				{icon ? <Icon icon={icon} /> : <Icon icon={plugins} />}
			</FlexItem>

			<FlexBlock className="blocklayouts-dashboard__card-item__content">
				<h4 className="blocklayouts-dashboard__card-item__title">{title}</h4>
				{description && (
					<p className="blocklayouts-dashboard__card-item__description">
						{description}
					</p>
				)}
			</FlexBlock>

			<FlexItem className="blocklayouts-dashboard__card-item__toggle">
				{premium && !isActiveLicense ? (
					<Button
						variant="primary"
						style={{
							padding: "6px 8px",
							backgroundColor: "#000",
							minHeight: "28px",
						}}
						size="small"
						icon={lock}
						iconSize={16}
						href="https://blocklayouts.com/premium/"
						target="_blank"
						rel="noopener noreferrer"
					>
						{__("Pro", "blocklayouts")}
					</Button>
				) : (
					<ToggleControl
						checked={checked}
						onChange={onChange}
						__nextHasNoMarginBottom
					/>
				)}
			</FlexItem>
		</Flex>
	);
};

const Extensions = () => {
	// Get dispatch actions
	const { set: setPreference } = useDispatch(preferencesStore);

	// Get preferences from the store
	const preferences = useSelect((select) => {
		const { get } = select(preferencesStore);

		// Build preferences object
		const prefs = {};

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

	return (
		<div className="blocklayouts-dashboard__extensions">
			<h3>{__("Enhanced Blocks", "blocklayouts")}</h3>
			<div
				className="blocklayouts-dashboard__grid"
				style={{ marginBottom: "32px" }}
			>
				{ENHANCED_BLOCKS_EXTENSIONS.map((extension) => (
					<div
						key={extension.preferenceKey}
						className="blocklayouts-dashboard__card"
					>
						<ExtensionItem
							extension={extension}
							checked={preferences[extension.preferenceKey]}
							onChange={(value) =>
								updatePreference(extension.preferenceKey, value)
							}
						/>
					</div>
				))}
			</div>

			<h3>{__("Additional CSS", "blocklayouts")}</h3>
			<div
				className="blocklayouts-dashboard__grid"
				style={{ marginBottom: "32px" }}
			>
				{ADDITIONAL_CSS_EXTENSIONS.map((extension) => (
					<div
						key={extension.preferenceKey}
						className="blocklayouts-dashboard__card"
					>
						<ExtensionItem
							extension={extension}
							checked={preferences[extension.preferenceKey]}
							onChange={(value) =>
								updatePreference(extension.preferenceKey, value)
							}
						/>
					</div>
				))}
			</div>

			<h3>{__("Effects", "blocklayouts")}</h3>
			<div className="blocklayouts-dashboard__grid">
				{EFFECTS_EXTENSIONS.map((extension) => (
					<div
						key={extension.preferenceKey}
						className="blocklayouts-dashboard__card"
					>
						<ExtensionItem
							extension={extension}
							checked={preferences[extension.preferenceKey]}
							onChange={(value) =>
								updatePreference(extension.preferenceKey, value)
							}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default Extensions;
