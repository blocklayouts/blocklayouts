/**
 * WordPress dependencies
 */
import { Flex, FlexItem, Button, Spinner } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { external } from "@wordpress/icons";
import { store as coreStore, useEntityRecord } from "@wordpress/core-data";

/*
 * Internal dependencies
 */
import { AccountSkeleton } from "../../utils/skeleton";
import { DropdownMenu } from "./dropdown";

const Header = ({ activeTab }) => {
	const licenseData = useEntityRecord("blocklayouts/v1", "license");
	const license = licenseData?.record?.data;
	const isActiveLicense = license?.is_active;
	const licenseLoading = !licenseData.hasResolved;

	const onToggle = () => {
		const doNothing = "";
	};

	const tabInfo = {
		home: {
			title: __("Home", "blocklayouts"),
			description: __(
				"An overview of Blocklayouts features to enhance and customize your site.",
				"blocklayouts",
			),
		},
		blocks: {
			title: __("Blocks", "blocklayouts"),
			description: __(
				"Enable or disable custom blocks. Disabled blocks will not appear in the block inserter.",
				"blocklayouts",
			),
		},
		extensions: {
			title: __("Extensions", "blocklayouts"),
			description: __(
				"Enable or disable extensions. Disabled extensions will not appear in block inspector controls.",
				"blocklayouts",
			),
		},
		preferences: {
			title: __("Preferences", "blocklayouts"),
			description: __(
				"Customize your Blocklayouts editor experience.",
				"blocklayouts",
			),
		},
	};

	const currentTab = tabInfo[activeTab] || tabInfo.home;

	return (
		<div className="blocklayouts-dashboard__header">
			<Flex justify="space-between" align="center" gap={4}>
				<FlexItem>
					<h2>{currentTab.title}</h2>
					{/* 
					<p className="blocklayouts-dashboard__header-description">
						{currentTab.description}
					</p> */}
				</FlexItem>

				<FlexItem>
					<Flex gap={4}>
						{licenseLoading ? (
							<AccountSkeleton />
						) : (
							<>
								{/* {!isPremium && (
									<Button
										variant="primary"
										href="https://blocklayouts.com/pricing/"
										target="_blank"
										rel="noopener noreferrer"
										icon={external}
										iconPosition="right"
										iconSize={20}
										__next40pxDefaultSize
									>
										{__("Upgrade to Pro", "blocklayouts")}
									</Button>
								)} */}
								<DropdownMenu
									license={license}
									isActiveLicense={isActiveLicense}
									licenseLoading={licenseLoading}
									onToggle={onToggle}
								/>
							</>
						)}
					</Flex>
				</FlexItem>
			</Flex>
		</div>
	);
};

export default Header;
