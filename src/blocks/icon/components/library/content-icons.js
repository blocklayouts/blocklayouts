/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import {
	Flex,
	FlexItem,
	SearchControl,
	Icon,
	Button,
} from "@wordpress/components";

/**
 * ContentIcons Component
 * Displays the icon library grid with search functionality
 */
export const ContentIcons = ({
	searchTerm,
	setSearchTerm,
	filteredIcons,
	currentIconName,
	handleIconSelect,
}) => {
	return (
		<>
			<Flex>
				<FlexItem>
					<SearchControl
						value={searchTerm}
						onChange={setSearchTerm}
						label={__("Search icons", "blocklayouts")}
						placeholder={__("Search...", "blocklayouts")}
						className="blocklayouts-modal__search"
						size="compact"
						style={{
							padding: "16px 0",
						}}
					/>
				</FlexItem>
			</Flex>

			{filteredIcons.length === 0 ? (
				<p>{__("No icons found!", "blocklayouts")}</p>
			) : (
				<div className="blocklayouts-modal__icons">
					{filteredIcons.map((iconData) => (
						<Button
							key={iconData.name}
							className={`blocklayouts-modal__icons-button ${
								currentIconName === iconData.name ? "is-selected" : ""
							}`}
							onClick={() => handleIconSelect(iconData)}
						>
							<Icon icon={iconData.icon} size={32} />
							<span className="icon-title">{iconData.title}</span>
						</Button>
					))}
				</div>
			)}
		</>
	);
};
