/**
 * WordPress dependencies
 */
import { Flex, FlexBlock, Button, FlexItem } from "@wordpress/components";

/*
 * Internal dependencies
 */
import { DropdownMenu } from "./dropdown";

export const Header = ({
	tabs = [],
	activeTab,
	onTabChange,
	isDropdownOpen,
	onDropdownToggle,
	openPreferences,
}) => {
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
				<DropdownMenu
					isOpen={isDropdownOpen}
					onToggle={onDropdownToggle}
					openPreferences={openPreferences}
				/>
			</FlexItem>
		</Flex>
	);
};
