/**
 * WordPress dependencies
 */
import { addFilter } from "@wordpress/hooks";
import { Modal } from "@wordpress/components";
import { registerPlugin } from "@wordpress/plugins";
import { PluginMoreMenuItem } from "@wordpress/editor";
import { __ } from "@wordpress/i18n";
import { useState, createRoot } from "@wordpress/element";
import { dispatch } from "@wordpress/data";

/**
 * Add our custom entities.
 *
 * @since 0.2.0
 */
dispatch("core").addEntities([
	{
		label: __("Blocklayouts License", "blocklayouts"),
		kind: "blocklayouts/v1",
		name: "license",
		baseURL: "/blocklayouts/v1/license",
	},
	{
		label: __("Blocklayouts Patterns", "blocklayouts"),
		kind: "blocklayouts/v1",
		name: "patterns",
		baseURL: "/blocklayouts/v1/patterns",
	},
	{
		label: __("Blocklayouts Patterns Categories", "blocklayouts"),
		kind: "blocklayouts/v1",
		name: "patterns-categories",
		baseURL: "/blocklayouts/v1/patterns/categories",
	},
	{
		label: __("Blocklayouts Templates", "blocklayouts"),
		kind: "blocklayouts/v1",
		name: "page-templates",
		baseURL: "/blocklayouts/v1/page-templates",
	},

	{
		label: __("Blocklayouts Page Templates Categories", "blocklayouts"),
		kind: "blocklayouts/v1",
		name: "page-templates-categories",
		baseURL: "/blocklayouts/v1/page-templates/categories",
	},
]);

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
				{__("Preferences", "blocklayouts")}
			</PluginMoreMenuItem>
			{isModalOpen && (
				<Modal
					overlayClassName="blocklayouts-modal__overlay"
					title={__("Blocklayouts Preferences", "blocklayouts")}
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
