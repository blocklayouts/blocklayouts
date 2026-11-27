/*
 * WordPress dependencies
 */
import { useState, useCallback } from "@wordpress/element";
import {
	Button,
	TextControl,
	Flex,
	useNavigator,
	Navigator,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { chevronLeft } from "@wordpress/icons";

/*
 * Internal dependencies
 */

export const ActivationScreen = ({ activateLicense, isLoading }) => {
	const [licenseKey, setLicenseKey] = useState("");
	const { goTo } = useNavigator();

	// Stay in the dropdown and show the license details once it's active.
	const submit = async () => {
		const key = licenseKey.trim();
		if (!key || isLoading) {
			return;
		}
		if (await activateLicense(key)) {
			setLicenseKey("");
			goTo("/license");
		}
	};

	return (
		<div style={{ padding: "16px" }}>
			<Navigator.BackButton
				size="small"
				icon={chevronLeft}
				__next40pxDefaultSize
			/>
			<p style={{ color: "#757575" }}>
				{__(
					"Please enter the license key that you received in the email right after the purchase:",
					"blocklayouts",
				)}
			</p>

			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={__("License Key", "blocklayouts")}
				value={licenseKey}
				onChange={(value) => setLicenseKey(value)}
				placeholder={__("XXXX-XXXX-XXXX-XXXX", "blocklayouts")}
				// readOnly, not disabled: a disabled field loses focus, which
				// closes the dropdown.
				readOnly={isLoading}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						submit();
					}
				}}
			/>
			<Button
				style={{
					marginTop: "16px",
				}}
				variant="link"
				href="https://blocklayouts.com/docs/getting-started/license-key"
				target="a"
				__next40pxDefaultSize
			>
				{__("Can't find your key?", "blocklayouts")}
			</Button>

			<Flex justify="flex-end" style={{ marginTop: "16px" }}>
				<Button
					variant="primary"
					onClick={submit}
					isBusy={isLoading}
					disabled={!licenseKey.trim() || isLoading}
					accessibleWhenDisabled
					__next40pxDefaultSize
				>
					{isLoading
						? __("Activating...", "blocklayouts")
						: __("Activate License", "blocklayouts")}
				</Button>
			</Flex>
		</div>
	);
};
