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
import apiFetch from "@wordpress/api-fetch";
import { chevronLeft } from "@wordpress/icons";

/*
 * Internal dependencies
 */
import { useSettings } from "../../../../hooks";

export const ActivationScreen = ({ close }) => {
	const [licenseKey, setLicenseKey] = useState("");
	const [isValidating, setIsValidating] = useState(false);
	const [buttonText, setButtonText] = useState("Activate License");
	const { updateLicense, showNotice, dismissNotice } = useSettings();
	const { goTo } = useNavigator();

	const config = window.blocklayouts_config || {};
	const instanceName = config.instance_name || "";

	const onLicenseKeyChange = useCallback(
		(value) => {
			setLicenseKey(value);
			dismissNotice(); // Clear any existing notices when user starts typing
		},
		[dismissNotice],
	);

	const activateLicense = useCallback(async () => {
		const trimmedKey = licenseKey.trim();

		if (!trimmedKey) {
			showNotice({
				type: "error",
				message: __("Please enter a license key!", "blocklayouts"),
				variant: "inline",
				isDismissible: true,
			});
			return;
		}

		setIsValidating(true);
		setButtonText(__("Validating...", "blocklayouts"));
		dismissNotice(); // Clear any existing notices

		try {
			setButtonText(__("Activating...", "blocklayouts"));

			// If validation passes, proceed with activation
			const response = await apiFetch({
				path: "/blocklayouts/v1/license/activate",
				method: "POST",
				data: {
					license_key: trimmedKey,
					nonce: config.api.nonce,
				},
			});

			if (response.success) {
				showNotice({
					type: "success",
					message: __(
						"You're all set! Your license is now active!",
						"blocklayouts",
					),
					variant: "modal",
					isDismissible: true,
				});

				setLicenseKey("");
				updateLicense(response.data);

				goTo("/");
				close();
			} else {
				showNotice({
					type: "error",
					message:
						response?.message ||
						__("License activation failed!", "blocklayouts"),
					variant: "inline",
					isDismissible: true,
				});
			}
		} catch (error) {
			console.error("License activation error:", error);
			showNotice({
				type: "error",
				message:
					error.message ||
					__("Failed to activate license. Please try again.", "blocklayouts"),
				variant: "inline",
				isDismissible: true,
			});
		} finally {
			setIsValidating(false);
			setButtonText(__("Activate License", "blocklayouts"));
		}
	}, [
		licenseKey,
		instanceName,
		showNotice,
		dismissNotice,
		updateLicense,
		goTo,
	]);

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
				onChange={onLicenseKeyChange}
				placeholder={__("XXXX-XXXX-XXXX-XXXX", "blocklayouts")}
				disabled={isValidating}
				onKeyDown={(e) => {
					if (e.key === "Enter" && !isValidating && licenseKey.trim()) {
						activateLicense();
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
					onClick={activateLicense}
					isBusy={isValidating}
					disabled={!licenseKey.trim() || isValidating}
					__next40pxDefaultSize
				>
					{buttonText}
				</Button>
			</Flex>
		</div>
	);
};
