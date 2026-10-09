/*
 * WordPress dependencies
 */
import { useCallback } from "@wordpress/element";
import {
	DropdownMenu as WPDropdownMenu,
	MenuGroup,
	MenuItem,
	Navigator,
	useNavigator,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { help, external, chevronRight } from "@wordpress/icons";
import { store as coreStore } from "@wordpress/core-data";
import { useDispatch } from "@wordpress/data";
import { useState } from "@wordpress/element";
import { store as noticesStore } from "@wordpress/notices";
/*
 * Internal dependencies
 */
import { useNotice } from "../../../context/hooks";
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

	const { setNotice } = useNotice();
	const { goTo } = useNavigator();

	const openExternalLink = useCallback((url) => {
		window.open(url, "_blank", "noopener,noreferrer");
	}, []);

	const { editEntityRecord, saveEntityRecord } = useDispatch(coreStore);
	const { createNotice } = useDispatch(noticesStore);

	const deactivateLicense = useCallback(async () => {
		try {
			setIsLoading(true);

			const record = {
				action: "deactivate",
				license_key: license.key,
				instance_id: license.instance.id,
				nonce: window.blocklayouts_config?.api?.nonce || "",
			};

			const response = await saveEntityRecord(
				"blocklayouts/v1",
				"license",
				record,
			);

			if (response?.success) {
				createNotice("success", "License deactivated successfully!", {
					context: "blocklayouts",
					isDismissible: true,
				});
			} else {
				createNotice("error", "Failed to deactivate license", {
					context: "blocklayouts",
					isDismissible: true,
				});
				console.error(response.error || "Failed to deactivate license");
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
			onToggle(false);
		}
	}, [license]);

	const activateLicense = useCallback(async (key) => {
		try {
			setIsLoading(true);

			const record = {
				action: "activate",
				license_key: key,
				nonce: window.blocklayouts_config?.api?.nonce || "",
			};

			const response = await saveEntityRecord(
				"blocklayouts/v1",
				"license",
				record,
			);

			if (response?.success) {
				createNotice("success", "You're all set! Your license is now active!", {
					context: "blocklayouts",
					isDismissible: true,
				});
			} else {
				createNotice("error", "Failed to activate license", {
					context: "blocklayouts",
					isDismissible: true,
				});
				console.error(response.error || "Failed to activate license");
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
			onToggle(false);
		}
	}, []);

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
			onToggle={() => onToggle(!isOpen)}
		>
			{({ onClose }) => (
				<div
					className="blocklayouts-user-account-dropdown__content"
					style={{ minWidth: "280px" }}
				>
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
