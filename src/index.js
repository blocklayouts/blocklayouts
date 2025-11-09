/**
 * WordPress dependencies
 */
import { addFilter } from "@wordpress/hooks";
import { Modal } from "@wordpress/components";
import { registerPlugin } from "@wordpress/plugins";
import { PluginMoreMenuItem } from "@wordpress/editor";
import { __ } from "@wordpress/i18n";
import { useState, createRoot } from "@wordpress/element";

/**
 * Internal dependencies
 */
import { BlocklayoutsIcon } from "./utils/icons";
import { PreferencesPanel } from "./preferences";
import { Library } from "./library";
import "./extensions";
import "./variations";
import "./editor.scss";

const Blocklayouts = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	let buttonContainer = document.querySelector(
		".blocklayouts-pattern-library__toolbar-button",
	);

	const injectButton = () => {
		const documentTools = document.querySelector(
			".editor-document-tools__left",
		);
		if (!documentTools) return;

		// Avoid duplicate injection
		if (buttonContainer) return;

		// Create button container
		buttonContainer = document.createElement("div");
		buttonContainer.className = "blocklayouts-pattern-library__toolbar-button";

		const root = createRoot(buttonContainer);

		root.render(<Library openPreferences={() => setIsModalOpen(true)} />);

		documentTools.parentNode.insertBefore(
			buttonContainer,
			documentTools.nextSibling,
		);
	};

	injectButton();

	return (
		<>
			<PluginMoreMenuItem
				onClick={() => setIsModalOpen(true)}
				icon={BlocklayoutsIcon}
			>
				{__("Blocklayouts preferences", "blocklayouts")}
			</PluginMoreMenuItem>
			{isModalOpen && (
				<Modal
					overlayClassName="blocklayouts-modal__overlay"
					title={__("Blocklayouts preferences", "blocklayouts")}
					onRequestClose={() => setIsModalOpen(false)}
					size="large"
				>
					<PreferencesPanel />
				</Modal>
			)}
		</>
	);
};

registerPlugin("blocklayouts-plugin", {
	render: Blocklayouts,
});
