/*
 * WordPress dependencies
 */
import { useState, useCallback } from "@wordpress/element";
import {
	Button,
	Flex,
	useNavigator,
	Navigator,
	MenuGroup,
	MenuItem,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
import { chevronLeft } from "@wordpress/icons";

/*
 * Internal dependencies
 */
import { useSettings } from "../../../../hooks";

// Suffixs
const formatDate = (dateString) => {
	if (!dateString) return "Never";
	return new Date(dateString).toLocaleDateString();
};

const LicenseStatus = ({ status }) => {
	if (!status) return null;
	return (
		<span
			className={`license-status ${status}`}
			style={{ textTransform: "capitalize" }}
		>
			{status}
		</span>
	);
};

const Usage = ({ usage, limit }) => {
	const usageLimit = limit || "Unlimited";

	return (
		<span className="license-details-item">
			{usage}/{usageLimit}
		</span>
	);
};

const CreatedAt = ({ date }) => (
	<span className="license-details-item">{formatDate(date)}</span>
);

const ExpiresAt = ({ date }) => (
	<span className="license-details-item">{formatDate(date)}</span>
);

export const LicenseScreen = ({ license, clearLicense }) => {
	const { showNotice, dismissNotice } = useSettings();
	const { instance, license_key } = license;
	const [isDeactivating, setIsDeactivating] = useState(false);
	const config = window.blocklayouts_config || {};

	const { goTo } = useNavigator();

	const deactivateLicense = useCallback(async () => {
		if (
			!window.confirm(
				__("Are you sure you want to deactivate your license?", "blocklayouts"),
			)
		) {
			return;
		}

		if (!license) return;

		setIsDeactivating(true);
		dismissNotice(); // Clear any existing notices

		try {
			if (
				license_key?.status === "active" &&
				instance?.id &&
				license_key?.key
			) {
				const response = await apiFetch({
					path: "/blocklayouts/v1/license/deactivate",
					method: "POST",
					data: {
						license_key: license_key.key,
						instance_id: instance.id,
						nonce: config.api.nonce,
					},
				});

				if (response.success) {
					showNotice({
						type: "success",
						message: __("License deactivated successfully!", "blocklayouts"),
						variant: "inline",
						isDismissible: true,
					});

					clearLicense();
					goTo("/upgrade");
				} else {
					showNotice({
						type: "error",
						message:
							response.error ||
							__("Failed to deactivate license!", "blocklayouts"),
						variant: "inline",
						isDismissible: true,
					});
				}
			}
		} catch (error) {
			console.error("License deactivation error:", error);
			showNotice({
				type: "error",
				message:
					error.message ||
					__("Failed to deactivate license. Please try again.", "blocklayouts"),
				variant: "inline",
				isDismissible: true,
			});
		} finally {
			setIsDeactivating(false);
		}
	}, [license, showNotice, dismissNotice, clearLicense, goTo]);

	return (
		<div>
			<Navigator.BackButton
				style={{ marginTop: "8px", marginLeft: "8px" }}
				size="small"
				icon={chevronLeft}
				iconSize={20}
				__next40pxDefaultSize
			/>

			<MenuGroup label={__("License Details")}>
				<MenuItem suffix={<LicenseStatus status={license_key.status} />}>
					{__("Status", "blocklayouts")}
				</MenuItem>
				<MenuItem suffix={<CreatedAt date={license_key.created_at} />}>
					{__("Created", "blocklayouts")}
				</MenuItem>
				<MenuItem suffix={<ExpiresAt date={license_key.expires_at} />}>
					{__("Expires", "blocklayouts")}
				</MenuItem>
				<MenuItem
					suffix={
						<Usage
							usage={license_key.activation_usage}
							limit={license_key.activation_limit}
						/>
					}
				>
					{__("Usage", "blocklayouts")}
				</MenuItem>
			</MenuGroup>
			<MenuGroup>
				<Flex justify="start" style={{ width: "auto" }}>
					<Button
						isDestructive={true}
						onClick={deactivateLicense}
						disabled={isDeactivating}
						__next40pxDefaultSize
					>
						{isDeactivating
							? __("Deactivating...", "blocklayouts")
							: __("Deactivate License", "blocklayouts")}
					</Button>
				</Flex>
			</MenuGroup>
		</div>
	);
};
