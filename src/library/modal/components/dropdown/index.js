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

/*
 * Internal dependencies
 */
import {
	AccountIconCircle,
	PremiumAccountIcon,
	BlocklayoutsIcon,
} from "../../../../utils/icons";
import { useSettings, Notices } from "../../../hooks";
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

export const DropdownMenu = ({ isOpen, onToggle, openPreferences }) => {
	const { license, clearLicense } = useSettings();

	const openExternalLink = useCallback((url) => {
		window.open(url, "_blank", "noopener,noreferrer");
	}, []);

	const NavigatorInitialPath = license?.is_active ? "/" : "/upgrade";
	const label = license?.is_active
		? __("Account", "blocklayouts")
		: __("Sign In", "blocklayouts");

	const DropdownButton = license?.is_active
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
					{/* inline notice - appears at the top of the form */}
					<Notices variant="inline" />

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
								<MenuItem onClick={openPreferences}>
									{__("Preferences", "blocklayouts")}
								</MenuItem>
								<MenuItem
									disabled={true}
									onClick={() => console.log("Coming soon")}
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
							<ActivationScreen close={() => onToggle(false)} />
						</Navigator.Screen>

						<Navigator.Screen path="/license">
							<LicenseScreen license={license} clearLicense={clearLicense} />
						</Navigator.Screen>
					</Navigator>
				</div>
			)}
		</WPDropdownMenu>
	);
};
