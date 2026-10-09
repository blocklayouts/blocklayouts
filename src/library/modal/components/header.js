/**
 * WordPress dependencies
 */
import { Flex, FlexBlock, Button, FlexItem } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { external } from "@wordpress/icons";
import { store as coreStore, useEntityRecord } from "@wordpress/core-data";
import { useDispatch } from "@wordpress/data";
/*
 * Internal dependencies
 */
import { DropdownMenu } from "../../../dashboard/components/dropdown";
import { AccountSkeleton } from "../../../utils/skeleton";

export const Header = ({
	tabs = [],
	activeTab,
	onTabChange,
	isDropdownOpen,
	onDropdownToggle,
	openPreferences,
}) => {
	const licenseData = useEntityRecord("blocklayouts/v1", "license");
	const license = licenseData?.record?.data;
	const isActiveLicense = license?.is_active;
	const licenseLoading = !licenseData.hasResolved;

	return (
		<Flex gap={2}>
			<FlexBlock>
				<div className="blocklayouts-modal__tabs">
					{tabs.map((tab) => (
						<Button
							className={`blocklayouts-modal__tabs-button ${
								activeTab === tab.value ? "is-selected" : ""
							}`}
							onClick={() => onTabChange(tab.value)}
							disabled={tab.disabled}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
						>
							{tab.label}
						</Button>
					))}
				</div>
			</FlexBlock>
			<FlexItem>
				{licenseLoading ? (
					<AccountSkeleton />
				) : (
					<DropdownMenu
						license={license}
						isOpen={isDropdownOpen}
						onToggle={onDropdownToggle}
						openPreferences={openPreferences}
						isActiveLicense={isActiveLicense}
						licenseLoading={licenseLoading}
					/>
				)}
			</FlexItem>
		</Flex>
	);
};
