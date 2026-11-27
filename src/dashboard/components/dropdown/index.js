/*
 * WordPress dependencies
 */
import { useCallback } from "@wordpress/element";
import {
	DropdownMenu as WPDropdownMenu,
	MenuGroup,
	MenuItem,
	Navigator,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { help, external, chevronRight } from "@wordpress/icons";
import { store as coreStore } from "@wordpress/core-data";
import { useDispatch } from "@wordpress/data";
import { useState } from "@wordpress/element";
/*
 * Internal dependencies
 */
import {
	AccountIconCircle,
	PremiumAccountIcon,
	BlocklayoutsIcon,
} from "../../../utils/icons";
import "./editor.scss";

// import { ActivationForm } from "./activation-form";
import { UpgradeScreen } from "./screen/upgrade";
import { ActivationScreen } from "./screen/activate";
import { LicenseScreen } from "./screen/license";

// A wp-admin notice (white box, colored left border), styled by core's
// common.css, which loads on every admin screen including the editor.
const AdminNotice = ({ status, children, onDismiss }) => (
	<div
		className={`notice notice-${status} inline is-dismissible blocklayouts-user-account-dropdown__notice`}
		role={status === "error" ? "alert" : "status"}
	>
		<p>{children}</p>
		<button type="button" className="notice-dismiss" onClick={onDismiss}>
			<span className="screen-reader-text">
				{__("Dismiss this notice.", "blocklayouts")}
			</span>
		</button>
	</div>
);

// External links
const EXTERNAL_LINKS = {
	account: "https://blocklayouts.com/my-account/",
	premium: "https://blocklayouts.com/premium/",
	support: "https://blocklayouts.com/support/",
	documentation: "https://blocklayouts.com/docs/",
};

export const DropdownMenu = ({
	license,
	isActiveLicense,
	licenseLoading,
	isOpen,
	onToggle,
}) => {
	const [isLoading, setIsLoading] = useState(false);
	// Message shown at the top of the dropdown: { status, message }.
	const [notice, setNotice] = useState(null);

	const openExternalLink = useCallback((url) => {
		window.open(url, "_blank", "noopener,noreferrer");
	}, []);

	const { saveEntityRecord, invalidateResolution } = useDispatch(coreStore);

	// The license record has no ID, so after saving, load it again from the
	// server. Every screen using useEntityRecord( "blocklayouts/v1", "license" )
	// then shows the new state without a page refresh.
	const refreshLicense = useCallback(() => {
		invalidateResolution("getEntityRecord", ["blocklayouts/v1", "license"]);
		invalidateResolution("getEntityRecord", [
			"blocklayouts/v1",
			"license",
			undefined,
		]);
	}, [invalidateResolution]);

	/**
	 * Save the license (activate or deactivate).
	 *
	 * @param {Object} record         Request body.
	 * @param {string} successMessage Message shown when it worked.
	 * @param {string} errorMessage   Fallback message when it didn't.
	 * @return {Promise<boolean>} Whether it worked.
	 */
	const saveLicense = useCallback(
		async (record, successMessage, errorMessage) => {
			setIsLoading(true);
			setNotice(null);
			let ok = false;
			try {
				const response = await saveEntityRecord(
					"blocklayouts/v1",
					"license",
					{
						...record,
						nonce: window.blocklayouts_config?.api?.nonce || "",
					},
					{ throwOnError: true },
				);
				ok = !!response?.success;
				setNotice(
					ok
						? { status: "success", message: successMessage }
						: { status: "error", message: response?.error || errorMessage },
				);
			} catch (error) {
				setNotice({ status: "error", message: error?.message || errorMessage });
			} finally {
				refreshLicense();
				setIsLoading(false);
			}
			return ok;
		},
		[saveEntityRecord, refreshLicense],
	);

	const deactivateLicense = useCallback(
		() =>
			saveLicense(
				{
					action: "deactivate",
					license_key: license?.key,
					instance_id: license?.instance?.id,
				},
				__("License deactivated successfully.", "blocklayouts"),
				__("Failed to deactivate the license.", "blocklayouts"),
			),
		[saveLicense, license],
	);

	const activateLicense = useCallback(
		(key) =>
			saveLicense(
				{ action: "activate", license_key: key },
				__("You're all set! Your license is now active.", "blocklayouts"),
				__("Failed to activate the license.", "blocklayouts"),
			),
		[saveLicense],
	);

	const NavigatorInitialPath = isActiveLicense ? "/" : "/upgrade";
	const label = isActiveLicense
		? __("Account", "blocklayouts")
		: __("Sign In", "blocklayouts");

	const DropdownButton = isActiveLicense
		? PremiumAccountIcon
		: AccountIconCircle;

	return (
		<WPDropdownMenu
			label={label}
			icon={DropdownButton}
			open={isOpen}
			onToggle={() => {
				if (isOpen) {
					setNotice(null);
				}
				onToggle(!isOpen);
			}}
		>
			{() => (
				<div
					className="blocklayouts-user-account-dropdown__content"
					style={{ minWidth: "280px" }}
				>
					{notice && (
						<AdminNotice
							status={notice.status}
							onDismiss={() => setNotice(null)}
						>
							{notice.message}
						</AdminNotice>
					)}
					<Navigator initialPath={NavigatorInitialPath}>
						<Navigator.Screen path="/">
							<MenuGroup>
								<Navigator.Button
									__next40pxDefaultSize
									path="/license"
									className="components-menu-item__button"
									icon={chevronRight}
									iconPosition="right"
								>
									<span className="components-menu-item__item">
										{__("License", "blocklayouts")}
									</span>
								</Navigator.Button>
								<MenuItem
									disabled={true}
								>
									{__("Favorites (Coming soon)", "blocklayouts")}
								</MenuItem>
							</MenuGroup>
							<MenuGroup>
								<MenuItem
									onClick={() => openExternalLink(EXTERNAL_LINKS.support)}
									icon={help}
								>
									{__("Support", "blocklayouts")}
								</MenuItem>
								<MenuItem
									onClick={() => openExternalLink(EXTERNAL_LINKS.documentation)}
									icon={external}
								>
									{__("Documentation", "blocklayouts")}
								</MenuItem>
							</MenuGroup>
						</Navigator.Screen>

						<Navigator.Screen path="/upgrade">
							<UpgradeScreen icon={BlocklayoutsIcon} />
						</Navigator.Screen>

						<Navigator.Screen path="/upgrade/activate">
							<ActivationScreen
								activateLicense={activateLicense}
								isLoading={licenseLoading || isLoading}
							/>
						</Navigator.Screen>

						<Navigator.Screen path="/license">
							<LicenseScreen
								license={license}
								deactivateLicense={deactivateLicense}
								isLoading={licenseLoading || isLoading}
							/>
						</Navigator.Screen>
					</Navigator>
				</div>
			)}
		</WPDropdownMenu>
	);
};
