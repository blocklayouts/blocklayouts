/*
 * WordPress dependencies
 */
import {
	Button,
	Flex,
	useNavigator,
	Navigator,
	MenuGroup,
	MenuItem,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { chevronLeft } from "@wordpress/icons";

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

export const LicenseScreen = ({ license, deactivateLicense, isLoading }) => {
	const { license_key } = license;

	if (!license_key) return null;

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
						disabled={isLoading}
						__next40pxDefaultSize
					>
						{isLoading
							? __("Deactivating...", "blocklayouts")
							: __("Deactivate License", "blocklayouts")}
					</Button>
				</Flex>
			</MenuGroup>
		</div>
	);
};
