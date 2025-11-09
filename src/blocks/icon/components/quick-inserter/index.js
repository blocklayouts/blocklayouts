/**
 * External dependencies
 */
import { isEmpty } from "lodash";

/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { Button, Flex, SearchControl } from "@wordpress/components";
import { useState } from "@wordpress/element";
import { Icon } from "@wordpress/icons";

/**
 * Internal dependencies
 */
import { icons, searchIcons } from "../../../../utils/icons";
import "./editor.scss";

export default function QuickInserter({
	setIcon,
	onClose,
	openModal,
	withCustomSvg = true,
}) {
	const [searchInput, setSearchInput] = useState("");

	let shownIcons = [];

	if (searchInput) {
		shownIcons = searchIcons(searchInput);
	}

	if (!searchInput) {
		// See if there is a default icon(s) set.
		const defaultIcons = icons.filter((i) => i.isDefault) ?? [];

		// Get the rest of the icons in the type excluding the default ones.
		const nonDefaultIcons = icons.filter((i) => !i.isDefault) ?? [];

		// First show the default icons, then the rest.
		shownIcons = shownIcons.concat(defaultIcons, nonDefaultIcons);
	}

	// Only want to display 8 icons.
	shownIcons = shownIcons.slice(0, 8);

	const searchResults = (
		<div className="blocklayouts-icon-settings__icons">
			{shownIcons.map((icon) => {
				let renderedIcon = icon.icon;

				return (
					<Button
						key={`icon-${icon.name}`}
						label={__(icon.title)}
						className={`blocklayouts-icon-settings__icons-button`}
						onClick={() => {
							setIcon(icon);
							onClose();
						}}
					>
						<Icon size={26} icon={renderedIcon} />
						{/* <span className="icon-title">{icon.title}</span> */}
					</Button>
				);
			})}
		</div>
	);

	const noResults = <p>{__("No results found.")}</p>;

	return (
		<div
			className="blocklayouts-icon-settings__quick-inserter"
			style={{ width: "280px", padding: "8px" }}
		>
			<SearchControl
				label={__("Search icons")}
				hideLabelFromVision={true}
				value={searchInput}
				onChange={(value) => setSearchInput(value)}
				__nextHasNoMarginBottom
			/>
			<div className="blocklayouts-icon-settings__quick-inserter-results">
				{[
					isEmpty(shownIcons) && noResults,
					!isEmpty(shownIcons) && searchResults,
				]}
			</div>
			<Flex gap={1}>
				<Button
					style={{ flex: "1", justifyContent: "center" }}
					variant="primary"
					onClick={() => {
						openModal("library");
						onClose();
					}}
					__next40pxDefaultSize
				>
					{__("Browse all")}
				</Button>
				{withCustomSvg && (
					<Button
						style={{ flex: "1", justifyContent: "center" }}
						variant="secondary"
						onClick={() => {
							openModal("custom");
							onClose();
						}}
						__next40pxDefaultSize
					>
						{__("Custom SVG")}
					</Button>
				)}
			</Flex>
		</div>
	);
}
