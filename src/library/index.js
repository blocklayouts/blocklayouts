/**
 * WordPress dependencies
 */
import { useState } from "@wordpress/element";
import { ToolbarButton } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

/**
 * Internal dependencies
 */
import { PatternLibraryModal } from "./modal";
import { BlocklayoutsIcon } from "../utils/icons";
import { SettingsProvider } from "./hooks/use-settings";

// Create a custom slot for the toolbar button
export const Library = ({ openPreferences }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<>
			<ToolbarButton
				variant="tertiary"
				size="compact"
				onClick={() => setIsModalOpen(true)}
				icon={BlocklayoutsIcon}
				label={__("BlockLayouts Pattern Library", "blocklayouts")}
				showTooltip={true}
				style={{
					backgroundColor: "transparent",
				}}
			/>
			{isModalOpen && (
				<SettingsProvider>
					<PatternLibraryModal
						isOpen={isModalOpen}
						onClose={() => setIsModalOpen(false)}
						openPreferences={openPreferences}
					/>
				</SettingsProvider>
			)}
		</>
	);
};
